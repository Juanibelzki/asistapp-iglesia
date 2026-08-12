import { createFileRoute, redirect, Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { getChildren, getProfile, deleteChild } from '../lib/data'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/ninos')({
  component: Ninos,
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
    return { session }
  },
})

function Ninos() {
  const { session } = Route.useLoaderData()
  const [children, setChildren] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [consent, setConsent] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (!session) return
      const profile = await getProfile(session.user.id)
      const data = await getChildren(profile.organization_id)
      setChildren(data)
      setLoading(false)
    }
    fetchData()
  }, [session])

  if (loading) return <div className="page-wrap py-8">Cargando...</div>

  return (
    <div className="page-wrap py-8">
      <h1 className="text-3xl font-bold mb-6">Niños</h1>
      <button onClick={() => setShowForm(!showForm)} className="demo-button mb-6">Añadir niño</button>
      
      {showForm && (
        <div className="demo-panel p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Nuevo niño</h2>
          {/* Form fields here */}
          <label className="flex items-center gap-2 mt-4">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
            Confirmo que cuento con la autorización previa del tutor para registrar los datos del menor.
          </label>
          <Link to="/privacidad" className="text-sm underline block mt-2">Leer política de privacidad</Link>
          <button className="demo-button mt-4">Guardar</button>
        </div>
      )}

      <div className="demo-table-shell">
        <table className="demo-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Grupo</th>
              <th>Tutor</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {children.map(child => (
              <tr key={child.id}>
                <td>{child.first_name} {child.last_name}</td>
                <td>{child.group_name}</td>
                <td>{child.guardian_name}</td>
                <td>{child.guardian_phone}</td>
                <td>
                  <button onClick={() => deleteChild(child.id).then(() => window.location.reload())} className="demo-button demo-button-danger text-xs">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
