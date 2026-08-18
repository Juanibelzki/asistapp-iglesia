import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { getEvents, getProfile, deleteEvent } from '../lib/data'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_protected/eventos')({
  component: Eventos,
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
    return { session }
  },
})

function Eventos() {
  const { session } = Route.useLoaderData()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!session) return
      const profile = await getProfile(session.user.id)
      const data = await getEvents(profile.organization_id)
      setEvents(data)
      setLoading(false)
    }
    fetchData()
  }, [session])

  if (loading) return <div className="page-wrap py-8">Cargando...</div>

  return (
    <div className="page-wrap py-8">
      <h1 className="text-3xl font-bold mb-6">Eventos</h1>
      <button className="demo-button mb-6">Añadir evento</button>
      <div className="demo-table-shell">
        <table className="demo-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Tipo</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.event_type}</td>
                <td>{event.event_date}</td>
                <td>{event.start_time}</td>
                <td>
                  <button onClick={() => deleteEvent(event.id).then(() => window.location.reload())} className="demo-button demo-button-danger text-xs">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
