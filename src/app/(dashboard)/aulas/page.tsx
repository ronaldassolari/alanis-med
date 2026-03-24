import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ProgressBar } from "@/components/ui/progress-bar"
import { DisciplinaBadge, Badge } from "@/components/ui/badge"
import { BookOpen, Video, FileText, Clock, Play, ArrowRight } from "lucide-react"

interface AulasPageProps {
  searchParams: Promise<{ disciplina?: string; tipo?: string }>
}

export default async function AulasPage({ searchParams }: AulasPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const params = await searchParams
  const disciplinaFilter = params.disciplina
  const tipoFilter = params.tipo

  const [aulas, progressoList] = await Promise.all([
    db.aula.findMany({
      where: {
        ativo: true,
        ...(disciplinaFilter ? { disciplina: disciplinaFilter } : {}),
        ...(tipoFilter ? { tipo: tipoFilter } : {}),
      },
      orderBy: [{ disciplina: "asc" }, { ordem: "asc" }],
    }),
    db.progresso.findMany({
      where: { userId: session.user.id },
    }),
  ])

  const progressoMap = new Map(progressoList.map((p) => [p.aulaId, p]))

  const disciplinas = await db.aula.findMany({
    where: { ativo: true },
    select: { disciplina: true },
    distinct: ["disciplina"],
  })
  const disciplinasList = disciplinas.map((d) => d.disciplina)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Aulas</h1>
        <p className="text-slate-500 mt-1">Explore todo o conteúdo disponível para sua preparação</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 flex flex-wrap gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1 font-medium">Disciplina</label>
          <div className="flex gap-2 flex-wrap">
            <Link
              href="/aulas"
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${!disciplinaFilter ? "bg-sky-500 text-white border-sky-500" : "border-slate-200 text-slate-600 hover:bg-sky-50"}`}
            >
              Todas
            </Link>
            {disciplinasList.map((d) => (
              <Link
                key={d}
                href={`/aulas?disciplina=${encodeURIComponent(d)}${tipoFilter ? `&tipo=${tipoFilter}` : ""}`}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${disciplinaFilter === d ? "bg-sky-500 text-white border-sky-500" : "border-slate-200 text-slate-600 hover:bg-sky-50"}`}
              >
                {d}
              </Link>
            ))}
          </div>
        </div>
        <div className="ml-auto">
          <label className="block text-xs text-slate-500 mb-1 font-medium">Tipo</label>
          <div className="flex gap-2">
            <Link
              href={disciplinaFilter ? `/aulas?disciplina=${encodeURIComponent(disciplinaFilter)}` : "/aulas"}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${!tipoFilter ? "bg-sky-500 text-white border-sky-500" : "border-slate-200 text-slate-600 hover:bg-sky-50"}`}
            >
              Todos
            </Link>
            <Link
              href={`/aulas?tipo=video${disciplinaFilter ? `&disciplina=${encodeURIComponent(disciplinaFilter)}` : ""}`}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${tipoFilter === "video" ? "bg-sky-500 text-white border-sky-500" : "border-slate-200 text-slate-600 hover:bg-sky-50"}`}
            >
              Video
            </Link>
            <Link
              href={`/aulas?tipo=texto${disciplinaFilter ? `&disciplina=${encodeURIComponent(disciplinaFilter)}` : ""}`}
              className={`px-3 py-1 rounded-full text-sm border transition-colors ${tipoFilter === "texto" ? "bg-sky-500 text-white border-sky-500" : "border-slate-200 text-slate-600 hover:bg-sky-50"}`}
            >
              Texto
            </Link>
          </div>
        </div>
      </div>

      {/* Aulas grid */}
      {aulas.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400">Nenhuma aula encontrada com esses filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {aulas.map((aula) => {
            const prog = progressoMap.get(aula.id)
            const percentual = prog?.percentual ?? 0
            const concluido = prog?.concluido ?? false

            return (
              <div
                key={aula.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col"
              >
                {/* Top */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2 flex-wrap">
                    <DisciplinaBadge disciplina={aula.disciplina} />
                    <Badge variant={aula.tipo === "video" ? "blue" : "gray"}>
                      {aula.tipo === "video" ? "Video" : "Texto"}
                    </Badge>
                    {concluido && <Badge variant="green">Concluída</Badge>}
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${aula.tipo === "video" ? "bg-sky-100" : "bg-slate-100"}`}>
                    {aula.tipo === "video" ? (
                      <Video className="w-4 h-4 text-sky-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">{aula.titulo}</h3>
                <p className="text-sm text-slate-500 line-clamp-2 flex-1">{aula.descricao}</p>

                {/* Duration */}
                {aula.duracao && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{aula.duracao} min</span>
                  </div>
                )}

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Progresso</span>
                    <span>{percentual}%</span>
                  </div>
                  <ProgressBar value={percentual} color={concluido ? "green" : "blue"} size="sm" />
                </div>

                {/* CTA */}
                <Link
                  href={`/aulas/${aula.id}`}
                  className="mt-4 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {aula.tipo === "video" ? <Play className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                  {aula.tipo === "video" ? "Assistir" : "Ler"}
                  <ArrowRight className="w-3 h-3 ml-auto" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
