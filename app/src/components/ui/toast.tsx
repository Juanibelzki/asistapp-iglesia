import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '../../lib/cn'

type ToastTone = 'success' | 'error'
interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const push = useCallback((message: string, tone: ToastTone = 'success') => {
    const id = Date.now() + Math.random()
    setItems((prev) => [...prev, { id, message, tone }])
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const value = useMemo(() => push, [push])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        {items.map((t) => {
          const Icon = t.tone === 'success' ? CheckCircle2 : AlertCircle
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex max-w-md animate-pop items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-semibold shadow-pop',
                t.tone === 'success' ? 'bg-ink text-canvas' : 'bg-danger text-white',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {t.message}
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
