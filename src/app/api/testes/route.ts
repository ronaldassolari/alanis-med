import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

// Pesos por dificuldade: Fácil=1.0, Médio=1.5, Difícil=2.0 (-0.25 por erro no Difícil)
const PESOS = { facil: 1.0, medio: 1.5, dificil: 2.0 }
const PENALIDADE_DIFICIL = -0.25

async function atualizarStreak(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { ultimoEstudo: true, streakDias: true } })
  if (!user) return

  const agora = new Date()
  const hoje = new Date(agora)
  hoje.setHours(0, 0, 0, 0)

  if (!user.ultimoEstudo) {
    await db.user.update({ where: { id: userId }, data: { ultimoEstudo: agora, streakDias: 1 } })
    return
  }

  const ultimoDia = new Date(user.ultimoEstudo)
  ultimoDia.setHours(0, 0, 0, 0)

  const diffDias = Math.round((hoje.getTime() - ultimoDia.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDias === 0) {
    await db.user.update({ where: { id: userId }, data: { ultimoEstudo: agora } })
  } else if (diffDias === 1) {
    await db.user.update({ where: { id: userId }, data: { ultimoEstudo: agora, streakDias: { increment: 1 } } })
  } else {
    await db.user.update({ where: { id: userId }, data: { ultimoEstudo: agora, streakDias: 1 } })
  }
}

async function atualizarMetas(userId: string) {
  const metas = await db.meta.findMany({ where: { userId, concluida: false } })

  for (const meta of metas) {
    let novoAtual = meta.atual

    if (meta.tipo === "diaria") {
      const inicio = new Date()
      inicio.setHours(0, 0, 0, 0)
      const count = await db.teste.count({ where: { userId, completado: true, createdAt: { gte: inicio } } })
      novoAtual = count
    } else if (meta.tipo === "semanal") {
      const inicio = new Date()
      const day = inicio.getDay()
      inicio.setDate(inicio.getDate() - day)
      inicio.setHours(0, 0, 0, 0)
      const count = await db.teste.count({ where: { userId, completado: true, createdAt: { gte: inicio } } })
      novoAtual = count
    } else if (meta.tipo === "mensal") {
      const inicio = new Date()
      inicio.setDate(1)
      inicio.setHours(0, 0, 0, 0)
      const progressos = await db.progresso.findMany({ where: { userId, dataInicio: { gte: inicio } } })
      novoAtual = Math.round(progressos.reduce((sum, p) => sum + (p.tempoGasto ?? 0), 0) / 60)
    }

    if (novoAtual !== meta.atual) {
      await db.meta.update({
        where: { id: meta.id },
        data: { atual: novoAtual, concluida: novoAtual >= meta.meta },
      })
    }
  }
}

async function verificarBadges(userId: string, nota: number, aprovado: boolean, provaId: string | null, acertos: number, total: number) {
  const [user, allTestes, userBadges, allBadges] = await Promise.all([
    db.user.findUnique({ where: { id: userId }, select: { streakDias: true } }),
    db.teste.findMany({ where: { userId, completado: true } }),
    db.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
    db.badge.findMany(),
  ])
  if (!user) return

  const earned = new Set(userBadges.map((ub) => ub.badgeId))
  const bycriterio = new Map(allBadges.map((b) => [b.criterio, b]))

  const toEarn: string[] = []

  const try_earn = (criterio: string) => {
    const b = bycriterio.get(criterio)
    if (b && !earned.has(b.id)) toEarn.push(b.id)
  }

  if (allTestes.length === 1) try_earn("first_test")
  if (nota >= 9.9) try_earn("perfect_score")
  if (user.streakDias >= 7) try_earn("streak_7")
  if (user.streakDias >= 30) try_earn("streak_30")

  if (aprovado && nota >= 7 && provaId) {
    const prova = await db.prova.findUnique({ where: { id: provaId }, select: { tipo: true, disciplina: true } })
    if (prova?.tipo === "ENARE") try_earn("enare_pass")
    if (prova?.disciplina === "Cirurgia" && total > 0 && acertos / total >= 0.9) try_earn("surgery_90")
    if (prova?.disciplina === "Pediatria" && acertos === total) try_earn("pediatria_100")
  }

  // 5 testes no dia
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0)
  const testesHoje = allTestes.filter((t) => new Date(t.createdAt) >= hoje)
  if (testesHoje.length >= 5) try_earn("five_tests_day")

  if (toEarn.length === 0) return

  await db.userBadge.createMany({
    data: toEarn.map((badgeId) => ({ userId, badgeId })),
  })

  const xpBadges = allBadges.filter((b) => toEarn.includes(b.id)).reduce((sum, b) => sum + b.pontos, 0)
  if (xpBadges > 0) {
    await db.user.update({ where: { id: userId }, data: { pontos: { increment: xpBadges } } })
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { provaId, tipo, respostas, acertos, total, tempo } = body

  let pontosCalculados = 0
  let notaFinal = total > 0 ? (acertos / total) * 10 : 0

  if (provaId && respostas && typeof respostas === "object") {
    const questoes = await db.questao.findMany({
      where: { provaId },
      select: { id: true, gabarito: true, dificuldade: true },
    })

    let pontosObtidos = 0
    let pontosPossiveis = 0

    for (const q of questoes) {
      const peso = PESOS[q.dificuldade as keyof typeof PESOS] ?? 1.0
      pontosPossiveis += peso

      const resposta = respostas[q.id]
      if (resposta === q.gabarito) {
        pontosObtidos += peso
      } else if (resposta && q.dificuldade === "dificil") {
        pontosObtidos += PENALIDADE_DIFICIL
      }
    }

    pontosObtidos = Math.max(0, pontosObtidos)
    notaFinal = pontosPossiveis > 0 ? Math.min(10, (pontosObtidos / pontosPossiveis) * 10) : 0
    pontosCalculados = Math.round(pontosObtidos * 10)
  } else {
    pontosCalculados = acertos * 10
  }

  notaFinal = Math.round(notaFinal * 10) / 10
  const aprovado = notaFinal >= 6

  const teste = await db.teste.create({
    data: {
      userId: session.user.id,
      provaId: provaId ?? null,
      tipo: tipo ?? "prova",
      respostas: JSON.stringify(respostas),
      acertos,
      total,
      tempo: tempo ?? null,
      pontos: pontosCalculados,
      completado: true,
    },
  })

  const notaRecord = await db.nota.create({
    data: {
      userId: session.user.id,
      testeId: teste.id,
      valor: notaFinal,
      aprovado,
    },
  })

  await db.user.update({
    where: { id: session.user.id },
    data: { pontos: { increment: pontosCalculados } },
  })

  // Gamification: streak, metas e badges em paralelo
  await Promise.all([
    atualizarStreak(session.user.id),
    atualizarMetas(session.user.id),
  ])
  await verificarBadges(session.user.id, notaFinal, aprovado, provaId ?? null, acertos, total)

  return NextResponse.json({ teste, nota: notaRecord, pontosGanhos: pontosCalculados })
}
