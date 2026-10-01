import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '../components/layout/PublicPage'

export const Route = createFileRoute('/privacidad')({
  head: () => ({ meta: [{ title: 'Política de privacidad · Ecclesiahs' }] }),
  component: Privacidad,
})

function Privacidad() {
  return (
    <PublicPage title="Política de privacidad y protección de menores">
      <p>En nuestra aplicación, tratamos los datos de los niños con la máxima responsabilidad y conforme al RGPD...</p>
      {/* TODO: completar con el texto legal definitivo */}
    </PublicPage>
  )
}
