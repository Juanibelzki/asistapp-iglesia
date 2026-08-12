import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabase } from '../lib/supabase'

export const Route = createFileRoute('/dashboard')({
  component: Dashboard,
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw redirect({ to: '/login' })
    }
  },
})

function Dashboard() {
  return (
    <div className="page-wrap py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="demo-card">
          <h2 className="demo-section-title">Total niños</h2>
          <p className="text-2xl font-bold">8</p>
        </div>
        <div className="demo-card">
          <h2 className="demo-section-title">Eventos este mes</h2>
          <p className="text-2xl font-bold">4</p>
        </div>
        <div className="demo-card">
          <h2 className="demo-section-title">Última asistencia</h2>
          <p className="text-2xl font-bold">9 / 8</p>
        </div>
      </div>
      <h2 className="text-2xl font-bold mt-8 mb-4">Próximos eventos</h2>
      <div className="demo-table-shell">
        <table className="demo-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Clase Bíblica Infantil</td>
              <td>2024-06-01</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
