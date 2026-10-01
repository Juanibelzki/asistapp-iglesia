import { ArrowRight, BadgeCheck } from 'lucide-react'
import { LinkButton } from '../ui/button'
import { PhoneDemo } from './PhoneDemo'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-grid opacity-60" />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:pb-28">
        <div className="animate-rise text-center lg:text-left">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-semibold text-ink-soft shadow-sm lg:mx-0">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Asistencia y membresía para iglesias
          </p>

          <h1 className="mt-6 font-display text-[2.6rem] font-extrabold leading-[1.04] text-ink sm:text-6xl xl:text-7xl">
            Tu iglesia, <span className="text-primary">presente</span> y al día.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink-soft lg:mx-0">
            Tomá asistencia en segundos con código QR, organizá tus ministerios y grupos, y mantené informada a tu congregación en
            tiempo real. Sin planillas, sin hardware, sin complicaciones.
          </p>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <LinkButton to="/registerCongregacion" size="lg">
              Registrar mi iglesia <ArrowRight className="h-4 w-4" />
            </LinkButton>
            <LinkButton to="/portal" variant="secondary" size="lg">
              <BadgeCheck className="h-4 w-4 text-primary" /> Soy miembro · Mi credencial
            </LinkButton>
          </div>

          <p className="mt-5 text-sm text-ink-faint">Plan Semilla gratuito · Sin tarjeta de crédito</p>
        </div>

        <div className="animate-rise [animation-delay:150ms]">
          <PhoneDemo />
        </div>
      </div>
    </section>
  )
}
