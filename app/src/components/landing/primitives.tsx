import { useRef, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react'
import { motion, useReducedMotion, useSpring } from 'framer-motion'

export const EASE = [0.16, 1, 0.3, 1] as const

// Atrae levemente su contenido hacia el cursor (efecto magnético).
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const reduce = useReducedMotion()
  const x = useSpring(0, { stiffness: 220, damping: 15 })
  const y = useSpring(0, { stiffness: 220, damping: 15 })

  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div style={{ x, y }} onPointerMove={handleMove} onPointerLeave={handleLeave} className="inline-block">
      {children}
    </motion.div>
  )
}

// Revela cada línea de texto desde una máscara inferior. El disparador vive en
// el contenedor: la línea oculta queda recortada y nunca "entraría en vista".
export function MaskLines({
  lines,
  delay = 0,
  inView = false,
}: {
  lines: ReactNode[]
  delay?: number
  inView?: boolean
}) {
  return (
    <motion.span
      className="block"
      initial="hidden"
      {...(inView ? { whileInView: 'show', viewport: { once: true, margin: '-60px' } } : { animate: 'show' })}
    >
      {lines.map((line, i) => (
        <span key={i} className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
          <motion.span
            className="block"
            variants={{ hidden: { y: '110%' }, show: { y: '0%' } }}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.11 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </motion.span>
  )
}

export function FadeUp({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  )
}

export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 font-chart text-[11px] uppercase tracking-[0.3em] ${className}`}>
      <span className="h-px w-8 bg-rojo" />
      {children}
    </span>
  )
}

// Tarjeta con un halo que sigue al cursor por encima del contenido.
export function SpotlightCard({
  children,
  className = '',
  glow = 'rgba(225,29,46,0.16)',
}: {
  children: ReactNode
  className?: string
  glow?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const handleMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${e.clientX - r.left}px`)
    el.style.setProperty('--spot-y', `${e.clientY - r.top}px`)
  }

  return (
    <div ref={ref} onPointerMove={handleMove} className={`group relative overflow-hidden rounded-[28px] ${className}`}>
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(420px circle at var(--spot-x) var(--spot-y), ${glow}, transparent 65%)` }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  )
}

const FAKE_QR = [
  '111110101',
  '100010101',
  '101110111',
  '101010001',
  '111110111',
  '000101010',
  '111011101',
  '100001101',
  '111111111',
]

export function FakeQr({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <div className={`${className} shrink-0 rounded-lg bg-white p-[8%]`}>
      <div className="grid h-full w-full grid-cols-9 gap-[6%]">
        {FAKE_QR.flatMap((row, r) =>
          row.split('').map((bit, c) => (
            <span key={`${r}-${c}`} className={bit === '1' ? 'rounded-[1px] bg-marino' : ''} />
          )),
        )}
      </div>
    </div>
  )
}

export function PhoneFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-[2.6rem] bg-[#050f1c] p-[9px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.65)] ring-1 ring-white/10 ${className}`}
    >
      <div className="absolute left-1/2 top-[15px] z-30 h-[16px] w-[32%] -translate-x-1/2 rounded-full bg-black" />
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2.05rem] bg-white">{children}</div>
    </div>
  )
}
