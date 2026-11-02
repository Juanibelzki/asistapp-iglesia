import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { ContourField } from './ContourField'
import { FadeUp, Magnetic, MaskLines } from './primitives'

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-marino-deep text-white">
      <ContourField className="absolute inset-0 h-full w-full" levels={12} speed={0.035} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(7,26,51,0.35)_0%,rgba(7,26,51,0.85)_80%)]" />

      <div className="relative mx-auto max-w-5xl px-6 py-36 text-center">
        <h2 className="font-display text-[clamp(2.75rem,8vw,6.5rem)] font-light leading-[0.98] tracking-[-0.02em]">
          <MaskLines
            inView
            lines={[
              'Empezá este',
              <em key="d" className="italic text-rojo">
                domingo.
              </em>,
            ]}
          />
        </h2>
        <FadeUp delay={0.3}>
          <p className="mx-auto mt-8 max-w-lg text-lg text-white/70">
            Registrá tu iglesia gratis y tomá tu primera asistencia con QR en el próximo culto.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Magnetic>
              <Link
                to="/registerCongregacion"
                className="group inline-flex items-center gap-3 rounded-full bg-white py-3 pl-7 pr-3 text-sm font-semibold text-marino transition-colors hover:bg-rojo hover:text-white"
              >
                Registrar mi iglesia
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rojo text-white transition-transform duration-300 group-hover:rotate-[-45deg] group-hover:bg-white group-hover:text-rojo">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Magnetic>
            <Link to="/login" className="text-sm font-medium text-white/75 underline decoration-white/30 underline-offset-8 hover:text-white">
              Ya tengo cuenta · ingresar
            </Link>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
