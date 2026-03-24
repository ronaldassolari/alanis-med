import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { ProgressBar } from "@/components/ui/progress-bar"
import { TrendingUp, BookOpen, Clock, AlertTriangle } from "lucide-react"
import { NotasChart } from "./notas-chart"

export default async function ProgressoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  const [aulas, progressoList, notas] = await Promise.all([
    db.aula.findMany({ where: { ativo: true } }),
    db.progresso.findMany({
      where: { userId },
      include: { aula: true },
    }),
    db.nota.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 20,
      include: { teste: { include: { prova: true } } },
    }),
  ])

  // Overall stats
  const total = aulas.length
  const concluidas = progressoList.filter((p) => p.concluido).length
  const progressoGeral = total > 0 ? Math.round((concluidas / total) * 100) : 0
  const tempoTotal = progressoList.reduce((sum, p) => sum + (p.tempoGasto ?? 0), 0)
  const tempoHoras = Math.round(tempoTotal / 60)

  // Per discipline
  const disciplinas = [...new Set(aulas.map((a) => a.disciplina))]
  const disciplinaStats = disciplinas.map((disc) => {
    const aulasDisc = aulas.filter((a) => a.disciplina === disc)
    const progressoDisc = progressoList.filter((p) => p.aula.disciplina === disc && p.concluido)
    const percent = aulasDisc.length > 0 ? Math.round((progressoDisc.length / aulasDisc.length) * 100) : 0

    // Average nota for this discipline
    const notasDisc = notas.filter((n) => {
      const prova = n.teste.prova
      return prova?.disciplina === disc
    })
    // nota em escala 0-10
    const avgNota = notasDisc.length > 0
      ? Math.round((notasDisc.reduce((s, n) => s + n.valor, 0) / notasDisc.length) * 10) / 10
      : null

    return { disc, total: aulasDisc.length, concluidas: progressoDisc.length, percent, avgNota }
  })

  // Notas chart data (last 7) — nota em 0-10
  const chartData = notas.slice(-7).map((n) => ({
    name: new Date(n.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    nota: Math.round(n.valor * 10) / 10,
  }))

  // Pontos fracos (lowest score disciplines)
  const discsWithNotas = disciplinaStats.filter((d) => d.avgNota !== null).sort((a, b) => (a.avgNota ?? 0) - (b.avgNota ?? 0)).slice(0, 3)

  const getProgressColor = (p: number): "green" | "blue" | "yellow" | "red" =>
    p >= 80 ? "green" : p >= 50 ? "blue" : p >= 25 ? "yellow" : "red"

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Progresso</h1>
        <p className="text-slate-500 mt-1">Acompanhe sua evolução nos estudos</p>
      </div>

      {/* Overall stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Progresso Geral</p>
              <p className="text-2xl font-bold text-slate-800">{progressoGeral}%</p>
            </div>
          </div>
          <ProgressBar value={progressoGeral} color={getProgressColor(progressoGeral)} size="md" />
          <p className="text-xs text-slate-400 mt-1">{concluidas} de {total} aulas</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Aulas Concluídas</p>
              <p className="text-2xl font-bold text-slate-800">{concluidas}</p>
              <p className="text-xs text-slate-400">de {total} disponíveis</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Tempo de Estudo</p>
              <p className="text-2xl font-bold text-slate-800">{tempoHoras}h</p>
              <p className="text-xs text-slate-400">{tempoTotal} minutos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per discipline */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Por Disciplina</h2>
          <div className="space-y-5">
            {disciplinaStats.map(({ disc, total, concluidas, percent }) => (
              <div key={disc}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{disc}</span>
                  <span className="text-slate-500">{concluidas}/{total} aulas</span>
                </div>
                <ProgressBar value={percent} color={getProgressColor(percent)} size="md" />
                <p className="text-xs text-slate-400 mt-0.5">{percent}% completo</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chart + Pontos fracos */}
        <div className="space-y-4">
          {/* Notas chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Evolução das Notas</h2>
            {chartData.length > 0 ? (
              <NotasChart data={chartData} />
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                Nenhum dado ainda. Faça algumas provas!
              </div>
            )}
          </div>

          {/* Pontos fracos */}
          {discsWithNotas.length > 0 && (
            <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-slate-700">Pontos Fracos</h2>
              </div>
              <p className="text-sm text-slate-500 mb-3">Disciplinas com menor desempenho nas provas</p>
              <div className="space-y-2">
                {discsWithNotas.map(({ disc, avgNota }) => (
                  <div key={disc} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="text-sm font-medium text-slate-700">{disc}</span>
                    <span className={`text-sm font-bold ${(avgNota ?? 0) >= 6 ? "text-emerald-600" : "text-red-500"}`}>
                      {avgNota}/10
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
