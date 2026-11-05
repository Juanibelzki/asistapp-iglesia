import { useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { Check, Phone, Search, UserPlus } from 'lucide-react'
import { EASE, FakeQr, Kicker, PhoneFrame, ScanLine } from './primitives'

// Recorrido "de cero a tu primer culto": la sección queda fija mientras se
// hace scroll y cada paso reemplaza la pantalla del teléfono con un barrido.

const STEPS = [
  {
    title: 'Registrá tu iglesia',
    body: 'Creás la cuenta de tu congregación en pocos minutos, con el nombre, la ciudad y el pastor responsable.',
  },
  {
    title: 'Cargá a tu gente',
    body: 'Sumás a cada miembro y lo agrupás por familia y ministerio. Cada persona recibe su credencial con QR.',
  },
  {
    title: 'Escaneá en la entrada',
    body: 'Un ujier o líder escanea la credencial con su celular. La asistencia queda registrada al instante, aunque no haya señal.',
  },
  {
    title: 'Mirá a quién visitar',
    body: 'El panel te muestra quién lleva semanas sin venir, para que tu equipo pastoral lo contacte a tiempo.',
  },
]

function ScreenRegister() {
  return (
    <div className="flex h-full flex-col bg-white px-4 pb-5 pt-12 text-marino">
      <p className="font-chart text-[8px] uppercase tracking-[0.25em] text-marino/45">Paso 1 de 3</p>
      <p className="mt-1 font-display text-[19px] leading-tight">Registrá tu iglesia</p>
      <div className="mt-4 space-y-2">
        {[
          ['Nombre', 'Iglesia Camino de Vida'],
          ['Ciudad', 'Rosario, Santa Fe'],
          ['Pastor', 'Andrés Molina'],
          ['WhatsApp', '+54 341 555 0192'],
        ].map(([label, value], i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.12, ease: EASE }}
            className="rounded-xl border border-marino/10 bg-blanco-mar px-3 py-2"
          >
            <p className="text-[7.5px] uppercase tracking-wider text-marino/45">{label}</p>
            <p className="text-[10.5px] font-semibold">{value}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-auto rounded-full bg-rojo py-2.5 text-center text-[10px] font-semibold text-white">
        Crear cuenta
      </div>
    </div>
  )
}

function ScreenMembers() {
  const families: [string, number, string][] = [
    ['Martínez', 4, 'Jóvenes'],
    ['Díaz', 3, 'Alabanza'],
    ['Sánchez', 5, 'Niños'],
    ['Torres', 2, 'Ujieres'],
    ['Romero', 4, 'Matrimonios'],
  ]
  return (
    <div className="flex h-full flex-col bg-white px-4 pb-5 pt-12 text-marino">
      <div className="flex items-baseline justify-between">
        <p className="font-display text-[19px]">Congregados</p>
        <p className="font-chart text-[9px] text-marino/50">248</p>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-full bg-blanco-mar px-3 py-1.5 text-[9px] text-marino/40">
        <Search className="h-3 w-3" /> Buscar persona o familia
      </div>
      <div className="mt-3 space-y-1.5">
        {families.map(([name, count, ministry], i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + i * 0.08, ease: EASE }}
            className="flex items-center gap-2.5 rounded-xl border border-marino/8 px-2.5 py-2"
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                i % 2 ? 'bg-rojo' : 'bg-marino'
              }`}
            >
              {name[0]}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10.5px] font-semibold">Familia {name}</span>
              <span className="block text-[8.5px] text-marino/50">
                {count} miembros · {ministry}
              </span>
            </span>
          </motion.div>
        ))}
      </div>
      <div className="mt-auto flex items-center justify-center gap-1.5 rounded-full bg-marino py-2.5 text-[10px] font-semibold text-white">
        <UserPlus className="h-3 w-3" /> Agregar miembro
      </div>
    </div>
  )
}

function ScreenScan() {
  return (
    <div className="relative flex h-full flex-col items-center bg-marino-deep px-4 pb-5 pt-12 text-white">
      <p className="font-chart text-[8px] uppercase tracking-[0.25em] text-white/50">Escáner · Culto general</p>
      <div className="relative mt-8 flex h-40 w-40 items-center justify-center">
        <FakeQr className="h-28 w-28" />
        <ScanLine className="inset-x-2" />
        {['left-0 top-0 border-l-2 border-t-2 rounded-tl-xl', 'right-0 top-0 border-r-2 border-t-2 rounded-tr-xl', 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl', 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl'].map((c) => (
          <span key={c} className={`absolute h-6 w-6 border-white ${c}`} />
        ))}
      </div>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, type: 'spring', stiffness: 260, damping: 22 }}
        className="mt-auto flex w-full items-center gap-2.5 rounded-2xl bg-white px-3 py-2.5 text-marino"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rojo">
          <Check className="h-4 w-4 text-white" strokeWidth={3} />
        </span>
        <span>
          <span className="block text-[10.5px] font-semibold">Lucas Martínez</span>
          <span className="block text-[8.5px] text-marino/50">Registrado · 10:02</span>
        </span>
      </motion.div>
    </div>
  )
}

function ScreenVisits() {
  const people: [string, string][] = [
    ['Familia Torres', '3 semanas'],
    ['Hugo Romero', '2 semanas'],
    ['Martina Ruiz', '2 semanas'],
    ['Daniel Jiménez', '4 semanas'],
  ]
  return (
    <div className="flex h-full flex-col bg-white px-4 pb-5 pt-12 text-marino">
      <p className="font-display text-[19px]">Para visitar</p>
      <div className="mt-3 rounded-2xl bg-rojo p-3 text-white">
        <p className="font-display text-[28px] leading-none">9</p>
        <p className="mt-1 text-[9px] text-white/80">personas llevan +2 semanas sin venir</p>
      </div>
      <div className="mt-3 space-y-1.5">
        {people.map(([name, time], i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1, ease: EASE }}
            className="flex items-center gap-2 rounded-xl border border-marino/8 px-2.5 py-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rojo" />
            <span className="min-w-0 flex-1">
              <span className="block text-[10.5px] font-semibold">{name}</span>
              <span className="block text-[8.5px] text-marino/50">{time} sin venir</span>
            </span>
            <span className="flex items-center gap-1 rounded-full bg-marino px-2 py-1 text-[8px] font-semibold text-white">
              <Phone className="h-2.5 w-2.5" /> Llamar
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const SCREENS = [ScreenRegister, ScreenMembers, ScreenScan, ScreenVisits]

export function StoryScroll() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const [step, setStep] = useState(0)
  const stepRef = useRef(0)
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const next = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length)))
    if (next === stepRef.current) return
    stepRef.current = next
    setStep(next)
  })
  const railHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])
  const phoneY = useTransform(scrollYProgress, [0, 1], [30, -30])
  const Screen = SCREENS[step]

  return (
    <section
      id="como-funciona"
      ref={ref}
      className="relative bg-blanco-mar text-marino"
      style={{ height: `${STEPS.length * 90 + 10}vh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-1 content-center gap-6 px-6 pt-16 lg:grid-cols-2 lg:items-center lg:gap-12 lg:pt-0">
          {/* Texto */}
          <div className="order-2 lg:order-1">
            <Kicker className="text-marino/60">Cómo funciona</Kicker>

            <div className="mt-4 flex items-start gap-5 lg:mt-8">
              <div className="relative hidden h-56 w-px shrink-0 bg-marino/10 lg:block">
                <motion.div style={{ height: railHeight }} className="absolute inset-x-0 top-0 bg-rojo" />
              </div>
              <div className="min-h-[200px] flex-1 sm:min-h-[230px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    <p className="font-chart text-sm text-rojo">
                      0{step + 1} <span className="text-marino/30">/ 0{STEPS.length}</span>
                    </p>
                    <h2 className="mt-2 font-display text-[clamp(2rem,4.6vw,3.75rem)] font-light leading-[1.02] tracking-tight">
                      {STEPS[step].title}
                    </h2>
                    <p className="mt-4 max-w-md text-[15px] leading-relaxed text-marino/70 sm:text-base">
                      {STEPS[step].body}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-6 hidden gap-2 lg:flex">
              {STEPS.map((s, i) => (
                <span
                  key={s.title}
                  className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-10 bg-rojo' : 'w-4 bg-marino/15'}`}
                />
              ))}
            </div>
          </div>

          {/* Teléfono */}
          <div className="relative order-1 flex items-center justify-center lg:order-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={step}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.6, ease: EASE }}
                aria-hidden="true"
                className="pointer-events-none absolute hidden select-none font-display text-[26rem] font-light leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(11,37,69,0.16)] lg:block"
              >
                {step + 1}
              </motion.span>
            </AnimatePresence>

            {/* El teléfono se diseña a 260px y se escala con zoom para no romper la UI interna */}
            <motion.div style={{ y: phoneY }} className="relative w-[260px] will-change-transform [zoom:0.6] sm:[zoom:0.8] lg:[zoom:1]">
              <PhoneFrame>
                <AnimatePresence initial={false}>
                  <motion.div
                    key={step}
                    className="absolute inset-0"
                    initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
                    animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                    exit={{ opacity: 0, transition: { delay: 0.5, duration: 0.2 } }}
                    transition={{ duration: 0.7, ease: EASE }}
                  >
                    <Screen />
                  </motion.div>
                </AnimatePresence>
              </PhoneFrame>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
