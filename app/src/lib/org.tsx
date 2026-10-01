import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { supabase } from './supabase'
import { readLocalSession, clearLocalSessions } from './session'

export interface OrgContextValue {
  orgId: string
  fullName: string
  churchName: string
  memberLimit: number
  role: string
  signOut: () => Promise<void>
}

type Resolved =
  | { status: 'ok'; value: Omit<OrgContextValue, 'signOut'> }
  | { status: 'unauthenticated' }
  | { status: 'staff' }

const STAFF_ROLES = ['staff', 'usher', 'ujier']

/**
 * Determina la organización del usuario actual:
 *  1) sesión de Supabase Auth → profiles + organizations
 *  2) sesión local (login por teléfono + PIN) guardada en localStorage
 */
export async function resolveOrg(): Promise<Resolved> {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role, organization_id, organizations(name, member_limit)')
      .eq('auth_user_id', session.user.id)
      .maybeSingle()

    if (!profile?.organization_id) return { status: 'unauthenticated' }
    const org = profile.organizations as { name?: string; member_limit?: number } | null
    return {
      status: 'ok',
      value: {
        orgId: profile.organization_id,
        fullName: profile.full_name || 'Admin',
        churchName: org?.name || 'Mi Iglesia',
        memberLimit: org?.member_limit ?? 50,
        role: (profile.role as string) || 'admin',
      },
    }
  }

  const local = readLocalSession()
  if (!local?.organization_id) return { status: 'unauthenticated' }
  const role = (local.role || '').toLowerCase()
  if (STAFF_ROLES.includes(role)) return { status: 'staff' }

  let churchName = local.church_name || ''
  let memberLimit = 50
  const { data: org } = await supabase
    .from('organizations')
    .select('name, member_limit')
    .eq('id', local.organization_id)
    .maybeSingle()
  if (org) {
    churchName = org.name || churchName
    memberLimit = org.member_limit ?? 50
  }

  return {
    status: 'ok',
    value: {
      orgId: local.organization_id,
      fullName: local.full_name || 'Admin',
      churchName: churchName || 'Mi Iglesia',
      memberLimit,
      role: local.role || 'admin',
    },
  }
}

const OrgContext = createContext<OrgContextValue | null>(null)

export function useOrg(): OrgContextValue {
  const ctx = useContext(OrgContext)
  if (!ctx) throw new Error('useOrg debe usarse dentro de <OrgProvider>')
  return ctx
}

interface OrgProviderProps {
  children: ReactNode
  /** Contenido mientras se resuelve la sesión (y durante SSR). */
  fallback: ReactNode
}

export function OrgProvider({ children, fallback }: OrgProviderProps) {
  const navigate = useNavigate()
  const [value, setValue] = useState<Omit<OrgContextValue, 'signOut'> | null>(null)

  useEffect(() => {
    let alive = true
    resolveOrg()
      .then((res) => {
        if (!alive) return
        if (res.status === 'ok') setValue(res.value)
        else if (res.status === 'staff') navigate({ to: '/asistencia', replace: true })
        else navigate({ to: '/login', replace: true })
      })
      .catch((err) => {
        console.error('Error al resolver la organización:', err)
        if (alive) navigate({ to: '/login', replace: true })
      })
    return () => {
      alive = false
    }
  }, [navigate])

  const signOut = useCallback(async () => {
    clearLocalSessions()
    await supabase.auth.signOut()
    navigate({ to: '/login', replace: true })
  }, [navigate])

  const ctx = useMemo<OrgContextValue | null>(() => (value ? { ...value, signOut } : null), [value, signOut])

  if (!ctx) return <>{fallback}</>
  return <OrgContext.Provider value={ctx}>{children}</OrgContext.Provider>
}
