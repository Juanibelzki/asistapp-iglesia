import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { getChildren, getAttendance, upsertAttendance, deleteAttendance, getProfile } from '../lib/data'

export const Route = createFileRoute('/_protected/eventos/$eventId/asistencia')({

  component: AsistenciaPage,
})

function AsistenciaPage() {
  const { eventId } = Route.useParams()
  const [children, setChildren] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'todos' | 'presente' | 'ausente' | 'justificado'>('todos')

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const profile = await getProfile(session.user.id)
      
      const [childrenData, attendanceData] = await Promise.all([
        getChildren(profile.organization_id),
        getAttendance(eventId)
      ])
      
      setChildren(childrenData)
      setAttendance(attendanceData)
      setLoading(false)
    }
    fetchData()

    const channel = supabase
      .channel('attendance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `event_id=eq.${eventId}` }, () => {
        getAttendance(eventId).then(setAttendance)
      })
      .subscribe()
    return () => { channel.unsubscribe() }
  }, [eventId])

  const childStatuses = useMemo(() => {
    return children.map(child => {
      const record = attendance.find(a => a.child_id === child.id)
      return { ...child, status: record?.status || 'ausente', attendanceId: record?.id }
    })
  }, [children, attendance])

  const filteredChildren = useMemo(() => {
    return childStatuses.filter(c => filterStatus === 'todos' || c.status === filterStatus)
  }, [childStatuses, filterStatus])

  const toggleStatus = async (childId: string, currentStatus: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const profile = await getProfile(session.user.id)

    if (currentStatus === 'ausente') {
      await upsertAttendance({ event_id: eventId, child_id: childId, status: 'presente', checked_in_by: profile.id })
    } else if (currentStatus === 'presente') {
      await upsertAttendance({ event_id: eventId, child_id: childId, status: 'justificado', checked_in_by: profile.id })
    } else {
      await deleteAttendance(eventId, childId)
    }
  }

  const exportCsv = () => {
    const csv = "Nombre,Estado\n" + childStatuses.map(c => `${c.first_name} ${c.last_name},${c.status}`).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asistencia_${eventId}.csv`
    a.click()
  }

  if (loading) return <div className="page-wrap py-8">Cargando...</div>

  return (
    <div className="page-wrap py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Asistencia</h1>
        <span className="text-green-600 font-bold">● En vivo</span>
      </div>
      <div className="flex gap-2 mb-6">
        {['todos', 'presente', 'ausente', 'justificado'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s as any)} className={`demo-button ${filterStatus === s ? 'bg-gray-200' : ''}`}>{s}</button>
        ))}
        <button onClick={exportCsv} className="demo-button ml-auto">Exportar CSV</button>
      </div>
      <div className="demo-table-shell">
        <table className="demo-table">
          <thead>
            <tr><th>Nombre</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {filteredChildren.map(c => (
              <tr key={c.id}>
                <td>{c.first_name} {c.last_name}</td>
                <td>{c.status}</td>
                <td><button onClick={() => toggleStatus(c.id, c.status)} className="demo-button text-xs">Cambiar estado</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
