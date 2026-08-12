import { createFileRoute } from '@tanstack/react-router'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getChildren, getProfile, upsertAttendance } from '../lib/data'

export const Route = createFileRoute('/escanear')({
  component: Escanear,
})

function Escanear() {
  const [eventId, setEventId] = useState<string | null>(null)
  const [children, setChildren] = useState<any[]>([])
  const [presentChildren, setPresentChildren] = useState<Set<string>>(new Set())

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false)
    scanner.render((decodedText) => {
        const url = new URL(decodedText)
        setEventId(url.searchParams.get('event'))
        scanner.clear()
    }, (err) => console.log(err))
    return () => scanner.clear()
  }, [])

  useEffect(() => {
    if (eventId) {
      async function fetchData() {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const profile = await getProfile(session.user.id)
        const data = await getChildren(profile.organization_id)
        setChildren(data)
      }
      fetchData()
    }
  }, [eventId])

  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    window.addEventListener('online', () => setIsOnline(true))
    window.addEventListener('offline', () => setIsOnline(false))
    // Sync on reconnect
    const sync = async () => {
        const queue = JSON.parse(localStorage.getItem('attendance_queue') || '[]')
        for (const item of queue) {
            await upsertAttendance(item)
        }
        localStorage.removeItem('attendance_queue')
    }
    window.addEventListener('online', sync)
    return () => {
        window.removeEventListener('online', () => setIsOnline(true))
        window.removeEventListener('offline', () => setIsOnline(false))
        window.removeEventListener('online', sync)
    }
  }, [])

  const markPresent = async (childId: string) => {
    setPresentChildren(prev => new Set(prev).add(childId))
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const profile = await getProfile(session.user.id)
    const attendance = { event_id: eventId, child_id: childId, checked_in_by: profile.id, status: 'presente' }
    
    if (isOnline) {
        try {
            await upsertAttendance(attendance)
        } catch (e) {
            alert("Error al registrar")
        }
    } else {
        const queue = JSON.parse(localStorage.getItem('attendance_queue') || '[]')
        localStorage.setItem('attendance_queue', JSON.stringify([...queue, attendance]))
        alert("Sin conexión - Asistencia guardada localmente")
    }
  }

  if (!eventId) return <div id="reader" className="page-wrap py-8" />

  return (
    <div className="page-wrap py-8">
      <h1 className="text-3xl font-bold mb-6">Asistencia</h1>
      <div className="grid gap-4">
        {children.map(child => (
          <div key={child.id} className="demo-list-item flex justify-between items-center">
            {child.first_name} {child.last_name}
            <button 
                onClick={() => markPresent(child.id)} 
                disabled={presentChildren.has(child.id)}
                className={`demo-button ${presentChildren.has(child.id) ? 'bg-green-500' : ''}`}
            >
                {presentChildren.has(child.id) ? 'Presente' : 'Marcar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
