interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  color?: "blue" | "green" | "yellow" | "red"
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

const colorClasses = {
  blue: "bg-sky-500",
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
}

const heightClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
}

export function ProgressBar({
  value,
  max = 100,
  className = "",
  color = "blue",
  showLabel = false,
  size = "md",
}: ProgressBarProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100)

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Progresso</span>
          <span>{percent}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${heightClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
