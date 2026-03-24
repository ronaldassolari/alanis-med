import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ProgressBar } from "@/components/ui/progress-bar"
import { AprovadoBadge } from "@/components/ui/badge"
import {
  BookOpen,
  ClipboardList,
  TrendingUp,
  Star,
  ArrowRight,
  Zap,
  Flame,
  Trophy,
  Target,
  CheckCircle2,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  const [user, totalAulas, progresso, notas, testes] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: {
        badges: { include: { badge: true }, take: 6 },
        metas: { orderBy: { data: "desc" }, take: 3 },
      },
    }),
    db.aula.count({ where: { ativo: true } }),
    db.progresso.findMany({ where: { userId }, include: { aula: true } }),
    db.nota.findMany({
      where: { userId },
      include: { teste: { include: { prova: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.teste.count({ where: { userId, completado: true } }),
  ])

  if (!user) redirect("/login")

  const aulasConcluidas = progresso.filter((p) => p.concluido).length
  const progressoGeral = totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0

  const todasNotas = await db.nota.findMany({ where: { userId } })
  const notaMedia =
    todasNotas.length > 0
      ? (todasNotas.reduce((sum, n) => sum + n.valor, 0) / todasNotas.length).toFixed(1)
      : "0.0"

  // XP progress toward next level (every 500 pts = level up)
  const pontos = user.pontos
  const nivel = Math.floor(pontos / 500) + 1
  const xpNivel = pontos % 500
  const xpProximo = 500

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Olá, {user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-slate-500 mt-1">Sua jornada rumo à residência médica continua!</p>
        </div>
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
          <Flame className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-lg font-bold text-orange-600 leading-none">{user.streakDias}</p>
            <p className="text-xs text-orange-400">dias seguidos</p>
          </div>
        </div>
      </div>

      {/* XP Bar + Level */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">N{nivel}</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-slate-700">Nível {nivel} — {pontos} XP</span>
            <span className="text-xs text-slate-400">{xpNivel}/{xpProximo} XP para o próximo nível</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-2.5 bg-blue-600 rounded-full transition-all duration-700"
              style={{ width: `${Math.round((xpNivel / xpProximo) * 100)}%` }}
            />
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-400">Plano</p>
          <p className="text-sm font-bold text-blue-600 capitalize">{user.planoAtivo}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Aulas</p>
              <p className="text-xl font-bold text-slate-800">{aulasConcluidas}<span className="text-sm text-slate-400">/{totalAulas}</span></p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Provas feitas</p>
              <p className="text-xl font-bold text-slate-800">{testes}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Nota média</p>
              <p className="text-xl font-bold text-slate-800">{notaMedia}<span className="text-sm text-slate-400">/10</span></p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Progresso</p>
              <p className="text-xl font-bold text-slate-800">{progressoGeral}<span className="text-sm text-slate-400">%</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: progress + quick actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progresso geral */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Progresso do Curso</h2>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>Aulas concluídas</span>
                <span className="font-medium text-slate-700">{aulasConcluidas}/{totalAulas}</span>
              </div>
              <ProgressBar value={aulasConcluidas} max={totalAulas} size="lg" showLabel={false} />
              <p className="text-xs text-slate-400 mt-1">{progressoGeral}% do curso completo</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link href="/aulas" className="flex items-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 text-sm font-medium transition-colors">
                <BookOpen className="w-4 h-4" />
                Ver Aulas
                <ArrowRight className="w-3 h-3 ml-auto" />
              </Link>
              <Link href="/testes" className="flex items-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-700 text-sm font-medium transition-colors">
                <Zap className="w-4 h-4" />
                Fazer Teste
                <ArrowRight className="w-3 h-3 ml-auto" />
              </Link>
              <Link href="/provas" className="flex items-center gap-2 p-3 bg-amber-50 hover:bg-amber-100 rounded-lg text-amber-700 text-sm font-medium transition-colors">
                <ClipboardList className="w-4 h-4" />
                Provas
                <ArrowRight className="w-3 h-3 ml-auto" />
              </Link>
              <Link href="/progresso" className="flex items-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 text-sm font-medium transition-colors">
                <TrendingUp className="w-4 h-4" />
                Estatísticas
                <ArrowRight className="w-3 h-3 ml-auto" />
              </Link>
            </div>
          </div>

          {/* Metas */}
          {user.metas.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-700">Metas</h2>
                <Target className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-4">
                {user.metas.map((meta) => {
                  const pct = Math.min(Math.round((meta.atual / meta.meta) * 100), 100)
                  return (
                    <div key={meta.id}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          {meta.concluida && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          <span className="text-sm text-slate-700">{meta.descricao}</span>
                          <span className="text-xs text-slate-400 capitalize">({meta.tipo})</span>
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{meta.atual}/{meta.meta}</span>
                      </div>
                      <ProgressBar
                        value={meta.atual}
                        max={meta.meta}
                        size="sm"
                        color={meta.concluida ? "green" : pct >= 80 ? "yellow" : "blue"}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column: badges + recent activity */}
        <div className="space-y-6">
          {/* Badges */}
          {user.badges.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-700">Conquistas</h2>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {user.badges.map(({ badge, ganhoEm }) => (
                  <div key={badge.id} className="flex flex-col items-center text-center" title={`${badge.nome}: ${badge.descricao}\nGanho: ${new Date(ganhoEm).toLocaleDateString("pt-BR")}`}>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-1"
                      style={{ backgroundColor: `${badge.cor}18`, border: `2px solid ${badge.cor}30` }}
                    >
                      {badge.icone}
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-tight">{badge.nome}</p>
                    <p className="text-xs text-slate-400">+{badge.pontos} XP</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Atividade recente */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-700 mb-4">Atividade Recente</h2>
            {notas.length === 0 ? (
              <div className="text-center py-6">
                <ClipboardList className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Nenhuma atividade ainda.</p>
                <Link href="/provas" className="text-blue-600 text-sm hover:underline mt-1 inline-block">
                  Fazer primeira prova
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {notas.map((nota) => (
                  <li key={nota.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${nota.aprovado ? "bg-emerald-100" : "bg-red-100"}`}>
                      <Star className={`w-4 h-4 ${nota.aprovado ? "text-emerald-600" : "text-red-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {nota.teste.prova?.nome ?? "Teste Livre"}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-bold ${nota.aprovado ? "text-emerald-600" : "text-red-500"}`}>
                          {nota.valor.toFixed(1)}/10
                        </span>
                        <AprovadoBadge aprovado={nota.aprovado} />
                        {nota.percentil && (
                          <span className="text-xs text-slate-400">top {100 - nota.percentil}%</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {formatDistanceToNow(new Date(nota.createdAt), { locale: ptBR, addSuffix: true })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/notas" className="flex items-center justify-center gap-1 mt-4 text-xs text-blue-600 hover:text-blue-700">
              Ver todas as notas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
