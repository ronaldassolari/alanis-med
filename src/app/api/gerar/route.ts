export const runtime = "edge"
export const maxDuration = 30

async function gerarUma(apiKey: string, disciplina: string, dificuldade: string, tema: string, nivelTexto: string): Promise<Record<string, string> | null> {
  const prompt = `Gere 1 questão de múltipla escolha de residência médica sobre ${disciplina}${tema ? ` com foco em ${tema}` : ""}.

Nível: ${nivelTexto}

REGRAS:
- Estilo ENARE/CAJURU: caso clínico com dados do paciente (idade, sexo, sintomas)
- Português brasileiro médico
- Exatamente 5 opções (A, B, C, D, E)
- Gabarito: letra correta
- Explicação: 1-2 frases

Responda SOMENTE com JSON (sem markdown):
{"enunciado":"...","opcaoA":"...","opcaoB":"...","opcaoC":"...","opcaoD":"...","opcaoE":"...","gabarito":"B","explicacao":"...","tema":"${tema || "Geral"}"}`

  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      max_tokens: 800,
      messages: [
        { role: "system", content: "Especialista em residência médica. Responda APENAS JSON válido." },
        { role: "user", content: prompt },
      ],
    }),
  })

  const data = await res.json()
  const text = (data.choices?.[0]?.message?.content || "").replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim()
  return JSON.parse(text)
}

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return Response.json({ error: "DEEPSEEK_API_KEY não configurada" }, { status: 500 })

  const { disciplina, dificuldade, quantidade, tema } = await request.json()
  if (!disciplina || !dificuldade) return Response.json({ error: "Selecione disciplina e dificuldade." }, { status: 400 })

  const nivelTexto =
    dificuldade === "facil" ? "Fácil — conceitos básicos" :
    dificuldade === "medio" ? "Médio — aplicação clínica" :
    "Difícil — raciocínio clínico complexo"

  const n = Math.min(parseInt(quantidade) || 3, 5)

  try {
    // Gera todas em paralelo — cada chamada ~5s, paralelas ficam ~5-8s total
    const results = await Promise.all(
      Array.from({ length: n }, () => gerarUma(apiKey, disciplina, dificuldade, tema, nivelTexto))
    )

    const questoes = results
      .filter(Boolean)
      .map((q) => ({
        enunciado: q!.enunciado,
        opcaoA: q!.opcaoA,
        opcaoB: q!.opcaoB,
        opcaoC: q!.opcaoC,
        opcaoD: q!.opcaoD,
        opcaoE: q!.opcaoE || undefined,
        gabarito: q!.gabarito?.toUpperCase() || "A",
        explicacao: q!.explicacao,
        disciplina,
        tema: q!.tema || tema || "Geral",
        dificuldade,
      }))

    return Response.json({ questoes })
  } catch (e) {
    console.error("Erro gerar:", e)
    return Response.json({ error: "Erro ao gerar questões. Tente novamente." }, { status: 500 })
  }
}
