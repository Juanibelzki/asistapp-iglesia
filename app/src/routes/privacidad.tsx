import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacidad')({
  component: Privacidad,
})

function Privacidad() {
  return (
    <div className="page-wrap py-8">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidad y Protección de Menores</h1>
      <p>En nuestra aplicación, tratamos los datos de los niños con la máxima responsabilidad y conforme al RGPD...</p>
      {/* ... text ... */}
    </div>
  )
}
