export const runtime = "edge"
export const maxDuration = 30

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) return Response.json({ error: "DEEPSEEK_API_KEY não configurada" }, { status: 500 })

  const { stats } = await request.json()

  const prompt = `Você é um tutor especializado em preparação para residência médica no Brasil.

Analise o desempenho da estudante abaixo e forneça uma análise personalizada:

DADOS DO DESEMPENHO:
- Progresso geral: ${stats.progressoGeral}% das aulas concluídas (${stats.concluidas}/${stats.total})
- Tempo de estudo: ${stats.tempoHoras} horas
- Nota média geral: ${stats.notaMedia ?? "sem provas realizadas ainda"}

DESEMPENHO POR DISCIPLINA:
${stats.disciplinas.map((d: { nome: string; percent: number; nota: number | null; status: string }) =>
  `- ${d.nome}: ${d.percent}% concluído${d.nota !== null ? `, nota média ${d.nota}/10` : ", sem provas ainda"} [${d.status}]`
).join("\n")}

Responda em JSON com esta estrutura exata:
{
  "resumo": "2-3 frases sobre o desempenho geral da estudante",
  "pontosFracos": [
    {"disciplina": "...", "problema": "...", "sugestao": "..."}
  ],
  "pontosFortes": [
    {"disciplina": "...", "destaque": "..."}
  ],
  "planoSemana": [
    {"dia": "Seg/Qua", "foco": "...", "meta": "..."},
    {"dia": "Ter/Qui", "foco": "...", "meta": "..."},
    {"dia": "Sex/Sáb", "foco": "...", "meta": "..."},
    {"dia": "Dom", "foco": "...", "meta": "..."}
  ],
  "dicaPrincipal": "Uma dica motivacional e prática para a próxima semana"
}`

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        max_tokens: 1500,
        messages: [
          { role: "system", content: "Tutor de residência médica. Responda APENAS com JSON válido, sem markdown." },
          { role: "user", content: prompt },
        ],
      }),
    })

    const data = await res.json()
    const text = (data.choices?.[0]?.message?.content || "").replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim()
    const analise = JSON.parse(text)
    return Response.json({ analise })
  } catch (e) {
    console.error("Erro analise:", e)
    return Response.json({ error: "Erro ao gerar análise." }, { status: 500 })
  }
}
