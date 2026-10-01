import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '../components/layout/PublicPage'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'Sobre Ecclesiahs' }] }),
  component: About,
})

function About() {
  return (
    <PublicPage
      title="Sobre Ecclesiahs"
      intro="Ecclesiahs nace para facilitar la administración y la seguridad en el registro de asistencia en actividades eclesiásticas."
    >
      <p>
        Nuestro objetivo es ofrecer herramientas digitales eficientes que permitan a los maestros y a los equipos de la iglesia enfocarse en lo más
        importante: la enseñanza y el cuidado de las personas.
      </p>
    </PublicPage>
  )
}
