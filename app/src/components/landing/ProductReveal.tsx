import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import {
  AlertTriangle,
  CalendarDays,
  FileSpreadsheet,
  LayoutDashboard,
  QrCode,
  TrendingUp,
  Users,
} from 'lucide-react'
import { EASE } from './primitives'

// Panel pastoral de ejemplo que "emerge" sobre el hero: arranca inclinado en
// perspectiva y se aplana a medida que se hace scroll.

const NAMES = [
  'Lucas Martínez',
  'Sofía Díaz',
  'Mateo Sánchez',
  'Valentina Torres',
  'Hugo Romero',
  'Martina Ruiz',
  'Daniel Jiménez',
  'Lucía García',
]
const MINISTRIES = ['Jóvenes', 'Alabanza', 'Niños', 'Ujieres', 'Matrimonios']

const WEEKS = [96, 104, 99, 112, 118, 109, 124, 131, 127, 138, 135, 142]
const CHART_W = 520
const CHART_H = 150
const points = WEEKS.map((v, i) => [
  (i / (WEEKS.length - 1)) * CHART_W,
  CHART_H - ((v - 80) / 80) * CHART_H,
])
const LINE_PATH = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
const AREA_PATH = `${LINE_PATH} L${CHART_W},${CHART_H} L0,${CHART_H} Z`

function LiveCheckins() {
  const [items, setItems] = useState(() => [3, 2, 1, 0].map((id) => ({ id })))
  useEffect(() => {
    let next = 4
    const t = setInterval(() => {
      setItems((prev) => [{ id: next }, ...prev].slice(0, 4))
      next++
    }, 1900)
    return () => clearInterval(t)
  }, [])

  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {items.map(({ id }) => (
          <motion.li
            key={id}
            layout
            initial={{ opacity: 0, y: -14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="flex items-center gap-3 rounded-xl border border-marino/8 bg-blanco-mar px-3 py-2.5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-marino text-[11px] font-bold text-white">
              {NAMES[id % NAMES.length][0]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-semibold text-marino">{NAMES[id % NAMES.length]}</span>
              <span className="block text-[10px] text-marino/50">{MINISTRIES[id % MINISTRIES.length]}</span>
            </span>
            <span className="font-chart text-[10px] text-marino/50">10:{String(2 + (id % 50)).padStart(2, '0')}</span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}

function DashboardWindow() {
  const [present, setPresent] = useState(138)
  useEffect(() => {
    const t = setInterval(() => setPresent((p) => (p >= 160 ? 138 : p + 1)), 1900)
    return () => clearInterval(t)
  }, [])

  const kpis = [
    { label: 'Congregados', value: '248', note: '12 nuevos este mes' },
    { label: 'Presentes hoy', value: String(present), note: 'Culto general', live: true },
    { label: 'Familias', value: '86', note: '5 ministerios' },
    { label: 'Para visitar', value: '9', note: '+2 semanas sin venir', alert: true },
  ]

  return (
    <div className="overflow-hidden rounded-[22px] bg-white text-marino shadow-[0_60px_120px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/20">
      {/* Barra de ventana */}
      <div className="flex items-center gap-2 bg-[#0d2240] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-rojo" />
        <span className="h-3 w-3 rounded-full bg-white/80" />
        <span className="h-3 w-3 rounded-full bg-marino-soft" />
        <span className="mx-auto font-chart text-[11px] tracking-wide text-white/50">Ecclesiahs — Panel pastoral</span>
      </div>

      <div className="flex">
        <aside className="hidden w-52 shrink-0 border-r border-marino/8 bg-blanco-mar p-4 md:block">
          <p className="mb-4 px-2 font-display text-lg">Camino de Vida</p>
          {[
            [LayoutDashboard, 'Panel', true],
            [Users, 'Congregados', false],
            [CalendarDays, 'Eventos', false],
            [QrCode, 'Asistencia', false],
            [FileSpreadsheet, 'Reportes', false],
          ].map(([Icon, label, active]) => {
            const I = Icon as typeof Users
            return (
              <div
                key={label as string}
                className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] ${
                  active ? 'bg-marino font-semibold text-white' : 'text-marino/60'
                }`}
              >
                <I className="h-4 w-4" />
                {label as string}
              </div>
            )
          })}
        </aside>

        <div className="min-w-0 flex-1 p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-chart text-[10px] uppercase tracking-[0.25em] text-marino/45">Domingo · 10:00</p>
              <p className="font-display text-2xl sm:text-3xl">Buen domingo, pastor</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-rojo/10 px-3 py-1.5 text-[11px] font-semibold text-rojo">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rojo" /> Culto en curso
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {kpis.map((k) => (
              <div
                key={k.label}
                className={`rounded-2xl border p-4 ${k.alert ? 'border-rojo/25 bg-rojo/[0.06]' : 'border-marino/8 bg-blanco-mar'}`}
              >
                <p className={`text-[11px] ${k.alert ? 'text-rojo' : 'text-marino/55'}`}>{k.label}</p>
                <div className="relative h-10 overflow-hidden">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.p
                      key={k.value}
                      initial={k.live ? { y: 30, opacity: 0 } : false}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -30, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className={`font-display text-[32px] leading-10 ${k.alert ? 'text-rojo' : ''}`}
                    >
                      {k.value}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <p className="mt-1 truncate text-[10px] text-marino/45">{k.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-marino/8 p-4 lg:col-span-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-semibold">Asistencia · últimas 12 semanas</p>
                <TrendingUp className="h-4 w-4 text-rojo" />
              </div>
              <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="h-36 w-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0b2545" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#0b2545" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((f) => (
                  <line key={f} x1="0" x2={CHART_W} y1={CHART_H * f} y2={CHART_H * f} stroke="#0b2545" strokeOpacity="0.07" />
                ))}
                <motion.path
                  d={AREA_PATH}
                  fill="url(#area-fill)"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
                <motion.path
                  d={LINE_PATH}
                  fill="none"
                  stroke="#0b2545"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.8, ease: EASE }}
                />
                <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="5" fill="#e11d2e" />
              </svg>
            </div>

            <div className="rounded-2xl border border-marino/8 p-4 lg:col-span-2">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[13px] font-semibold">Check-ins en vivo</p>
                <QrCode className="h-4 w-4 text-marino/50" />
              </div>
              <LiveCheckins />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-marino px-4 py-3 text-white">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rojo" />
            <p className="text-[12px]">
              <span className="font-semibold">Familia Torres</span> lleva 3 semanas sin venir. Sugerencia: llamar esta semana.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductReveal() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 15%'] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [28, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1])
  const y = useTransform(scrollYProgress, [0, 1], [60, 0])

  return (
    <section
      id="producto"
      ref={ref}
      className="relative z-10 scroll-mt-24 bg-marino-deep px-4 pb-24 sm:px-6 md:-mt-28"
      style={{ perspective: 1600 }}
    >
      <motion.div style={{ rotateX, scale, y, transformOrigin: '50% 0%' }} className="mx-auto max-w-6xl">
        <DashboardWindow />
      </motion.div>
      <p className="mx-auto mt-6 max-w-6xl text-center font-chart text-[10px] uppercase tracking-[0.3em] text-white/40">
        Panel pastoral · datos de ejemplo
      </p>
    </section>
  )
}
