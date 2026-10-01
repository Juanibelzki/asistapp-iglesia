import { QRCodeSVG } from 'qrcode.react'
import { Download } from 'lucide-react'
import type { Congregado } from '../../lib/types'
import { Modal } from '../ui/modal'
import { Button } from '../ui/button'

export function QrModal({ member, onClose }: { member: Congregado | null; onClose: () => void }) {
  const download = () => {
    if (!member) return
    const svg = document.getElementById('congregado-qr-svg')
    if (!svg) return
    const source = new XMLSerializer().serializeToString(svg)
    const blob = new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qr-${member.first_name}-${member.last_name}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      open={!!member}
      onClose={onClose}
      size="sm"
      title="QR de asistencia"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={download} leftIcon={<Download className="h-4 w-4" />}>
            Descargar SVG
          </Button>
        </>
      }
    >
      {member && (
        <div className="flex flex-col items-center text-center">
          <p className="font-display text-xl font-bold text-ink">
            {member.first_name} {member.last_name}
          </p>
          {/* Fondo blanco fijo: garantiza contraste de lectura también en tema oscuro */}
          <div className="mt-5 rounded-2xl border border-line bg-white p-4 shadow-card">
            <QRCodeSVG id="congregado-qr-svg" value={member.qr_code || member.id} size={196} />
          </div>
          <p className="mt-5 text-sm text-ink-soft">
            Compartí este código con {member.is_student ? 'el alumno' : 'el miembro'} para registrar su asistencia.
          </p>
        </div>
      )}
    </Modal>
  )
}
