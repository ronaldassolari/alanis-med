import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { Zap, BookOpen, Clock, Shuffle, ArrowRight, ClipboardList } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function TestesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  const disciplinas = await db.aula.findMany({
    where: { ativo: true },
    select: { disciplina: true },
    distinct: ["disciplina"],
  })

  const testesList = await db.teste.findMany({
    where: { userId, completado: true },
    include: { nota: true, prova: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  })

  async function iniciarTesteRapido(formData: FormData) {
    "use server"
    const tipo = formData.get("tipo") as string
    const disciplina = formData.get("disciplina") as string | null

    const session = await auth()
    if (!session?.user?.id) redirect("/login")

    // Get random questions from db
    let where: Record<string, unknown> = {}
    if (disciplina) where = { disciplina }

    const provas = await db.prova.findMany({
      where: { ativo: true },
      include: {
        questoes: {
          where: disciplina ? { disciplina } : {},
          take: 50,
        },
      },
    })

    const allQuestoes = provas.flatMap((p) => p.questoes.map((q) => ({ ...q, provaId: p.id })))
    const shuffled = allQuestoes.sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, tipo === "cronometrado" ? 10 : 5)

    if (selected.length === 0) {
      redirect("/testes?error=no-questions")
    }

    // For quick tests, use first available prova
    const provaId = selected[0]?.provaId ?? null

    redirect(`/provas/${provaId}`)
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Testes Rápidos</h1>
        <p className="text-slate-500 mt-1">Treine com questões selecionadas por tema, tempo ou aleatórias</p>
      </div>

      {/* Test options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Tematico */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6 text-sky-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Teste Temático</h2>
          <p className="text-sm text-slate-500 mb-4">Escolha uma disciplina e pratique 5 questões relacionadas</p>

          <form action={iniciarTesteRapido}>
            <input type="hidden" name="tipo" value="tematico" />
            <div className="mb-3">
              <label className="block text-xs text-slate-500 mb-1 font-medium">Disciplina</label>
              <select
                name="disciplina"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Todas</option>
                {disciplinas.map((d) => (
                  <option key={d.disciplina} value={d.disciplina}>
                    {d.disciplina}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors"
            >
              <Zap className="w-4 h-4" />
              Iniciar Teste
            </button>
          </form>
        </div>

        {/* Cronometrado */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Teste Cronometrado</h2>
          <p className="text-sm text-slate-500 mb-4">10 questões aleatórias com cronômetro ativado</p>

          <form action={iniciarTesteRapido}>
            <input type="hidden" name="tipo" value="cronometrado" />
            <input type="hidden" name="disciplina" value="" />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors mt-12"
            >
              <Clock className="w-4 h-4" />
              Iniciar Cronometrado
            </button>
          </form>
        </div>

        {/* Surpresa */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <Shuffle className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1">Teste Surpresa</h2>
          <p className="text-sm text-slate-500 mb-4">Questões aleatórias de qualquer disciplina, sem filtros!</p>

          <form action={iniciarTesteRapido}>
            <input type="hidden" name="tipo" value="surpresa" />
            <input type="hidden" name="disciplina" value="" />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors mt-12"
            >
              <Shuffle className="w-4 h-4" />
              Surpreenda-me!
            </button>
          </form>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Histórico de Testes</h2>
        {testesList.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Nenhum teste realizado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-slate-500 font-medium">Data</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-medium">Tipo</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-medium">Acertos</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-medium">Nota</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-medium">Resultado</th>
                </tr>
              </thead>
              <tbody>
                {testesList.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 text-slate-600">
                      {new Date(t.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-2 px-3">
                      <Badge variant="gray">{t.tipo}</Badge>
                    </td>
                    <td className="py-2 px-3 text-slate-600">
                      {t.acertos}/{t.total}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-700">
                      {t.nota ? `${Math.round(t.nota.valor)}%` : "-"}
                    </td>
                    <td className="py-2 px-3">
                      {t.nota ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.nota.aprovado ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                          {t.nota.aprovado ? "Aprovado" : "Reprovado"}
                        </span>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
