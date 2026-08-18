import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/terminos')({
  component: Terminos,
})

function Terminos() {
  return (
    <div className="page-wrap py-8">
      <h1 className="text-3xl font-bold mb-6">Términos y Condiciones</h1>
      <p>Al utilizar Ecclesiahs aceptás los siguientes términos y condiciones...</p>
      {/* ... text ... */}
    </div>
  )
}