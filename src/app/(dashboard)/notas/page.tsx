import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { AprovadoBadge, Badge } from "@/components/ui/badge"
import { Star, TrendingUp, TrendingDown, Target } from "lucide-react"

// nota está em escala 0-10
function getPerformance(nota: number): { label: string; color: string } {
  if (nota >= 9) return { label: "Excelente", color: "text-emerald-600" }
  if (nota >= 8) return { label: "Muito Bom", color: "text-sky-600" }
  if (nota >= 7) return { label: "Bom", color: "text-blue-600" }
  if (nota >= 6) return { label: "Satisfatório", color: "text-amber-600" }
  return { label: "Insuficiente", color: "text-red-500" }
}

export default async function NotasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  const notas = await db.nota.findMany({
    where: { userId },
    include: {
      teste: {
        include: { prova: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // nota em escala 0-10
  const media = notas.length > 0
    ? Math.round((notas.reduce((s, n) => s + n.valor, 0) / notas.length) * 10) / 10
    : 0

  const melhor = notas.length > 0
    ? notas.reduce((best, n) => n.valor > best.valor ? n : best)
    : null

  const pior = notas.length > 0
    ? notas.reduce((worst, n) => n.valor < worst.valor ? n : worst)
    : null

  const aprovadas = notas.filter((n) => n.aprovado).length
  const taxaAprovacao = notas.length > 0 ? Math.round((aprovadas / notas.length) * 100) : 0
  const projecao = media >= 7
    ? "Alta probabilidade de aprovação"
    : media >= 6
    ? "Probabilidade moderada — continue praticando!"
    : "Aumente sua média para aumentar as chances"

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Notas</h1>
        <p className="text-slate-500 mt-1">Histórico completo de provas e testes realizados</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Nota Média</p>
              <p className="text-2xl font-bold text-slate-800">{media}<span className="text-sm text-slate-400">/10</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Melhor Nota</p>
              <p className="text-2xl font-bold text-slate-800">
                {melhor ? <>{melhor.valor.toFixed(1)}<span className="text-sm text-slate-400">/10</span></> : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Pior Nota</p>
              <p className="text-2xl font-bold text-slate-800">
                {pior ? <>{pior.valor.toFixed(1)}<span className="text-sm text-slate-400">/10</span></> : "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Taxa de Aprovação</p>
              <p className="text-2xl font-bold text-slate-800">{taxaAprovacao}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Projection */}
      {notas.length > 0 && (
        <div className={`rounded-xl border p-4 mb-6 flex items-center gap-3 ${media >= 7 ? "bg-emerald-50 border-emerald-200" : media >= 6 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200"}`}>
          <Target className={`w-5 h-5 flex-shrink-0 ${media >= 7 ? "text-emerald-600" : media >= 6 ? "text-amber-600" : "text-red-500"}`} />
          <div>
            <p className="text-sm font-semibold text-slate-700">Projeção de Aprovação</p>
            <p className={`text-sm ${media >= 7 ? "text-emerald-700" : media >= 6 ? "text-amber-700" : "text-red-600"}`}>
              {projecao}
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">Histórico Completo</h2>
        </div>
        {notas.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400">Nenhuma nota ainda. Faça sua primeira prova!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-6 text-slate-500 font-medium">Data</th>
                  <th className="text-left py-3 px-6 text-slate-500 font-medium">Prova / Teste</th>
                  <th className="text-left py-3 px-6 text-slate-500 font-medium">Tipo</th>
                  <th className="text-left py-3 px-6 text-slate-500 font-medium">Acertos</th>
                  <th className="text-left py-3 px-6 text-slate-500 font-medium">Nota</th>
                  <th className="text-left py-3 px-6 text-slate-500 font-medium">XP</th>
                  <th className="text-left py-3 px-6 text-slate-500 font-medium">Performance</th>
                  <th className="text-left py-3 px-6 text-slate-500 font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {notas.map((nota) => {
                  const perf = getPerformance(nota.valor)
                  return (
                    <tr key={nota.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-6 text-slate-600">
                        {new Date(nota.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-6 font-medium text-slate-700">
                        {nota.teste.prova?.nome ?? "Teste Livre"}
                      </td>
                      <td className="py-3 px-6">
                        <Badge variant="gray">{nota.teste.tipo}</Badge>
                      </td>
                      <td className="py-3 px-6 text-slate-600">
                        {nota.teste.acertos}/{nota.teste.total}
                      </td>
                      <td className="py-3 px-6 font-bold text-slate-800">
                        {nota.valor.toFixed(1)}<span className="text-xs text-slate-400">/10</span>
                      </td>
                      <td className="py-3 px-6 text-amber-600 font-medium">
                        {nota.teste.pontos > 0 ? `+${nota.teste.pontos}` : "—"}
                      </td>
                      <td className={`py-3 px-6 font-medium ${perf.color}`}>
                        {perf.label}
                        {nota.percentil && <span className="text-xs text-slate-400 ml-1">top {100 - nota.percentil}%</span>}
                      </td>
                      <td className="py-3 px-6">
                        <AprovadoBadge aprovado={nota.aprovado} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
