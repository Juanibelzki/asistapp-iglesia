import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const control =
  'w-full rounded-xl border border-line-strong bg-surface px-3.5 text-base sm:text-[15px] text-ink placeholder:text-ink-faint ' +
  'transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:opacity-60 ' +
  'aria-[invalid=true]:border-danger'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} className={cn(control, 'h-11', className)} {...rest} />
})

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cn(control, 'py-2.5 min-h-24', className)} {...rest} />
  },
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...rest },
  ref,
) {
  return (
    <select ref={ref} className={cn(control, 'h-11 appearance-none pr-9 bg-no-repeat select-chevron', className)} {...rest}>
      {children}
    </select>
  )
})

interface FieldProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  /** Render prop: recibe el id para enlazar label ↔ control. */
  children: (id: string) => ReactNode
}

export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-0.5 text-danger" aria-hidden> *</span>}
      </label>
      {children(id)}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}

interface SwitchProps {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
  description?: string
}

export function SwitchRow({ checked, onChange, label, description }: SwitchProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-sunken/60 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{label}</p>
        {description && <p className="mt-0.5 text-xs text-ink-faint">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-line-strong',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  )
}
