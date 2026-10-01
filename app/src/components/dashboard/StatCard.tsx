import type { ReactNode } from 'react'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/feedback'
import { cn } from '../../lib/cn'

type Tone = 'primary' | 'accent' | 'success' | 'neutral'

const tones: Record<Tone, string> = {
  primary: 'bg-primary-soft text-primary',
  accent: 'bg-accent-soft text-warning',
  success: 'bg-success-soft text-success',
  neutral: 'bg-sunken text-ink-soft',
}

interface StatCardProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon: ReactNode
  tone?: Tone
  loading?: boolean
}

export function StatCard({ label, value, hint, icon, tone = 'primary', loading }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-ink-soft">{label}</p>
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', tones[tone])}>{icon}</span>
      </div>
      {loading ? (
        <Skeleton className="mt-4 h-9 w-20" />
      ) : (
        <p className="mt-3 font-display text-4xl font-extrabold tabular-nums text-ink">{value}</p>
      )}
      {loading ? <Skeleton className="mt-2 h-4 w-32" /> : hint && <p className="mt-1 truncate text-xs text-ink-faint">{hint}</p>}
    </Card>
  )
}
