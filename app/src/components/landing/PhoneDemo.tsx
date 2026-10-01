import { useEffect, useState } from 'react'
import { BadgeCheck, Users } from 'lucide-react'
import { cn } from '../../lib/cn'

type Step = 'scan' | 'success' | 'metrics'
const NEXT: Record<Step, Step> = { scan: 'success', success: 'metrics', metrics: 'scan' }
const DELAY: Record<Step, number> = { scan: 2600, success: 2000, metrics: 2400 }

// Patrón decorativo de "QR" (no codifica datos)
const QR = [
  '111111101011111',
  '100000101010001',
  '101110100110101',
  '101110101001101',
  '101110100101101',
  '100000101110001',
  '111111101010111',
  '000000000110000',
  '110101110011010',
  '001110001101100',
  '111000110010111',
  '000000001101001',
  '111111100110110',
  '100000101011001',
  '101110101100111',
]

const BARS = [38, 52, 44, 66, 58, 82, 100]

/** Teléfono demo: ciclo escaneo → check-in → métricas. */
export function PhoneDemo() {
  const [step, setStep] = useState<Step>('scan')

  useEffect(() => {
    const t = setTimeout(() => setStep(NEXT[step]), DELAY[step])
    return () => clearTimeout(t)
  }, [step])

  return (
    <div className="relative mx-auto w-[17.5rem] sm:w-[19rem]" aria-hidden>
      <div className="absolute -inset-8 rounded-full bg-gradient-to-tr from-primary/25 via-accent/20 to-transparent blur-3xl" />

      <div className="relative animate-float rounded-[2.6rem] border-[6px] border-ink bg-ink p-0 shadow-pop">
        <div className="relative aspect-[9/18.5] overflow-hidden rounded-[2.1rem] bg-surface">
          {/* isla */}
          <div className="absolute left-1/2 top-2.5 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-ink" />

          <div className="flex h-full flex-col px-5 pb-5 pt-12">
            <p className="text-center text-[11px] font-bold uppercase tracking-widest text-ink-faint">
              {step === 'metrics' ? 'Culto de domingo' : 'Check-in'}
            </p>

            <div className="relative mt-4 flex flex-1 items-center justify-center">
              {/* SCAN */}
              <div className={cn('absolute inset-0 flex items-center justify-center transition-opacity duration-300', step === 'scan' ? 'opacity-100' : 'opacity-0')}>
                <div className="relative aspect-square w-full max-w-[13rem] overflow-hidden rounded-3xl bg-sunken p-5">
                  <div className="grid h-full w-full grid-cols-[repeat(15,1fr)] gap-px">
                    {QR.join('').split('').map((c, i) => (
                      <span key={i} className={c === '1' ? 'rounded-[1px] bg-ink' : ''} />
                    ))}
                  </div>
                  {(['left-2 top-2 border-l-4 border-t-4 rounded-tl-xl', 'right-2 top-2 border-r-4 border-t-4 rounded-tr-xl', 'left-2 bottom-2 border-l-4 border-b-4 rounded-bl-xl', 'right-2 bottom-2 border-r-4 border-b-4 rounded-br-xl'] as const).map((c) => (
                    <span key={c} className={cn('absolute h-7 w-7 border-primary', c)} />
                  ))}
                  <span className="absolute inset-x-3 h-0.5 animate-scan rounded-full bg-accent shadow-[0_0_12px_2px_var(--accent)]" />
                </div>
              </div>

              {/* SUCCESS */}
              <div className={cn('absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-300', step === 'success' ? 'scale-100 opacity-100' : 'scale-95 opacity-0')}>
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-success-soft text-success">
                  <BadgeCheck className="h-11 w-11" />
                </span>
                <p className="mt-5 font-display text-lg font-extrabold text-ink">¡Asistencia confirmada!</p>
                <p className="mt-1 text-xs text-ink-soft">Lucas Martínez · Jóvenes</p>
                <p className="mt-3 rounded-full bg-sunken px-3 py-1 text-[11px] font-semibold text-ink-faint">Registrado hace un instante</p>
              </div>

              {/* METRICS */}
              <div className={cn('absolute inset-0 flex flex-col justify-center transition-opacity duration-300', step === 'metrics' ? 'opacity-100' : 'opacity-0')}>
                <div className="flex items-center gap-2 text-ink-soft">
                  <Users className="h-4 w-4" />
                  <span className="text-xs font-semibold">Presentes hoy</span>
                </div>
                <p className="mt-1 font-display text-5xl font-extrabold tabular-nums text-ink">142</p>
                <p className="text-xs font-semibold text-success">▲ 12% vs. domingo anterior</p>
                <div className="mt-5 flex h-24 items-end gap-1.5">
                  {BARS.map((h, i) => (
                    <span
                      key={i}
                      className={cn('flex-1 rounded-t-md transition-all duration-700', i === BARS.length - 1 ? 'bg-primary' : 'bg-primary/25')}
                      style={{ height: step === 'metrics' ? `${h}%` : '8%' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 h-1 w-24 self-center rounded-full bg-line-strong" />
          </div>
        </div>
      </div>
    </div>
  )
}
