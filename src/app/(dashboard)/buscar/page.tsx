import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Search, BookOpen, ClipboardList, FileQuestion } from "lucide-react"

interface BuscarPageProps {
  searchParams: Promise<{ q?: string; tipo?: string }>
}

export default async function BuscarPage({ searchParams }: BuscarPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const params = await searchParams
  const q = params.q?.trim() ?? ""
  const tipo = params.tipo ?? "tudo"

  const [questoes, aulas, provas] = await Promise.all([
    q && (tipo === "tudo" || tipo === "questoes")
      ? db.questao.findMany({
          where: {
            OR: [
              { enunciado: { contains: q, mode: "insensitive" } },
              { disciplina: { contains: q, mode: "insensitive" } },
              { tema: { contains: q, mode: "insensitive" } },
            ],
          },
          include: { prova: { select: { nome: true } } },
          take: 20,
        })
      : Promise.resolve([]),
    q && (tipo === "tudo" || tipo === "aulas")
      ? db.aula.findMany({
          where: {
            ativo: true,
            OR: [
              { titulo: { contains: q, mode: "insensitive" } },
              { descricao: { contains: q, mode: "insensitive" } },
              { disciplina: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 20,
        })
      : Promise.resolve([]),
    q && (tipo === "tudo" || tipo === "provas")
      ? db.prova.findMany({
          where: {
            ativo: true,
            OR: [
              { nome: { contains: q, mode: "insensitive" } },
              { descricao: { contains: q, mode: "insensitive" } },
            ],
          },
          take: 20,
        })
      : Promise.resolve([]),
  ])

  const totalResultados = questoes.length + aulas.length + provas.length

  const tipoFiltros = [
    { value: "tudo", label: "Tudo" },
    { value: "questoes", label: "Questões" },
    { value: "aulas", label: "Aulas" },
    { value: "provas", label: "Provas" },
  ]

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Buscar</h1>
        <p className="text-slate-500 mt-1">Encontre questões, aulas e provas</p>
      </div>

      {/* Search form */}
      <form action="/buscar" method="GET" className="mb-6">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Digite para buscar..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 text-sm"
              style={{ focusRingColor: "#0066FF" } as React.CSSProperties}
            />
            {tipo !== "tudo" && (
              <input type="hidden" name="tipo" value={tipo} />
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#0066FF" }}
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Tipo filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tipoFiltros.map((f) => {
          const href = q
            ? `/buscar?q=${encodeURIComponent(q)}&tipo=${f.value}`
            : `/buscar?tipo=${f.value}`
          const isActive = tipo === f.value
          return (
            <Link
              key={f.value}
              href={href}
              className="px-4 py-1.5 rounded-full text-sm border font-medium transition-colors"
              style={
                isActive
                  ? { backgroundColor: "#0066FF", color: "#fff", borderColor: "#0066FF" }
                  : { backgroundColor: "#fff", color: "#475569", borderColor: "#e2e8f0" }
              }
            >
              {f.label}
            </Link>
          )
        })}
      </div>

      {/* Results */}
      {!q ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-lg">Digite algo para começar a buscar</p>
        </div>
      ) : totalResultados === 0 ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Nenhum resultado para &ldquo;{q}&rdquo;</p>
          <p className="text-slate-400 text-sm mt-1">Tente termos diferentes ou outro filtro</p>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{totalResultados}</span> resultado{totalResultados !== 1 ? "s" : ""} para &ldquo;{q}&rdquo;
          </p>

          {/* Questões */}
          {questoes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileQuestion className="w-5 h-5" style={{ color: "#0066FF" }} />
                <h2 className="text-base font-semibold text-slate-700">
                  Questões <span className="text-slate-400 font-normal">({questoes.length})</span>
                </h2>
              </div>
              <div className="space-y-3">
                {questoes.map((q_) => (
                  <div
                    key={q_.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {q_.disciplina && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 font-medium" style={{ color: "#0066FF" }}>
                          {q_.disciplina}
                        </span>
                      )}
                      {q_.tema && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {q_.tema}
                        </span>
                      )}
                      {q_.dificuldade && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          q_.dificuldade === "facil" ? "bg-green-50 text-green-600" :
                          q_.dificuldade === "dificil" ? "bg-red-50 text-red-600" :
                          "bg-yellow-50 text-yellow-600"
                        }`}>
                          {q_.dificuldade}
                        </span>
                      )}
                      {q_.prova && (
                        <span className="text-xs text-slate-400 ml-auto">{q_.prova.nome}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 line-clamp-3">{q_.enunciado}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Aulas */}
          {aulas.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5" style={{ color: "#0066FF" }} />
                <h2 className="text-base font-semibold text-slate-700">
                  Aulas <span className="text-slate-400 font-normal">({aulas.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {aulas.map((aula) => (
                  <Link
                    key={aula.id}
                    href={`/aulas/${aula.id}`}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 font-medium" style={{ color: "#0066FF" }}>
                        {aula.disciplina}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">
                        {aula.tipo}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2">{aula.titulo}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{aula.descricao}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Provas */}
          {provas.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="w-5 h-5" style={{ color: "#0066FF" }} />
                <h2 className="text-base font-semibold text-slate-700">
                  Provas <span className="text-slate-400 font-normal">({provas.length})</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {provas.map((prova) => (
                  <Link
                    key={prova.id}
                    href={`/provas/${prova.id}`}
                    className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-1"
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 font-medium" style={{ color: "#0066FF" }}>
                        {prova.tipo}
                      </span>
                      {prova.ano && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {prova.ano}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-1">{prova.nome}</h3>
                    {prova.descricao && (
                      <p className="text-xs text-slate-500 line-clamp-2">{prova.descricao}</p>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
