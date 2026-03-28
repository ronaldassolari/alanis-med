"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Anthropic from "@anthropic-ai/sdk"
import { redirect } from "next/navigation"

export interface QuestaoGerada {
  enunciado: string
  opcaoA: string
  opcaoB: string
  opcaoC: string
  opcaoD: string
  opcaoE?: string
  gabarito: string
  explicacao: string
  disciplina: string
  tema: string
  dificuldade: string
}

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null
  return new Anthropic({ apiKey })
}

export async function gerarQuestoes(formData: FormData): Promise<{ questoes?: QuestaoGerada[]; error?: string }> {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const disciplina = formData.get("disciplina") as string
  const dificuldade = formData.get("dificuldade") as string
  const quantidade = parseInt(formData.get("quantidade") as string) || 5
  const tema = formData.get("tema") as string

  if (!disciplina || !dificuldade) {
    return { error: "Selecione disciplina e dificuldade." }
  }

  const client = getClient()
  if (!client) {
    return { error: "ANTHROPIC_API_KEY não configurada no .env" }
  }

  const nivelTexto =
    dificuldade === "facil"
      ? "Fácil — conceitos básicos, definições, diagnósticos diretos"
      : dificuldade === "medio"
      ? "Médio — aplicação clínica, conduta terapêutica, casos simples"
      : "Difícil — raciocínio clínico complexo, casos elaborados, diagnóstico diferencial avançado"

  const prompt = `Gere ${quantidade} questões de múltipla escolha de residência médica sobre ${disciplina}${tema ? ` com foco em ${tema}` : ""}.

Nível: ${nivelTexto}

REGRAS OBRIGATÓRIAS:
- Estilo ENARE/CAJURU: casos clínicos com dados do paciente (idade, sexo, sintomas, exames)
- Português brasileiro médico correto
- Exatamente 5 opções (A, B, C, D, E) — apenas 1 correta
- Gabarito: a letra correta (A, B, C, D ou E)
- Explicação detalhada justificando o gabarito e eliminando os distratores

Responda SOMENTE com JSON válido, sem markdown, sem texto extra:
{
  "questoes": [
    {
      "enunciado": "Texto completo da questão com caso clínico",
      "opcaoA": "Opção A",
      "opcaoB": "Opção B",
      "opcaoC": "Opção C",
      "opcaoD": "Opção D",
      "opcaoE": "Opção E",
      "gabarito": "B",
      "explicacao": "Explicação detalhada",
      "tema": "${tema || "Geral"}"
    }
  ]
}`

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4000,
      system: "Você é especialista em educação médica e questões de residência médica no Brasil. Responda APENAS com JSON válido, sem markdown.",
      messages: [{ role: "user", content: prompt }],
    })

    const text = response.content[0].type === "text" ? response.content[0].text : ""
    const cleaned = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "").trim()
    const parsed = JSON.parse(cleaned)

    const questoes: QuestaoGerada[] = (parsed.questoes || []).map((q: Record<string, string>) => ({
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

    return { questoes }
  } catch (e) {
    console.error("Erro ao gerar questões:", e)
    return { error: "Erro ao gerar questões com IA. Tente novamente." }
  }
}

export async function salvarQuestoesGeradas(questoes: QuestaoGerada[], provaId: string) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  await db.questao.createMany({
    data: questoes.map((q, i) => ({
      provaId,
      enunciado: q.enunciado,
      opcaoA: q.opcaoA,
      opcaoB: q.opcaoB,
      opcaoC: q.opcaoC,
      opcaoD: q.opcaoD,
      opcaoE: q.opcaoE || null,
      gabarito: q.gabarito,
      explicacao: q.explicacao,
      disciplina: q.disciplina,
      tema: q.tema,
      dificuldade: q.dificuldade,
      geradaPorIA: true,
      ordem: i + 1,
    })),
  })
}
