type BadgeVariant = "blue" | "green" | "red" | "yellow" | "purple" | "gray" | "orange"

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  blue: "bg-sky-100 text-sky-700 border-sky-200",
  green: "bg-emerald-100 text-emerald-700 border-emerald-200",
  red: "bg-red-100 text-red-700 border-red-200",
  yellow: "bg-amber-100 text-amber-700 border-amber-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  gray: "bg-slate-100 text-slate-600 border-slate-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
}

const disciplinaColors: Record<string, BadgeVariant> = {
  "Clínica Médica": "blue",
  "Cirurgia": "orange",
  "Pediatria": "green",
  "Ginecologia": "purple",
  "Saúde Pública": "yellow",
}

export function Badge({ children, variant = "gray", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

export function DisciplinaBadge({ disciplina }: { disciplina: string }) {
  const variant = disciplinaColors[disciplina] ?? "gray"
  return <Badge variant={variant}>{disciplina}</Badge>
}

export function AprovadoBadge({ aprovado }: { aprovado: boolean }) {
  return (
    <Badge variant={aprovado ? "green" : "red"}>
      {aprovado ? "Aprovado" : "Reprovado"}
    </Badge>
  )
}
