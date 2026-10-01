import { useState, type ReactNode } from 'react'
import { BarChart3, Check, CloudOff, Download, GraduationCap, IdCard, Link2, Plus, QrCode, ScanLine, UsersRound } from 'lucide-react'
import { cn } from '../../lib/cn'
import { LinkButton } from '../ui/button'

function SectionHead({ id, kicker, title, children }: { id?: string; kicker: string; title: string; children?: ReactNode }) {
  return (
    <div id={id} className="mx-auto mb-12 max-w-2xl scroll-mt-24 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">{kicker}</p>
      <h2 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-5xl">{title}</h2>
      {children && <p className="mt-4 text-lg text-ink-soft">{children}</p>}
    </div>
  )
}

/* -------------------------------- Funciones -------------------------------- */

const FEATURES = [
  {
    icon: QrCode,
    title: 'Escáner QR ultra rápido',
    text: 'Registrá la entrada al culto o a un evento en menos de 2 segundos desde cualquier teléfono. Sin lectores ni hardware costoso.',
    className: 'md:col-span-2',
    tone: 'bg-primary text-primary-ink',
    iconTone: 'bg-primary-ink/15 text-primary-ink',
    textTone: 'text-primary-ink/80',
  },
  {
    icon: CloudOff,
    title: 'Modo offline',
    text: 'Seguí tomando asistencia aunque se caiga el Wi-Fi. Se sincroniza al volver la conexión.',
    className: '',
  },
  {
    icon: UsersRound,
    title: 'Familias y membresía',
    text: 'Credenciales digitales para cada miembro y un directorio único, sin planillas duplicadas.',
    className: '',
  },
  {
    icon: GraduationCap,
    title: 'Alumnos por etapa',
    text: 'Niños, adolescentes y adultos con su tutor de contacto y seguimiento de clases.',
    className: '',
  },
  {
    icon: Download,
    title: 'Reportes exportables',
    text: 'Descargá la asistencia del mes en CSV listo para Excel o Google Sheets.',
    className: '',
  },
  {
    icon: BarChart3,
    title: 'Panel pastoral en tiempo real',
    text: 'Métricas de crecimiento, nuevos miembros y asistencia del último evento, de un vistazo.',
    className: 'md:col-span-3',
  },
]

export function Features() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
      <SectionHead id="funciones" kicker="Funciones" title="Todo lo que tu equipo necesita, nada que sobre">
        Pensado para voluntarios: se aprende en minutos y funciona en el celular que ya tienen.
      </SectionHead>

      <div className="grid gap-4 md:grid-cols-3">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className={cn(
              'rounded-3xl border p-7 transition-shadow hover:shadow-card',
              f.tone ?? 'border-line bg-surface',
              f.tone && 'border-transparent',
              f.className,
            )}
          >
            <span className={cn('mb-5 flex h-11 w-11 items-center justify-center rounded-xl', f.iconTone ?? 'bg-primary-soft text-primary')}>
              <f.icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="font-display text-xl font-bold">{f.title}</h3>
            <p className={cn('mt-2 leading-relaxed', f.textTone ?? 'text-ink-soft')}>{f.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------ Cómo funciona ------------------------------ */

const STEPS = [
  { icon: Plus, title: 'Registrá tu iglesia', text: 'Creá tu congregación en un minuto y obtené un enlace único de auto-inscripción.' },
  { icon: Link2, title: 'Invitá a tus miembros', text: 'Compartí el enlace por WhatsApp. Cada persona genera su credencial con código QR.' },
  { icon: ScanLine, title: 'Escaneá y listo', text: 'Tu equipo escanea los QR en la entrada y ves la asistencia al instante en el panel.' },
]

export function HowItWorks() {
  return (
    <section className="bg-sunken/70 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHead id="como-funciona" kicker="Cómo funciona" title="Funcionando antes del próximo domingo" />
        <ol className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="relative rounded-3xl border border-line bg-surface p-7 shadow-card">
              <span className="absolute right-6 top-5 font-display text-6xl font-extrabold text-line-strong/60" aria-hidden>
                {i + 1}
              </span>
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-warning">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="font-display text-xl font-bold text-ink">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink-soft">{s.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 flex items-center justify-center gap-2 text-sm text-ink-soft">
          <IdCard className="h-4 w-4 text-primary" aria-hidden /> Los miembros acceden a su credencial desde{' '}
          <a href="/portal" className="font-semibold text-primary underline-offset-4 hover:underline">Mi credencial</a>.
        </p>
      </div>
    </section>
  )
}

/* --------------------------------- Precios --------------------------------- */

interface Plan {
  name: string
  limit: string
  monthly: number
  annual: number
  features: string[]
  featured?: boolean
  cta: string
}

const PLANS: Plan[] = [
  { name: 'Semilla', limit: 'Hasta 40 miembros', monthly: 0, annual: 0, features: ['Escaneo QR en vivo', 'Credencial digital', '1 usuario admin'], cta: 'Empezar gratis' },
  {
    name: 'Comunidad',
    limit: 'Hasta 250 miembros',
    monthly: 24,
    annual: 19,
    featured: true,
    features: ['Modo offline PWA', 'Métricas de asistencia', 'Reportes exportables', 'Soporte por WhatsApp / Email'],
    cta: 'Elegir Comunidad',
  },
  {
    name: 'Iglesia Pro',
    limit: 'Hasta 800 miembros',
    monthly: 49,
    annual: 39,
    features: ['Ministerios / áreas ilimitadas', 'Alertas de ausentismo avanzadas', 'Backup automático', 'Atención prioritaria'],
    cta: 'Elegir Pro',
  },
]

export function Pricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
      <SectionHead id="precios" kicker="Planes simples" title="Precios que crecen con tu congregación">
        Empezá gratis y pasá a un plan mayor cuando tu comunidad lo necesite.
      </SectionHead>

      <div className="mb-12 flex justify-center">
        <div role="radiogroup" aria-label="Facturación" className="inline-flex rounded-full bg-sunken p-1">
          {[
            { v: false, label: 'Mensual' },
            { v: true, label: 'Anual', badge: '-20%' },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={annual === o.v}
              onClick={() => setAnnual(o.v)}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all',
                annual === o.v ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft hover:text-ink',
              )}
            >
              {o.label}
              {o.badge && <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] text-success">{o.badge}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-3">
        {PLANS.map((p) => {
          const price = annual ? p.annual : p.monthly
          return (
            <article
              key={p.name}
              className={cn(
                'relative flex flex-col rounded-3xl border p-8',
                p.featured ? 'border-primary bg-surface shadow-pop ring-4 ring-primary/10 lg:-my-3 lg:py-11' : 'border-line bg-surface shadow-card',
              )}
            >
              {p.featured && (
                <span className="absolute -top-3 left-8 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-ink">Recomendado</span>
              )}
              <h3 className="font-display text-2xl font-bold text-ink">{p.name}</h3>
              <p className="mt-1 text-sm text-ink-soft">{p.limit}</p>

              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-extrabold tabular-nums text-ink">${price}</span>
                <span className="text-sm text-ink-soft">USD / mes</span>
              </p>
              <p className="mt-1 h-4 text-xs text-ink-faint">{annual && p.annual > 0 ? 'Facturado anualmente' : ''}</p>

              <ul className="my-7 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px] text-ink">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <LinkButton to="/registerCongregacion" variant={p.featured ? 'primary' : 'secondary'} size="lg" className="w-full">
                {p.cta}
              </LinkButton>
            </article>
          )
        })}
      </div>
    </section>
  )
}

