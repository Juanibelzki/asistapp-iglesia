import { createFileRoute, Outlet } from '@tanstack/react-router'
import { OrgProvider } from '../lib/org'
import { AppShell, AppShellSkeleton } from '../components/layout/AppShell'

/**
 * Layout de la zona autenticada (pathless): resuelve la organización del usuario
 * y envuelve las páginas con el shell de navegación. Las rutas hijas se
 * declaran como `_app.<ruta>.tsx` y conservan su URL (`/dashboard`, `/congregados`).
 */
export const Route = createFileRoute('/_app')({
  head: () => ({ meta: [{ name: 'robots', content: 'noindex' }] }),
  component: AppLayout,
})

function AppLayout() {
  return (
    <OrgProvider fallback={<AppShellSkeleton />}>
      <AppShell>
        <Outlet />
      </AppShell>
    </OrgProvider>
  )
}
