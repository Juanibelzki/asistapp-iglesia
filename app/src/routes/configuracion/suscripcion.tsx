import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { getOrganization, getProfile } from '../../lib/data'

export const Route = createFileRoute('/configuracion/suscripcion')({
  component: SuscripcionPage,
})

function SuscripcionPage() {
  const [org, setOrg] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const profile = await getProfile(session.user.id)
      const orgData = await getOrganization(profile.organization_id)
      setOrg(orgData)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div>Cargando...</div>

  return (
    <div className="page-wrap py-8">
      <h1 className="text-3xl font-bold mb-6">Suscripción</h1>
      <div className="demo-panel p-6">
        <p>Estado actual: <strong>{org.subscription_status}</strong></p>
        <p>Plan: <strong>{org.plan}</strong></p>
        <br />
        {org.subscription_status === 'active' ? (
          <button className="demo-button">Gestionar Suscripción</button>
        ) : (
          <button className="demo-button">Suscribirse ($9/mes)</button>
        )}
      </div>
    </div>
  )
}