/* ----------------------------------- FAQ ----------------------------------- */

const FAQ = [
  {
    q: '¿Mis miembros necesitan instalar una aplicación?',
    a: 'No. Ecclesiahs funciona desde el navegador del celular y se puede agregar a la pantalla de inicio como una app (PWA). Cada miembro recibe su credencial con código QR.',
  },
  {
    q: '¿Qué pasa si no hay internet en el templo?',
    a: 'El escaneo sigue funcionando sin conexión y los registros se sincronizan automáticamente cuando vuelve la señal.',
  },
  {
    q: '¿Cómo se registran los miembros?',
    a: 'Al crear tu congregación obtenés un enlace único de auto-inscripción para compartir por WhatsApp o email. También podés cargarlos manualmente desde el panel.',
  },
  {
    q: '¿Puedo llevar el control de niños y adolescentes?',
    a: 'Sí. Los alumnos se organizan por etapa (niños, adolescentes y adultos) y, en menores, se guarda el nombre y teléfono del tutor.',
  },
  {
    q: '¿Puedo cambiar de plan más adelante?',
    a: 'Cuando quieras. Si llegás al límite de miembros de tu plan te avisamos para que puedas ampliarlo sin perder ningún dato.',
  },
]

export function Faq() {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-20 sm:pb-28">
      <SectionHead id="preguntas" kicker="Preguntas frecuentes" title="Antes de empezar" />
      <div className="divide-y divide-line rounded-3xl border border-line bg-surface shadow-card">
        {FAQ.map((f) => (
          <details key={f.q} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left font-semibold text-ink">
              {f.q}
              <Plus className="h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-45" aria-hidden />
            </summary>
            <p className="mt-3 leading-relaxed text-ink-soft">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------- CTA final -------------------------------- */

export function FinalCta() {
  return (
    <section className="px-5 pb-20 sm:pb-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary px-6 py-16 text-center text-primary-ink sm:px-12 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-72 w-48 rounded-t-full border-[3px] border-primary-ink/15" />
        <div aria-hidden className="pointer-events-none absolute -left-10 bottom-0 h-56 w-40 rounded-t-full bg-primary-ink/10" />
        <div aria-hidden className="pointer-events-none absolute right-1/4 -bottom-20 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
        <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight sm:text-5xl">
          Que el próximo domingo se trate de las personas.
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-lg text-primary-ink/80">Creá tu congregación gratis y empezá a tomar asistencia hoy.</p>
        <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton to="/registerCongregacion" variant="accent" size="lg">
            Registrar mi iglesia
          </LinkButton>
          <LinkButton to="/login" size="lg" className="!bg-primary-ink/10 !text-primary-ink hover:!bg-primary-ink/20 !shadow-none">
            Ya tengo cuenta
          </LinkButton>
        </div>
      </div>
    </section>
  )
}
