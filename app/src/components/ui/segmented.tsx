import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface Option<T extends string> {
  value: T
  label: ReactNode
  count?: number
}

interface SegmentedProps<T extends string> {
  value: T
  onChange: (v: T) => void
  options: Option<T>[]
  label: string
  className?: string
}

/** Selector segmentado accesible (role=tablist). */
export function Segmented<T extends string>({ value, onChange, options, label, className }: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn('no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-xl bg-sunken p-1', className)}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all',
              active ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft hover:text-ink',
            )}
          >
            {o.label}
            {o.count !== undefined && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] leading-none',
                  active ? 'bg-primary-soft text-primary' : 'bg-line text-ink-faint',
                )}
              >
                {o.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
