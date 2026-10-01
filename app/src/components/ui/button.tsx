import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link, type LinkProps } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const base =
  'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none transition-all duration-150 ' +
  'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-ink hover:bg-primary-hover shadow-sm',
  accent: 'bg-accent text-accent-ink hover:brightness-95 shadow-sm',
  secondary: 'bg-surface text-ink border border-line-strong hover:bg-sunken',
  ghost: 'text-ink-soft hover:text-ink hover:bg-sunken',
  danger: 'bg-danger-soft text-danger hover:brightness-95',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-xl',
  md: 'h-11 px-5 text-sm rounded-xl',
  lg: 'h-13 px-7 text-base rounded-2xl',
  icon: 'h-9 w-9 rounded-xl',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, loading, leftIcon, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
      {children}
    </button>
  )
})

/** Enlace del router con apariencia de botón. */
export function LinkButton({
  variant,
  size,
  className,
  children,
  ...rest
}: LinkProps & { variant?: Variant; size?: Size; className?: string; children: ReactNode }) {
  return (
    <Link className={buttonClass(variant, size, className)} {...(rest as LinkProps)}>
      {children}
    </Link>
  )
}
