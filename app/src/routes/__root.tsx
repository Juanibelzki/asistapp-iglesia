import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'
// CSS principal con Tailwind v4 (@import "tailwindcss") — imprescindible para que
// los estilos lleguen al <head> del documento renderizado en SSR.
import '../styles.css'
import { PwaRegister } from '../components/PwaRegister'
import { ToastProvider } from '../components/ui/toast'
import { themeInitScript } from '../lib/theme'
import { NotFound } from '../components/layout/NotFound'

const FONTS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: 'Ecclesiahs — Asistencia y gestión para iglesias' },
      {
        name: 'description',
        content:
          'Tomá asistencia con código QR, organizá tu membresía y seguí el crecimiento de tu congregación. Funciona sin conexión.',
      },
      { name: 'theme-color', content: '#fbf8f3' },
      { name: 'application-name', content: 'Ecclesiahs' },
      { name: 'apple-mobile-web-app-title', content: 'Ecclesiahs' },
    ],
    links: [
      { rel: 'icon', type: 'image/png', href: '/favicon.png?v=3' },
      { rel: 'shortcut icon', href: '/favicon.png?v=3' },
      { rel: 'alternate icon', href: '/favicon.ico' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png?v=3' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      { rel: 'stylesheet', href: FONTS },
    ],
  }),
  component: () => (
    <ToastProvider>
      <Outlet />
    </ToastProvider>
  ),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Aplica el tema antes del primer pintado (evita parpadeo) */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-canvas font-sans text-ink antialiased">
        {children}
        <PwaRegister />
        <Scripts />
      </body>
    </html>
  )
}
