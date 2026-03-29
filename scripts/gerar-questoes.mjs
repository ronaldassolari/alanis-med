// Gera 2000 questões de Clínica Médica via OpenRouter e insere no banco Neon
import pg from 'pg'
import { randomBytes } from 'crypto'

const { Client } = pg

const DATABASE_URL = "postgresql://neondb_owner:npg_GnEDAg0Sabr3@ep-sparkling-poetry-anak2w5l-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
const ANTHROPIC_API_KEY = "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"

const cuid = () => 'c' + randomBytes(11).toString('base64url').toLowerCase().slice(0, 23)

const ESPECIALIDADES = [
  { nome: 'Cardiologia', disciplina: 'Clínica Médica', temas: ['Insuficiência Cardíaca', 'Síndromes Coronarianas', 'Arritmias', 'Hipertensão Arterial', 'Cardiopatias Valvares'], qtd: 200 },
  { nome: 'Pneumologia', disciplina: 'Clínica Médica', temas: ['DPOC', 'Asma', 'Pneumonias', 'Tromboembolismo Pulmonar', 'Tuberculose'], qtd: 150 },
  { nome: 'Gastroenterologia', disciplina: 'Clínica Médica', temas: ['Doença Hepática', 'Doenças Inflamatórias Intestinais', 'Pancreatite', 'Hemorragia Digestiva', 'Dispepsia e DRGE'], qtd: 200 },
  { nome: 'Nefrologia', disciplina: 'Clínica Médica', temas: ['Injúria Renal Aguda', 'Doença Renal Crônica', 'Distúrbios Hidroeletrolíticos', 'Glomerulopatias', 'Hipertensão e Rim'], qtd: 150 },
  { nome: 'Endocrinologia', disciplina: 'Clínica Médica', temas: ['Diabetes Mellitus', 'Tireoide', 'Adrenal', 'Hipófise', 'Obesidade e Síndrome Metabólica'], qtd: 150 },
  { nome: 'Infectologia', disciplina: 'Clínica Médica', temas: ['HIV/AIDS', 'Sepse', 'Meningites', 'Endocardite Infecciosa', 'Doenças Tropicais'], qtd: 200 },
  { nome: 'Neurologia', disciplina: 'Clínica Médica', temas: ['AVC', 'Epilepsia', 'Cefaleia', 'Doenças Desmielinizantes', 'Neuropatias'], qtd: 150 },
  { nome: 'Reumatologia', disciplina: 'Clínica Médica', temas: ['Artrite Reumatoide', 'Lúpus Eritematoso Sistêmico', 'Espondiloartropatias', 'Gota', 'Vasculites'], qtd: 150 },
  { nome: 'Hematologia', disciplina: 'Clínica Médica', temas: ['Anemias', 'Leucemias', 'Linfomas', 'Coagulopatias', 'Trombocitopenias'], qtd: 100 },
  { nome: 'Medicina de Emergência', disciplina: 'Clínica Médica', temas: ['PCR e Ressuscitação', 'Choque', 'Intoxicações', 'Emergências Hipertensivas', 'Cetoacidose Diabética'], qtd: 150 },
]

