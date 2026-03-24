import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: "blue" | "green" | "yellow" | "purple"
  sub?: string
}

const colorClasses = {
  blue: { bg: "bg-sky-100", text: "text-sky-600", badge: "bg-sky-50" },
  green: { bg: "bg-emerald-100", text: "text-emerald-600", badge: "bg-emerald-50" },
  yellow: { bg: "bg-amber-100", text: "text-amber-600", badge: "bg-amber-50" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", badge: "bg-purple-50" },
}

export function StatCard({ label, value, icon: Icon, color = "blue", sub }: StatCardProps) {
  const c = colorClasses[color]
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg}`}>
          <Icon className={`w-6 h-6 ${c.text}`} />
        </div>
      </div>
    </div>
  )
}
