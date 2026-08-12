import { createFileRoute } from '@tanstack/react-router'
import { QRCodeSVG } from 'qrcode.react'

export const Route = createFileRoute('/eventos/$eventId/qr')({
  component: QrPage,
})

function QrPage() {
  const { eventId } = Route.useParams()
  const qrUrl = `${window.location.origin}/escanear?event=${eventId}`

  return (
    <div className="page-wrap py-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Código QR del Evento</h1>
      <div className="demo-panel p-6">
        <QRCodeSVG value={qrUrl} size={256} />
      </div>
      <button onClick={() => window.print()} className="demo-button mt-6">Imprimir QR</button>
    </div>
  )
}
