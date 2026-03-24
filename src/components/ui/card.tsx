import { type HTMLAttributes } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = "", ...props }: CardProps) {
  return (
    <div className={`px-6 py-4 border-b border-slate-100 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = "", ...props }: CardProps) {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  )
}
