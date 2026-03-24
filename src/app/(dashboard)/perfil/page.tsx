import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { User, Mail, Stethoscope, Trophy, Flame, Star, Target, TrendingUp, Shield } from "lucide-react"
import { ProgressBar } from "@/components/ui/progress-bar"

export default async function PerfilPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  const [user, totalNotas, totalTestes, totalAulas, totalProgresso] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      include: {
        badges: { include: { badge: true }, orderBy: { ganhoEm: "desc" } },
        metas: { orderBy: { data: "desc" } },
      },
    }),
    db.nota.count({ where: { userId } }),
    db.teste.count({ where: { userId, completado: true } }),
    db.aula.count({ where: { ativo: true } }),
    db.progresso.count({ where: { userId, concluido: true } }),
  ])

  if (!user) redirect("/login")

  const nivel = Math.floor(user.pontos / 500) + 1
  const xpNivel = user.pontos % 500
  const xpProximo = 500

  const taxaAprovacao = totalNotas > 0
    ? await db.nota.count({ where: { userId, aprovado: true } }).then((a) => Math.round((a / totalNotas) * 100))
    : 0

  async function atualizarPerfil(formData: FormData) {
    "use server"
    const session = await auth()
    if (!session?.user?.id) return

    const name = (formData.get("name") as string)?.trim()
    const especialidade = (formData.get("especialidade") as string)?.trim()

    if (!name) return

    await db.user.update({
      where: { id: session.user.id },
      data: { name, especialidade: especialidade || null },
    })

    revalidatePath("/perfil")
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
        <p className="text-slate-500 mt-1">Seus dados e estatísticas de estudo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: perfil + edição */}
        <div className="space-y-5">
          {/* Avatar + nível */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-3">
              <span className="text-white text-3xl font-bold">{user.name[0]?.toUpperCase()}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            {user.especialidade && (
              <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                <Stethoscope className="w-3 h-3" />
                {user.especialidade}
              </div>
            )}

            <div className="w-full mt-5">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span className="font-semibold text-slate-700">Nível {nivel}</span>
                <span>{xpNivel}/{xpProximo} XP</span>
              </div>
              <ProgressBar value={xpNivel} max={xpProximo} color="blue" size="sm" />
              <p className="text-xs text-slate-400 mt-1">{user.pontos} XP total</p>
            </div>

            <div className="flex items-center gap-2 mt-4 text-sm">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-orange-600">{user.streakDias}</span>
              <span className="text-slate-500">dias seguidos</span>
            </div>
          </div>

          {/* Editar perfil */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Editar Perfil
            </h3>
            <form action={atualizarPerfil} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Nome</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={user.name}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-slate-100 rounded-lg text-sm text-slate-400 bg-slate-50 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Especialidade de interesse</label>
                <input
                  type="text"
                  name="especialidade"
                  defaultValue={user.especialidade ?? ""}
                  placeholder="Ex: Clínica Médica, Pediatria..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Salvar Alterações
              </button>
            </form>
          </div>
        </div>

        {/* Right: stats + badges + metas */}
        <div className="lg:col-span-2 space-y-5">
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xl font-bold text-slate-800">{totalTestes}</p>
              <p className="text-xs text-slate-500">Provas feitas</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-slate-800">{taxaAprovacao}%</p>
              <p className="text-xs text-slate-500">Taxa aprovação</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-xl font-bold text-slate-800">{user.pontos}</p>
              <p className="text-xs text-slate-500">XP total</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xl font-bold text-slate-800">{totalProgresso}/{totalAulas}</p>
              <p className="text-xs text-slate-500">Aulas concluídas</p>
            </div>
          </div>

          {/* Plano */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100 font-medium">Plano atual</p>
                <p className="text-2xl font-bold capitalize mt-0.5">{user.planoAtivo}</p>
                <p className="text-sm text-blue-100 mt-1">
                  {user.planoAtivo === "pro"
                    ? "Acesso completo a todos os recursos"
                    : "Acesso básico — faça upgrade para o Pro"}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Star className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-slate-700">Conquistas</h3>
              <span className="ml-auto text-xs text-slate-400">{user.badges.length} conquistadas</span>
            </div>
            {user.badges.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Nenhuma conquista ainda. Complete provas para ganhar badges!</p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {user.badges.map(({ badge, ganhoEm }) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center text-center p-2 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                    title={`${badge.nome}: ${badge.descricao}\nGanho em: ${new Date(ganhoEm).toLocaleDateString("pt-BR")}`}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-1.5"
                      style={{ backgroundColor: `${badge.cor}18`, border: `2px solid ${badge.cor}30` }}
                    >
                      {badge.icone}
                    </div>
                    <p className="text-xs font-medium text-slate-700 leading-tight">{badge.nome}</p>
                    <p className="text-xs text-amber-500">+{badge.pontos} XP</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metas */}
          {user.metas.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-slate-700">Metas</h3>
              </div>
              <div className="space-y-4">
                {user.metas.map((meta) => {
                  const pct = Math.min(Math.round((meta.atual / meta.meta) * 100), 100)
                  return (
                    <div key={meta.id}>
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="text-sm font-medium text-slate-700">{meta.descricao}</span>
                          <span className="ml-2 text-xs text-slate-400 capitalize">({meta.tipo})</span>
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
      </div>
    </div>
  )
}
