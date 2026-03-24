import { type ButtonHTMLAttributes, forwardRef } from "react"

type Variant = "primary" | "secondary" | "danger" | "ghost" | "outline"
type Size = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-sky-500 hover:bg-sky-600 text-white border-transparent",
  secondary: "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent",
  danger: "bg-red-500 hover:bg-red-600 text-white border-transparent",
  ghost: "bg-transparent hover:bg-sky-50 text-sky-700 border-transparent",
  outline: "bg-white hover:bg-sky-50 text-sky-700 border-sky-300",
}

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
