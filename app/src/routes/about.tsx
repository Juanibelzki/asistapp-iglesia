import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="demo-page">
      <h1 className="text-3xl font-bold mb-6">Sobre Ecclesiahs</h1>
      <p className="text-lg text-[var(--sea-ink-soft)] mb-6">
        Ecclesiahs nace para facilitar la administración y seguridad en el registro de asistencia infantil en actividades eclesiásticas.
      </p>
      <p className="text-lg text-[var(--sea-ink-soft)]">
        Nuestro objetivo es ofrecer herramientas digitales eficientes que permitan a los maestros enfocarse en lo más importante: la enseñanza y el cuidado de los niños.
      </p>
    </div>
  )
}
