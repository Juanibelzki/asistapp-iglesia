import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'neutral' | 'primary' | 'accent' | 'success' | 'danger'

const tones: Record<Tone, string> = {
  neutral: 'bg-sunken text-ink-soft',
  primary: 'bg-primary-soft text-primary',
  accent: 'bg-accent-soft text-warning',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
}

export function Badge({ tone = 'neutral', className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', tones[tone], className)}
      {...rest}
    />
  )
}
