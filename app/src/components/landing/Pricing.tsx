import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { EASE, FadeUp, Kicker, MaskLines } from './primitives'

type Billing = 'monthly' | 'annual'

const PLANS = [
  {
    name: 'Semilla',
    audience: 'Hasta 40 miembros',
    blurb: 'Ideal para grupos pequeños y pruebas dominicales.',
    price: { monthly: 0, annual: 0 },
    features: ['Escaneo QR en vivo', 'Credencial digital', '1 usuario admin'],
    cta: 'Comenzar gratis',
  },
  {
    name: 'Comunidad',
    audience: 'Hasta 250 miembros',
    blurb: 'Para congregaciones en desarrollo que buscan orden y agilidad.',
    price: { monthly: 24, annual: 19 },
    features: ['Modo sin conexión', 'Métricas de asistencia', 'Reportes exportables', 'Soporte por WhatsApp o email'],
    cta: 'Iniciar prueba gratis',
    featured: true,
  },
  {
    name: 'Iglesia Pro',
    audience: 'Hasta 800 miembros',
    blurb: 'Auditorios medianos y múltiples ministerios bajo una misma cuenta.',
    price: { monthly: 49, annual: 39 },
    features: ['Ministerios ilimitados', 'Alertas de ausentismo avanzadas', 'Backup automático', 'Atención prioritaria'],
    cta: 'Elegir plan Pro',
  },
]

export function Pricing() {
  const [billing, setBilling] = useState<Billing>('monthly')

  return (
    <section id="planes" className="relative scroll-mt-24 bg-blanco-mar text-marino">
      <div className="mx-auto max-w-6xl px-6 py-28">
        <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Kicker className="text-marino/60">Planes</Kicker>
            <h2 className="mt-5 font-display text-[clamp(2.25rem,5vw,4rem)] font-light leading-[1.02] tracking-tight">
              <MaskLines
                inView
                lines={[
                  'Planes que crecen',
                  <>
                    con tu <em className="italic text-rojo">congregación.</em>
                  </>,
                ]}
              />
            </h2>
          </div>

          <div className="inline-flex self-start rounded-full border border-marino/15 bg-white p-1 lg:self-auto">
            {(['monthly', 'annual'] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBilling(b)}
                className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                  billing === b ? 'text-white' : 'text-marino/60 hover:text-marino'
                }`}
              >
                {billing === b && (
                  <motion.span
                    layoutId="billing-pill"
                    className="absolute inset-0 rounded-full bg-marino"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">{b === 'monthly' ? 'Mensual' : 'Anual'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
          {PLANS.map((plan, i) => (
            <FadeUp key={plan.name} delay={i * 0.1} className="h-full">
              <div
                className={`relative flex h-full flex-col overflow-hidden rounded-[28px] p-8 transition-transform duration-500 hover:-translate-y-1.5 ${
                  plan.featured
                    ? 'bg-marino text-white shadow-[0_40px_80px_-30px_rgba(11,37,69,0.7)] md:-my-4 md:py-12'
                    : 'border border-marino/10 bg-white'
                }`}
              >
                {plan.featured && <span className="absolute inset-x-0 top-0 h-1.5 bg-rojo" />}
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl">{plan.name}</h3>
                  {plan.featured && (
                    <span className="rounded-full bg-rojo px-3 py-1 font-chart text-[10px] uppercase tracking-wider">
                      Recomendado
                    </span>
                  )}
                </div>
                <p className={`mt-1 font-chart text-[11px] ${plan.featured ? 'text-white/55' : 'text-marino/50'}`}>
                  {plan.audience}
                </p>
                <p className={`mt-4 text-sm ${plan.featured ? 'text-white/70' : 'text-marino/65'}`}>{plan.blurb}</p>

                <div className="mt-8 flex items-baseline gap-2">
                  <span className="font-display text-6xl font-light leading-none">$</span>
                  <span className="relative h-[60px] overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={`${plan.name}-${billing}`}
                        initial={{ y: 60 }}
                        animate={{ y: 0 }}
                        exit={{ y: -60 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="block font-display text-6xl font-light leading-[60px]"
                      >
                        {plan.price[billing]}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span className={`text-sm ${plan.featured ? 'text-white/55' : 'text-marino/50'}`}>USD / mes</span>
                </div>
                <p className={`mt-2 h-4 font-chart text-[10px] ${plan.featured ? 'text-white/50' : 'text-marino/45'}`}>
                  {billing === 'annual' && plan.price.annual > 0 ? 'Facturado anualmente' : ''}
                </p>

                <ul className="mb-10 mt-6 space-y-3 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          plan.featured ? 'bg-rojo' : 'bg-marino'
                        }`}
                      >
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/registro"
                  className={`group mt-auto flex items-center justify-between rounded-full py-3 pl-6 pr-2 text-sm font-semibold transition-colors ${
                    plan.featured
                      ? 'bg-rojo text-white hover:bg-rojo-deep'
                      : 'border border-marino text-marino hover:bg-marino hover:text-white'
                  }`}
                >
                  {plan.cta}
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-[-45deg] ${
                      plan.featured ? 'bg-white text-rojo' : 'bg-marino text-white group-hover:bg-white group-hover:text-marino'
                    }`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}
