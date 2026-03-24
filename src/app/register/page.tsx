import { handleRegister } from "@/app/actions/auth"
import Link from "next/link"
import { Stethoscope, UserPlus } from "lucide-react"

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-500 rounded-2xl shadow-lg mb-4">
            <Stethoscope className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">alanis.med</h1>
          <p className="text-slate-500 mt-1">Crie sua conta e comece a estudar</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-6">Criar conta</h2>

          {params.error === "exists" && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              Este email já está em uso. Tente fazer login.
            </div>
          )}
          {params.error === "invalid" && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              Dados inválidos. A senha deve ter pelo menos 6 caracteres.
            </div>
          )}

          <form action={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1.5">
                Nome completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Seu nome"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700 placeholder-slate-400 transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="seu@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700 placeholder-slate-400 transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1.5">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700 placeholder-slate-400 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              Criar conta
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Já tem conta?{" "}
            <Link href="/login" className="text-sky-600 hover:text-sky-700 font-medium">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
