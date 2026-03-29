export const runtime = "edge"
export const maxDuration = 30

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return Response.json({ error: "DEEPSEEK_API_KEY não configurada" }, { status: 500 })
  }

  const { disciplina, dificuldade, quantidade, tema } = await request.json()

  if (!disciplina || !dificuldade) {
    return Response.json({ error: "Selecione disciplina e dificuldade." }, { status: 400 })
  }

  const nivelTexto =
    dificuldade === "facil"
      ? "Fácil — conceitos básicos, definições, diagnósticos diretos"
      : dificuldade === "medio"
      ? "Médio — aplicação clínica, conduta terapêutica, casos simples"
      : "Difícil — raciocínio clínico complexo, casos elaborados, diagnóstico diferencial avançado"

  const n = Math.min(parseInt(quantidade) || 3, 5)

  const prompt = `Gere ${n} questões de múltipla escolha de residência médica sobre ${disciplina}${tema ? ` com foco em ${tema}` : ""}.

Nível: ${nivelTexto}

REGRAS:
- Estilo ENARE/CAJURU: casos clínicos com dados do paciente
- Português brasileiro médico
- Exatamente 5 opções (A, B, C, D, E)
- Gabarito: a letra correta
- Explicação breve (2-3 linhas)

Responda SOMENTE com JSON:
{"questoes":[{"enunciado":"...","opcaoA":"...","opcaoB":"...","opcaoC":"...","opcaoD":"...","opcaoE":"...","gabarito":"B","explicacao":"...","tema":"${tema || "Geral"}"}]}`

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 3000,
        messages: [
          {
            role: "system",
            content: "Você é especialista em residência médica no Brasil. Responda APENAS com JSON válido, sem markdown.",
          },
          { role: "user", content: prompt },
        ],
      }),
    })

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ""
    const cleaned = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim()
    const parsed = JSON.parse(cleaned)

    const questoes = (parsed.questoes || []).map((q: Record<string, string>) => ({
      enunciado: q.enunciado,
      opcaoA: q.opcaoA,
      opcaoB: q.opcaoB,
      opcaoC: q.opcaoC,
      opcaoD: q.opcaoD,
      opcaoE: q.opcaoE || undefined,
      gabarito: q.gabarito?.toUpperCase() || "A",
      explicacao: q.explicacao,
      disciplina,
      tema: q.tema || tema || "Geral",
      dificuldade,
    }))

    return Response.json({ questoes })
  } catch (e) {
    console.error("Erro gerar:", e)
    return Response.json({ error: "Erro ao gerar questões. Tente novamente." }, { status: 500 })
  }
}
