import { handleLogin } from "@/app/actions/auth"
import Link from "next/link"
import { Stethoscope, LogIn } from "lucide-react"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; registered?: string }>
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
          <p className="text-slate-500 mt-1">Sua jornada para a residência começa aqui</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <h2 className="text-xl font-semibold text-slate-700 mb-6">Entrar na plataforma</h2>

          {params.error === "invalid" && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              Email ou senha incorretos. Tente novamente.
            </div>
          )}

          {params.registered === "true" && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
              Conta criada com sucesso! Faça login para continuar.
            </div>
          )}

          <form action={handleLogin} className="space-y-4">
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
                defaultValue="alanis@med.com"
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
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-slate-700 placeholder-slate-400 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              Entrar
            </button>
          </form>

          <div className="mt-4 p-3 bg-sky-50 border border-sky-100 rounded-lg text-xs text-sky-600">
            <strong>Demo:</strong> alanis@med.com / alanis123
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Não tem conta?{" "}
            <Link href="/register" className="text-sky-600 hover:text-sky-700 font-medium">
              Criar conta
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          alanis.med &copy; {new Date().getFullYear()} — Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}
