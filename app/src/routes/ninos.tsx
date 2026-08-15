import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { Plus, User, Trash2 } from 'lucide-react'

export const Route = createFileRoute('/ninos')({
  component: Ninos,
})

interface Child {
  id: string
  first_name: string
  last_name: string
  group_name: string
  guardian_name: string
  guardian_phone: string
}

function Ninos() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [children, setChildren] = useState<Child[]>([])
  const [orgId, setOrgId] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          navigate({ to: '/login' })
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('auth_user_id', session.user.id)
          .single()

        if (!profile?.organization_id) throw new Error('No org found')
        
        setOrgId(profile.organization_id)

        const { data } = await supabase
          .from('children')
          .select('*')
          .eq('organization_id', profile.organization_id)
        
        setChildren(data || [])
      } catch (err) {
        console.error('Error loading children:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [navigate])

  const deleteChild = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este alumno?')) return
    await supabase.from('children').delete().eq('id', id)
    setChildren(prev => prev.filter(c => c.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Cargando alumnos...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Alumnos</h1>
          <p className="text-zinc-400 text-sm mt-1">Gestión del registro escolar dominical</p>
        </div>
        <Link to="/dashboard" className="text-sm text-zinc-400 hover:text-white">Volver al Dashboard</Link>
      </header>

      {children.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No hay alumnos registrados</h3>
          <p className="text-zinc-400 text-sm mb-6">Comienza a registrar a los niños de tu congregación.</p>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" /> Registrar Nuevo Alumno
          </button>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-zinc-900/80 text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-4">Nombre</th>
                <th className="p-4">Grupo</th>
                <th className="p-4">Tutor</th>
                <th className="p-4">Teléfono</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {children.map(child => (
                <tr key={child.id} className="hover:bg-zinc-800/30 transition">
                  <td className="p-4 font-medium text-white">{child.first_name} {child.last_name}</td>
                  <td className="p-4 text-zinc-300">{child.group_name}</td>
                  <td className="p-4 text-zinc-300">{child.guardian_name}</td>
                  <td className="p-4 text-zinc-300">{child.guardian_phone}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => deleteChild(child.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
