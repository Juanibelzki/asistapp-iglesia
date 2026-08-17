import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getOrganization, getProfile } from '../lib/data'
import { readLocalSession } from '../lib/session'

export const Route = createFileRoute('/suscripcion')({
  component: SuscripcionPage,
})

interface ToastState {
  message: string
  type: 'success' | 'error'
}

function SuscripcionPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [org, setOrg] = useState<any>(null)
  const [memberCount, setMemberCount] = useState(0)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [gateway, setGateway] = useState<'mercadopago' | 'stripe'>('mercadopago')

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        let orgId: string | null = null

        if (session) {
          const profile = await getProfile(session.user.id)
          orgId = profile?.organization_id ?? null
        } else {
          const local = readLocalSession()
          orgId = local?.organization_id ?? null
        }

        if (!orgId) {
          navigate({ to: '/login' })
          return
        }

        const orgData = await getOrganization(orgId)
        setOrg(orgData)

        // Count members
        const { count, error: countError } = await supabase
          .from('congregados')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgId)

        if (!countError && count !== null) {
          setMemberCount(count)
        }
      } catch (err) {
        console.error('Error al cargar datos de suscripción:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [navigate])

  const showToast = (message: string, type: ToastState['type'] = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleUpgrade = async (planKey: string, limit: number, planName: string) => {
    if (!org) return
    setUpgrading(planKey)
    try {
      // Simulate gateway checkout session (Mercado Pago Subscriptions / Stripe Billing)
      await new Promise((r) => setTimeout(r, 1200))

      const { error } = await supabase
        .from('organizations')
        .update({
          subscription_plan: planKey,
          subscription_status: 'active',
          member_limit: limit,
          subscription_id: `sub_${gateway}_${Date.now()}`,
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', org.id)

      if (error) throw error

      setOrg((prev: any) => ({
        ...prev,
        subscription_plan: planKey,
        subscription_status: 'active',
        member_limit: limit,
      }))

      showToast(`¡Suscripción actualizada al ${planName} exitosamente (${gateway === 'mercadopago' ? 'Mercado Pago' : 'Stripe'})!`)
    } catch (err) {
      console.error('Error al actualizar plan:', err)
      showToast(err instanceof Error ? err.message : 'No se pudo procesar la suscripción.', 'error')
    } finally {
      setUpgrading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400 font-medium">Cargando módulo de suscripciones...</p>
      </div>
    )
  }

  const currentPlan = org?.subscription_plan || 'free'
  const currentStatus = org?.subscription_status || 'active'
  const memberLimit = org?.member_limit ?? 50

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-zinc-950">
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Planes y Facturación</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Gestioná el plan activo de <span className="text-white font-semibold">{org?.name || 'tu iglesia'}</span> y los cupos de congregados.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
              <button
                onClick={() => setGateway('mercadopago')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  gateway === 'mercadopago' ? 'bg-sky-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🇦🇷 Mercado Pago
              </button>
              <button
                onClick={() => setGateway('stripe')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  gateway === 'stripe' ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                🌐 Stripe Billing
              </button>
            </div>
            <Link
              to="/ajustes"
              className="text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 px-3 py-2 rounded-xl transition"
            >
              ← Ajustes
            </Link>
          </div>
        </div>

        {/* STATUS BANNER */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Plan Activo: {currentPlan.toUpperCase()}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                currentStatus === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                Estado: {currentStatus === 'active' ? 'Activo' : currentStatus}
              </span>
            </div>
            <p className="text-sm text-zinc-400 pt-2">
              Uso actual: <strong className="text-white">{memberCount}</strong> de <strong className="text-white">{memberLimit === 99999 ? 'Ilimitados' : memberLimit}</strong> congregados registrados.
            </p>
            {memberLimit !== 99999 && memberCount >= memberLimit * 0.8 && (
              <p className="text-xs text-amber-400 font-medium pt-1">
                ⚠️ Te estás acercando al límite de tu plan. Actualiza a un plan superior para evitar restricciones en el registro.
              </p>
            )}
          </div>

          <div className="w-full md:w-72 bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>Cupo utilizado</span>
              <span>{Math.round((memberCount / (memberLimit === 99999 ? Math.max(memberCount, 1) : memberLimit)) * 100)}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  memberCount >= memberLimit ? 'bg-red-500' : memberCount >= memberLimit * 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, (memberCount / (memberLimit === 99999 ? Math.max(memberCount, 1) : memberLimit)) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* PLANS GRID */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6">Selecciona el Plan Ideal para tu Ministerio</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* PLAN 1: SEMILLA */}
            <div className={`bg-zinc-950/60 border rounded-2xl p-6 flex flex-col justify-between relative transition ${
              currentPlan === 'free' || currentPlan === 'semilla' ? 'border-emerald-500 shadow-xl shadow-emerald-500/10' : 'border-zinc-800 hover:border-zinc-700'
            }`}>
              { (currentPlan === 'free' || currentPlan === 'semilla') && (
                <div className="absolute -top-3 left-6 bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
                  Plan Actual
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Plan Semilla</h3>
                  <p className="text-xs text-zinc-400 mt-1">Ideal para congregaciones pequeñas e iglesias en inicio.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">$0</span>
                  <span className="text-xs text-zinc-500">/ mes</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 border-t border-zinc-900">
                  <li className="flex items-center gap-2">✅ Hasta <strong>50 miembros</strong></li>
                  <li className="flex items-center gap-2">✅ Escáner QR de asistencia ilimitado</li>
                  <li className="flex items-center gap-2">✅ Métricas y dashboard básico</li>
                  <li className="flex items-center gap-2">✅ Directorio de congregados</li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-900">
                {currentPlan === 'free' || currentPlan === 'semilla' ? (
                  <button disabled className="w-full py-2.5 rounded-xl bg-zinc-900 text-zinc-400 font-bold text-xs cursor-default">
                    Plan Activo
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade('free', 50, 'Plan Semilla')}
                    disabled={upgrading !== null}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs transition"
                  >
                    Cambiar a Semilla
                  </button>
                )}
              </div>
            </div>

            {/* PLAN 2: COMUNIDAD */}
            <div className={`bg-zinc-950/60 border rounded-2xl p-6 flex flex-col justify-between relative transition ${
              currentPlan === 'community' || currentPlan === 'pro' ? 'border-emerald-500 shadow-xl shadow-emerald-500/10' : 'border-zinc-800 hover:border-zinc-700'
            }`}>
              { (currentPlan === 'community' || currentPlan === 'pro') && (
                <div className="absolute -top-3 left-6 bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
                  Plan Actual
                </div>
              )}
              <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                Más Popular ⭐
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Plan Comunidad</h3>
                  <p className="text-xs text-zinc-400 mt-1">Para iglesias en crecimiento con múltiples ministerios.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{gateway === 'mercadopago' ? '$18.900' : '$29'}</span>
                  <span className="text-xs text-zinc-500">/ mes ({gateway === 'mercadopago' ? 'ARS' : 'USD'})</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 border-t border-zinc-900">
                  <li className="flex items-center gap-2">✅ Hasta <strong>300 miembros</strong></li>
                  <li className="flex items-center gap-2">✅ Reportes avanzados en Excel / CSV</li>
                  <li className="flex items-center gap-2">✅ Escáner QR y control de niños</li>
                  <li className="flex items-center gap-2">✅ Soporte prioritario vía WhatsApp</li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-900">
                {currentPlan === 'community' || currentPlan === 'pro' ? (
                  <button disabled className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 cursor-default">
                    Plan Activo
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade('community', 300, 'Plan Comunidad')}
                    disabled={upgrading !== null}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {upgrading === 'community' ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-zinc-950/40 border-t-zinc-950 rounded-full animate-spin" />
                        Procesando checkout...
                      </>
                    ) : (
                      'Mejorar a Comunidad'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* PLAN 3: CATEDRAL */}
            <div className={`bg-zinc-950/60 border rounded-2xl p-6 flex flex-col justify-between relative transition ${
              currentPlan === 'catedral' || currentPlan === 'enterprise' ? 'border-emerald-500 shadow-xl shadow-emerald-500/10' : 'border-zinc-800 hover:border-zinc-700'
            }`}>
              { (currentPlan === 'catedral' || currentPlan === 'enterprise') && (
                <div className="absolute -top-3 left-6 bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
                  Plan Actual
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Plan Catedral</h3>
                  <p className="text-xs text-zinc-400 mt-1">Para grandes ministerios y redes de iglesias.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{gateway === 'mercadopago' ? '$49.900' : '$79'}</span>
                  <span className="text-xs text-zinc-500">/ mes ({gateway === 'mercadopago' ? 'ARS' : 'USD'})</span>
                </div>
                <ul className="space-y-2.5 text-xs text-zinc-300 pt-4 border-t border-zinc-900">
                  <li className="flex items-center gap-2">✅ Miembros <strong>ilimitados</strong></li>
                  <li className="flex items-center gap-2">✅ Múltiples sedes / campus</li>
                  <li className="flex items-center gap-2">✅ Roles y permisos personalizados</li>
                  <li className="flex items-center gap-2">✅ Asesor dedicado 24/7</li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-900">
                {currentPlan === 'catedral' || currentPlan === 'enterprise' ? (
                  <button disabled className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs border border-emerald-500/30 cursor-default">
                    Plan Activo
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade('catedral', 99999, 'Plan Catedral')}
                    disabled={upgrading !== null}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                  >
                    {upgrading === 'catedral' ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-zinc-950/40 border-t-zinc-950 rounded-full animate-spin" />
                        Procesando checkout...
                      </>
                    ) : (
                      'Mejorar a Catedral'
                    )}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-2xl border transition ${
            toast.type === 'success'
              ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
              : 'bg-red-500 text-zinc-950 border-red-400'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
