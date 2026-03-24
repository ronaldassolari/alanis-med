import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { RotateCcw, CheckCircle, XCircle, BookOpen } from "lucide-react"

export default async function RevisarPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  // Buscar todos os testes completados com prova associada
  const testes = await db.teste.findMany({
    where: {
      userId,
      completado: true,
      provaId: { not: null },
    },
    include: {
      prova: { select: { id: true, nome: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Filtrar em JS: testes onde houve erros (acertos < total)
  const testesComErros = testes.filter((t) => t.acertos < t.total)

  // IDs de provas únicas dos testes com erros
  const provaIds = [...new Set(testesComErros.map((t) => t.provaId).filter(Boolean) as string[])]

  // Buscar questões das provas com erros
  const questoes = provaIds.length > 0
    ? await db.questao.findMany({
        where: { provaId: { in: provaIds } },
        include: { prova: { select: { nome: true } } },
        orderBy: [{ disciplina: "asc" }, { ordem: "asc" }],
        take: 20,
      })
    : []

  // Agrupar questões por disciplina
  const porDisciplina = questoes.reduce<Record<string, typeof questoes>>((acc, q) => {
    const disc = q.disciplina ?? "Geral"
    if (!acc[disc]) acc[disc] = []
    acc[disc].push(q)
    return acc
  }, {})

  const disciplinas = Object.keys(porDisciplina).sort()

  const gabaritoCores: Record<string, string> = {
    A: "bg-blue-50 text-blue-700 border-blue-200",
    B: "bg-blue-50 text-blue-700 border-blue-200",
    C: "bg-blue-50 text-blue-700 border-blue-200",
    D: "bg-blue-50 text-blue-700 border-blue-200",
    E: "bg-blue-50 text-blue-700 border-blue-200",
  }

  const opcaoLabel: Record<string, string> = {
    A: "opcaoA",
    B: "opcaoB",
    C: "opcaoC",
    D: "opcaoD",
    E: "opcaoE",
  }

  return (
    <div className="p-8 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#0066FF" }}>
            <RotateCcw className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Revisão Espaçada</h1>
            <p className="text-slate-500 mt-0.5">Questões das provas onde você teve erros</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Testes com erros</p>
          <p className="text-2xl font-bold text-slate-800">{testesComErros.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Questões para revisar</p>
          <p className="text-2xl font-bold" style={{ color: "#0066FF" }}>{questoes.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <p className="text-xs text-slate-500 mb-1">Disciplinas</p>
          <p className="text-2xl font-bold text-slate-800">{disciplinas.length}</p>
        </div>
      </div>

      {/* Content */}
      {testesComErros.length === 0 ? (
        <div className="text-center py-20">
          <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-3" />
          <p className="text-slate-600 font-semibold text-lg">Parabéns! Nenhum erro encontrado</p>
          <p className="text-slate-400 text-sm mt-1">
            Complete mais testes para que possamos identificar pontos de melhoria
          </p>
        </div>
      ) : questoes.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">Nenhuma questão encontrada para revisão.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {disciplinas.map((disciplina) => (
            <section key={disciplina}>
              {/* Disciplina header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-1 h-6 rounded-full"
                  style={{ backgroundColor: "#0066FF" }}
                />
                <h2 className="text-lg font-bold text-slate-800">{disciplina}</h2>
                <span className="text-sm text-slate-400">
                  {porDisciplina[disciplina].length} questão{porDisciplina[disciplina].length !== 1 ? "ões" : ""}
                </span>
              </div>

              <div className="space-y-5">
                {porDisciplina[disciplina].map((questao, idx) => {
                  const opcoes: Array<{ letra: string; texto: string }> = [
                    { letra: "A", texto: questao.opcaoA },
                    { letra: "B", texto: questao.opcaoB },
                    { letra: "C", texto: questao.opcaoC },
                    { letra: "D", texto: questao.opcaoD },
                    ...(questao.opcaoE ? [{ letra: "E", texto: questao.opcaoE }] : []),
                  ]

                  return (
                    <div
                      key={questao.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      {/* Question header */}
                      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-500">Q{idx + 1}</span>
                          {questao.tema && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 font-medium" style={{ color: "#0066FF" }}>
                              {questao.tema}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            questao.dificuldade === "facil" ? "bg-green-50 text-green-600" :
                            questao.dificuldade === "dificil" ? "bg-red-50 text-red-600" :
                            "bg-yellow-50 text-yellow-600"
                          }`}>
                            {questao.dificuldade}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{questao.prova.nome}</span>
                      </div>

                      <div className="p-5">
                        {/* Enunciado */}
                        <p className="text-sm text-slate-700 leading-relaxed mb-4">{questao.enunciado}</p>

                        {/* Opções */}
                        <div className="space-y-2 mb-4">
                          {opcoes.map(({ letra, texto }) => {
                            const isGabarito = questao.gabarito === letra
                            return (
                              <div
                                key={letra}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                                  isGabarito
                                    ? "bg-green-50 border-green-200 text-green-800"
                                    : "bg-slate-50 border-slate-200 text-slate-600"
                                }`}
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                                  isGabarito
                                    ? "bg-green-500 text-white"
                                    : "bg-slate-200 text-slate-500"
                                }`}>
                                  {letra}
                                </div>
                                <span className="flex-1">{texto}</span>
                                {isGabarito && (
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                )}
                              </div>
                            )
                          })}
                        </div>

                        {/* Gabarito destaque */}
                        <div
                          className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3"
                          style={{ backgroundColor: "#0066FF12" }}
                        >
                          <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#0066FF" }} />
                          <span className="text-sm font-semibold" style={{ color: "#0066FF" }}>
                            Gabarito: Alternativa {questao.gabarito}
                          </span>
                        </div>

                        {/* Explicação */}
                        {questao.explicacao && (
                          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                            <p className="text-xs font-semibold text-amber-700 mb-1 uppercase tracking-wide">Explicação</p>
                            <p className="text-sm text-amber-800 leading-relaxed">{questao.explicacao}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
