import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck, CircleCheck, Download, FileSpreadsheet, RefreshCw, RotateCw, WifiOff } from 'lucide-react'
import { EASE, FadeUp, FakeQr, Kicker, MaskLines, ScanLine, SpotlightCard, useOnScreen } from './primitives'

function LiveCounter() {
  const [count, setCount] = useState(142)
  const [ref, onScreen] = useOnScreen<HTMLDivElement>()
  useEffect(() => {
    if (!onScreen) return
    const t = setInterval(() => setCount((c) => (c >= 168 ? 142 : c + 1)), 2200)
    return () => clearInterval(t)
  }, [onScreen])
  return (
    <div ref={ref} className="text-right">
      <div className="relative h-[72px] overflow-hidden sm:h-[88px]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={count}
            initial={{ y: '100%' }}
            animate={{ y: '0%' }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-display text-[72px] font-light leading-none sm:text-[88px]"
          >
            {count}
          </motion.p>
        </AnimatePresence>
      </div>
      <p className="font-chart text-[10px] uppercase tracking-[0.25em] text-white/50">presentes hoy</p>
    </div>
  )
}

function FlipCredential() {
  const [flipped, setFlipped] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      aria-label={flipped ? 'Ver frente de la credencial' : 'Ver QR de la credencial'}
      className="block w-full text-left"
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative aspect-[1.6/1] w-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-marino-soft to-marino p-4 text-white shadow-xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-sm">Ecclesiahs</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[9px]">
              <BadgeCheck className="h-3 w-3" /> Activo
            </span>
          </div>
          <div>
            <p className="font-display text-xl leading-tight">Lucas Martínez</p>
            <p className="text-[10px] text-white/60">Familia Martínez · Jóvenes</p>
          </div>
          <span className="h-1 w-12 rounded-full bg-rojo" />
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center gap-4 rounded-2xl bg-white p-4 text-marino shadow-xl ring-1 ring-marino/10"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <FakeQr className="h-24 w-24" />
          <p className="max-w-[90px] text-[10px] leading-snug text-marino/60">Mostrá este código en la entrada.</p>
        </div>
      </motion.div>
    </button>
  )
}

type SyncState = 'offline' | 'syncing' | 'done'

