"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Home,
  BookOpen,
  ClipboardList,
  Zap,
  TrendingUp,
  BarChart2,
  Stethoscope,
  LogOut,
  Search,
  RotateCcw,
  Sparkles,
  Menu,
  X,
  UserCircle,
} from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/aulas", label: "Aulas", icon: BookOpen },
  { href: "/provas", label: "Provas", icon: ClipboardList },
  { href: "/testes", label: "Testes", icon: Zap },
  { href: "/progresso", label: "Progresso", icon: TrendingUp },
  { href: "/notas", label: "Notas", icon: BarChart2 },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/revisar", label: "Revisar", icon: RotateCcw },
  { href: "/gerar", label: "Gerar IA", icon: Sparkles },
  { href: "/perfil", label: "Perfil", icon: UserCircle },
]

interface SidebarProps {
  user: { name?: string | null; email?: string | null }
  signOutAction: () => Promise<void>
}

function NavContent({ user, signOutAction, onClose }: SidebarProps & { onClose?: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-600">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-lg">alanis.med</span>
            <p className="text-xs text-slate-400">Residência Médica</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-blue-600" : "text-slate-400"}`} />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </form>
      </div>
    </div>
  )
}

export function Sidebar({ user, signOutAction }: SidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Fechar drawer quando a rota muda (ex: botão voltar do browser)
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800">alanis.med</span>
        </div>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <NavContent user={user} signOutAction={signOutAction} onClose={() => setOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shadow-sm flex-shrink-0">
        <NavContent user={user} signOutAction={signOutAction} />
      </aside>
    </>
  )
}
