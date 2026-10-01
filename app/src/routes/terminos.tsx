import { createFileRoute } from '@tanstack/react-router'
import { PublicPage } from '../components/layout/PublicPage'

export const Route = createFileRoute('/terminos')({
  head: () => ({ meta: [{ title: 'Términos y condiciones · Ecclesiahs' }] }),
  component: Terminos,
})

function Terminos() {
  return (
    <PublicPage title="Términos y condiciones">
      <p>Al utilizar Ecclesiahs aceptás los siguientes términos y condiciones...</p>
      {/* TODO: completar con el texto legal definitivo */}
    </PublicPage>
  )
}
