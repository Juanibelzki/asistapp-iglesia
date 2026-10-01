import { Link } from '@tanstack/react-router'
import { cn } from '../../lib/cn'

/** Isotipo: ventana en arco (vitral) con check de asistencia. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path d="M9.5 24.5V14.2a6.5 6.5 0 0 1 13 0v10.3z" className="fill-primary-ink" opacity="0.96" />
      <path
        d="M12.8 18.4l2.5 2.5 4.2-4.9"
        fill="none"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary"
      />
      <circle cx="24.5" cy="7.5" r="2.2" className="fill-accent" />
    </svg>
  )
}

interface LogoProps {
  className?: string
  /** Muestra solo el isotipo. */
  compact?: boolean
  asLink?: boolean
}

export function Logo({ className, compact, asLink = true }: LogoProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      {!compact && <span className="font-display text-xl font-extrabold tracking-tight text-ink">Ecclesiahs</span>}
    </span>
  )
  if (!asLink) return content
  return (
    <Link to="/" aria-label="Ecclesiahs — inicio">
      {content}
    </Link>
  )
}
