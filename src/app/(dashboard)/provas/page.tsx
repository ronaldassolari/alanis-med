import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Badge, AprovadoBadge } from "@/components/ui/badge"
import { ClipboardList, Play, BarChart2, FileQuestion } from "lucide-react"

interface ProvasPageProps {
  searchParams: Promise<{ tipo?: string; ano?: string }>
}

export default async function ProvasPage({ searchParams }: ProvasPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const params = await searchParams
  const tipoFilter = params.tipo
  const anoFilter = params.ano ? parseInt(params.ano) : undefined

  const [provas, testesDone] = await Promise.all([
    db.prova.findMany({
      where: {
        ativo: true,
        ...(tipoFilter ? { tipo: tipoFilter } : {}),
        ...(anoFilter ? { ano: anoFilter } : {}),
      },
      include: {
        questoes: { select: { id: true } },
      },
      orderBy: [{ ano: "desc" }, { nome: "asc" }],
    }),
    db.teste.findMany({
      where: { userId: session.user.id, completado: true },
      include: { nota: true },
    }),
  ])

  const testeMap = new Map(testesDone.filter((t) => t.provaId).map((t) => [t.provaId!, t]))

  const tipos = ["ENARE", "CAJURU", "SIMULADO"]

  const tipoColors: Record<string, "blue" | "purple" | "orange"> = {
    ENARE: "blue",
    CAJURU: "purple",
    SIMULADO: "orange",
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Provas</h1>
        <p className="text-slate-500 mt-1">Pratique com provas reais de residência médica</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-xs text-slate-500 mb-1 font-medium">Tipo</label>
          <div className="flex gap-2">
            <Link
              href="/provas"
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${!tipoFilter ? "bg-sky-500 text-white border-sky-500" : "border-slate-200 text-slate-600 hover:bg-sky-50"}`}
            >
              Todos
            </Link>
            {tipos.map((t) => (
              <Link
                key={t}
                href={`/provas?tipo=${t}${anoFilter ? `&ano=${anoFilter}` : ""}`}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${tipoFilter === t ? "bg-sky-500 text-white border-sky-500" : "border-slate-200 text-slate-600 hover:bg-sky-50"}`}
              >
                {t}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Provas list */}
      {provas.length === 0 ? (
        <div className="text-center py-16">
          <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">Nenhuma prova encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {provas.map((prova) => {
            const teste = testeMap.get(prova.id)
            const nota = teste?.nota
            const questoesCount = prova.questoes.length

            return (
              <div
                key={prova.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant={tipoColors[prova.tipo] ?? "gray"}>{prova.tipo}</Badge>
                    {prova.ano && <Badge variant="gray">{prova.ano}</Badge>}
                  </div>
                  <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-4 h-4 text-sky-600" />
                  </div>
                </div>

                <h3 className="font-semibold text-slate-800 mb-1">{prova.nome}</h3>
                {prova.descricao && (
                  <p className="text-sm text-slate-500 line-clamp-2 mb-2">{prova.descricao}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 mt-auto py-3 border-t border-slate-50">
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <FileQuestion className="w-3 h-3" />
                    <span>{questoesCount} questões</span>
                  </div>
                  {nota && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-600">
                        {Math.round(nota.valor)}%
                      </span>
                      <AprovadoBadge aprovado={nota.aprovado} />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/provas/${prova.id}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {teste ? "Refazer" : "Fazer Prova"}
                  </Link>
                  {teste && (
                    <Link
                      href={`/notas`}
                      className="flex items-center gap-1 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      Análise
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
