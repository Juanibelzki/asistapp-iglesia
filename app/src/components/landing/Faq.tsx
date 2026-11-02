import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { EASE, FadeUp, Kicker } from './primitives'

const FAQS = [
  {
    q: '¿Necesito comprar hardware o lectores especiales?',
    a: 'No. La asistencia se toma con el celular de quien escanea: cualquier teléfono con cámara sirve.',
  },
  {
    q: '¿Qué pasa si se corta internet en el templo?',
    a: 'La app sigue tomando asistencia sin conexión y sincroniza automáticamente cuando vuelve la señal.',
  },
  {
    q: '¿Los miembros tienen que instalar algo?',
    a: 'No. Cada miembro abre su credencial desde el navegador del celular y la muestra en la entrada.',
  },
  {
    q: '¿Puedo exportar los datos de asistencia?',
    a: 'Sí. Desde el panel podés exportar el reporte mensual de asistencia en formato CSV, compatible con Excel.',
  },
  {
    q: '¿Puedo empezar gratis?',
    a: 'Sí. El plan Semilla es gratuito y podés usarlo antes de elegir un plan pago.',
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="bg-white text-marino">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-28 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <Kicker className="text-marino/60">Preguntas frecuentes</Kicker>
          <h2 className="mt-5 font-display text-[clamp(2.25rem,4.5vw,3.5rem)] font-light leading-[1.05] tracking-tight">
            Lo que suelen preguntar los pastores.
          </h2>
        </div>

        <FadeUp>
          <div className="divide-y divide-marino/10 border-y border-marino/10">
            {FAQS.map((f, i) => {
              const isOpen = open === i
              return (
                <div key={f.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="text-lg font-semibold">{f.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isOpen ? 'bg-rojo text-white' : 'bg-blanco-mar text-marino'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-xl pb-6 leading-relaxed text-marino/70">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