async function gerarQuestoes(especialidade, tema, quantidade) {
  const prompt = `Você é um professor especialista em preparação para residência médica no Brasil.

Gere exatamente ${quantidade} questões de múltipla escolha sobre ${especialidade} - ${tema}, no estilo das provas de residência médica brasileira (USP, UNIFESP, FMUSP, ENARE).

REGRAS OBRIGATÓRIAS:
- Cada questão deve ter enunciado clínico realista (paciente com queixa, exames, história)
- 5 alternativas (A, B, C, D, E)
- Uma única resposta correta
- Explicação detalhada do gabarito
- Dificuldade variada: 40% fácil, 40% médio, 20% difícil
- Em português brasileiro
- NÃO numere as questões

Retorne APENAS um array JSON válido, sem texto adicional:
[
  {
    "enunciado": "Paciente de 65 anos...",
    "opcaoA": "...",
    "opcaoB": "...",
    "opcaoC": "...",
    "opcaoD": "...",
    "opcaoE": "...",
    "gabarito": "A",
    "explicacao": "A alternativa correta é A porque...",
    "dificuldade": "medio"
  }
]`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    })
  })

  if (!res.ok) throw new Error(`Anthropic error: ${res.status} ${await res.text()}`)
  const data = await res.json()
  const content = data.content[0].text.trim()

  // Extrair JSON do conteúdo
  const jsonMatch = content.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('JSON não encontrado na resposta')
  return JSON.parse(jsonMatch[0])
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  console.log('✅ Conectado ao banco Neon\n')

  // Limpar dados de conteúdo (não users)
  console.log('🗑️  Limpando conteúdo existente...')
  await client.query('DELETE FROM testes')
  await client.query('DELETE FROM progresso')
  await client.query('DELETE FROM notas')
  await client.query('DELETE FROM user_badges')
  await client.query('DELETE FROM badges')
  await client.query('DELETE FROM metas')
  await client.query('DELETE FROM questoes')
  await client.query('DELETE FROM provas')
  await client.query('DELETE FROM aulas')
  console.log('✅ Conteúdo limpo\n')

  let totalQuestoes = 0

  for (const esp of ESPECIALIDADES) {
    console.log(`\n📚 ${esp.nome} (${esp.qtd} questões)`)

    // Criar prova para essa especialidade
    const provaId = cuid()
    await client.query(`
      INSERT INTO provas (id, nome, tipo, subtipo, disciplina, tema, descricao, dificuldade, "geradaPorIA", ativo, "tempoPrevisto")
      VALUES ($1, $2, 'simulado', 'completa', $3, $4, $5, 'medio', true, true, $6)
    `, [
      provaId,
      `Banco de Questões — ${esp.nome}`,
      esp.disciplina,
      esp.nome,
      `Questões de residência médica sobre ${esp.nome}`,
      esp.qtd * 2
    ])

    const questoesPorTema = Math.ceil(esp.qtd / esp.temas.length)
    let ordem = 1

    for (const tema of esp.temas) {
      const qtdTema = Math.min(questoesPorTema, esp.qtd - (ordem - 1))
      if (qtdTema <= 0) break

      process.stdout.write(`  → ${tema} (${qtdTema}q)... `)

      try {
        // Gerar em batches de 20 para evitar timeout
        let geradas = []
        const batches = Math.ceil(qtdTema / 20)
        for (let b = 0; b < batches; b++) {
          const qtdBatch = Math.min(20, qtdTema - (b * 20))
          const batch = await gerarQuestoes(esp.nome, tema, qtdBatch)
          geradas = geradas.concat(batch.slice(0, qtdBatch))
          process.stdout.write(`${geradas.length}/${qtdTema} `)
        }

        for (const q of geradas) {
          const qid = cuid()
          await client.query(`
            INSERT INTO questoes (id, "provaId", enunciado, "opcaoA", "opcaoB", "opcaoC", "opcaoD", "opcaoE", gabarito, explicacao, disciplina, tema, dificuldade, ordem, "geradaPorIA")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true)
          `, [
            qid, provaId,
            q.enunciado, q.opcaoA, q.opcaoB, q.opcaoC, q.opcaoD, q.opcaoE || null,
            q.gabarito, q.explicacao || null,
            esp.disciplina, tema,
            q.dificuldade || 'medio',
            ordem++
          ])
          totalQuestoes++
        }
        console.log(`✅`)
      } catch (e) {
        console.log(`❌ Erro: ${e.message}`)
      }

      // Pausa para não sobrecarregar a API
      await new Promise(r => setTimeout(r, 1000))
    }

    console.log(`  ✅ ${esp.nome}: ${ordem - 1} questões inseridas`)
  }

  console.log(`\n🎉 Total inserido: ${totalQuestoes} questões`)
  await client.end()
}

main().catch(e => { console.error(e); process.exit(1) })