function OfflineSync() {
  const [state, setState] = useState<SyncState>('offline')
  const [ref, onScreen] = useOnScreen<HTMLDivElement>()
  useEffect(() => {
    if (!onScreen) return
    const next: Record<SyncState, SyncState> = { offline: 'syncing', syncing: 'done', done: 'offline' }
    const t = setTimeout(() => setState(next[state]), state === 'syncing' ? 1800 : 1600)
    return () => clearTimeout(t)
  }, [state, onScreen])

  const label = { offline: 'Sin señal · 24 en cola', syncing: 'Sincronizando…', done: 'Todo sincronizado' }[state]
  const Icon = state === 'offline' ? WifiOff : state === 'syncing' ? RefreshCw : CircleCheck

  return (
    <div ref={ref} className="rounded-2xl border border-marino/10 bg-blanco-mar p-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-500 ${
            state === 'done' ? 'bg-marino text-white' : state === 'offline' ? 'bg-rojo text-white' : 'bg-white text-marino'
          }`}
        >
          <Icon className={`h-4 w-4 ${state === 'syncing' ? 'animate-spin' : ''}`} />
        </span>
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-marino/10">
        <motion.div
          className="h-full rounded-full bg-rojo"
          animate={{ width: state === 'offline' ? '8%' : state === 'syncing' ? '70%' : '100%' }}
          transition={{ duration: state === 'syncing' ? 1.6 : 0.5, ease: EASE }}
        />
      </div>
    </div>
  )
}

const BARS = [58, 72, 64, 88, 70, 96, 82, 100]

function MetricsBars() {
  return (
    <div className="flex h-36 items-end gap-2.5">
      {BARS.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: '6%' }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1, ease: EASE, delay: i * 0.07 }}
          className={`flex-1 rounded-t-lg transition-colors duration-300 hover:bg-rojo ${i === BARS.length - 1 ? 'bg-rojo' : 'bg-marino'}`}
        />
      ))}
    </div>
  )
}

function ExportFile() {
  const [run, setRun] = useState(0)
  const [ref, onScreen] = useOnScreen<HTMLDivElement>()
  useEffect(() => {
    if (!onScreen) return
    const t = setInterval(() => setRun((r) => r + 1), 3600)
    return () => clearInterval(t)
  }, [onScreen])
  return (
    <div ref={ref} className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
      <span className="flex h-12 w-10 items-center justify-center rounded-lg bg-white text-rojo">
        <FileSpreadsheet className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-chart text-[12px]">asistencia_noviembre.csv</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/20">
          <motion.div
            key={run}
            className="h-full rounded-full bg-white"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, ease: EASE }}
          />
        </div>
      </div>
      <Download className="h-5 w-5 shrink-0" />
    </div>
  )
}

export function Bento() {
  return (
    <section id="funciones" className="relative scroll-mt-24 bg-blanco-mar text-marino">
      <div className="mx-auto max-w-6xl px-6 pb-28 pt-28">
        <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <Kicker className="text-marino/60">Funciones</Kicker>
            <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,4rem)] font-light leading-[1.02] tracking-tight">
              <MaskLines
                inView
                lines={[
                  'Todo lo que tu equipo usa.',
                  <em key="b" className="italic text-rojo">
                    Nada que sobre.
                  </em>,
                ]}
              />
            </h2>
          </div>
          <FadeUp>
            <p className="max-w-md text-marino/70 lg:justify-self-end">
              Cada función nació de una necesidad real de la iglesia: la fila en la puerta, la planilla perdida, la
              familia que dejó de venir y nadie lo notó.
            </p>
          </FadeUp>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:auto-rows-[minmax(230px,auto)] lg:grid-cols-6">
          <FadeUp className="lg:col-span-4 lg:row-span-2">
            <SpotlightCard className="h-full bg-marino p-7 text-white sm:p-10" glow="rgba(225,29,46,0.28)">
              <div className="flex h-full min-h-[420px] flex-col">
                <Kicker className="text-white/60">01 · Asistencia</Kicker>
                <h3 className="mt-5 max-w-sm font-display text-3xl font-light leading-tight sm:text-4xl">
                  Escáner QR en la entrada del templo.
                </h3>
                <p className="mt-3 max-w-sm text-white/65">
                  Registra a cada persona en segundos con cualquier celular. Sin lectores, sin filas, sin planillas.
                </p>
                <div className="mt-auto flex items-end justify-between gap-6 pt-10">
                  <div className="relative flex h-32 w-32 items-center justify-center sm:h-40 sm:w-40">
                    <FakeQr className="h-24 w-24 sm:h-28 sm:w-28" />
                    <ScanLine className="inset-x-1" />
                    <span className="absolute inset-0 rounded-2xl border border-dashed border-white/25" />
                  </div>
                  <LiveCounter />
                </div>
              </div>
            </SpotlightCard>
          </FadeUp>

          <FadeUp className="lg:col-span-2" delay={0.08}>
            <SpotlightCard className="h-full border border-marino/10 bg-white p-7">
              <Kicker className="text-marino/50">02 · Membresía</Kicker>
              <h3 className="mb-5 mt-4 font-display text-2xl font-light leading-tight">Credencial digital para cada miembro.</h3>
              <FlipCredential />
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-marino/50">
                <RotateCw className="h-3 w-3" /> Tocá la credencial para girarla
              </p>
            </SpotlightCard>
          </FadeUp>

          <FadeUp className="lg:col-span-2" delay={0.16}>
            <SpotlightCard className="h-full border border-marino/10 bg-white p-7">
              <Kicker className="text-marino/50">03 · Resiliencia</Kicker>
              <h3 className="mb-5 mt-4 font-display text-2xl font-light leading-tight">Funciona aunque se corte internet.</h3>
              <OfflineSync />
            </SpotlightCard>
          </FadeUp>

          <FadeUp className="lg:col-span-3">
            <SpotlightCard className="h-full border border-marino/10 bg-white p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Kicker className="text-marino/50">04 · Métricas</Kicker>
                  <h3 className="mt-4 max-w-xs font-display text-2xl font-light leading-tight">
                    Un panel pastoral que muestra quién falta.
                  </h3>
                </div>
                <span className="rounded-full bg-rojo/10 px-3 py-1 text-[11px] font-semibold text-rojo">3 familias ausentes</span>
              </div>
              <div className="mt-6">
                <MetricsBars />
              </div>
            </SpotlightCard>
          </FadeUp>

          <FadeUp className="lg:col-span-3" delay={0.08}>
            <SpotlightCard className="h-full bg-rojo p-7 text-white" glow="rgba(255,255,255,0.22)">
              <Kicker className="text-white/80 [&>span]:bg-white">05 · Reportes</Kicker>
              <h3 className="mb-6 mt-4 max-w-xs font-display text-2xl font-light leading-tight">
                El reporte mensual, exportado en un clic.
              </h3>
              <ExportFile />
              <p className="mt-4 text-sm text-white/80">Listo para CSV o Excel, para compartir con el consejo de la iglesia.</p>
            </SpotlightCard>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
