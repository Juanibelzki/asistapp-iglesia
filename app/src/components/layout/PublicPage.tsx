import type { ReactNode } from 'react'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'

/** Contenedor de páginas públicas de texto (about, términos, privacidad). */
export function PublicPage({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-14 sm:py-20">
        <h1 className="font-display text-4xl font-extrabold text-ink sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 text-lg text-ink-soft">{intro}</p>}
        <div className="prose mt-10 max-w-none text-ink-soft prose-headings:text-ink prose-strong:text-ink prose-a:text-primary">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
