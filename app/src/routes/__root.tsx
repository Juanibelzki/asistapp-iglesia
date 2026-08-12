import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { supabase } from '../lib/supabase'
import { getOrganization, getProfile } from '../lib/data'
import { useState, useEffect } from 'react'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#FFFFFF' },
      { title: 'AsistApp — Control de Asistencia y Gestión Infantil para Iglesias' },
      { name: 'description', content: 'Plataforma SaaS para el registro rápido de asistencia con código QR, gestión de niños y seguridad en iglesias.' },
      // OpenGraph
      { property: 'og:title', content: 'AsistApp — Control de Asistencia y Gestión Infantil para Iglesias' },
      { property: 'og:description', content: 'Plataforma SaaS para el registro rápido de asistencia con código QR, gestión de niños y seguridad en iglesias.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'AsistApp' },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'AsistApp — Control de Asistencia y Gestión Infantil para Iglesias' },
      { name: 'twitter:description', content: 'Plataforma SaaS para el registro rápido de asistencia con código QR, gestión de niños y seguridad en iglesias.' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const [org, setOrg] = useState<any>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
    async function checkSub() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const profile = await getProfile(session.user.id)
      const orgData = await getOrganization(profile.organization_id)
      setOrg(orgData)
    }
    checkSub()
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <Header />
        {org && (org.subscription_status === 'past_due' || org.subscription_status === 'canceled') && (
            <div className="bg-red-100 p-4 text-center">Suscripción inactiva. Por favor, regulariza tu pago.</div>
        )}
        {children}
        <Footer />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
