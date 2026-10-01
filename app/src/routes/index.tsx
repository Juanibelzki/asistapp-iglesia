import { createFileRoute } from '@tanstack/react-router'
import { SiteHeader } from '../components/layout/SiteHeader'
import { SiteFooter } from '../components/layout/SiteFooter'
import { Hero } from '../components/landing/Hero'
import { Faq, Features, FinalCta, HowItWorks, Pricing } from '../components/landing/Sections'

export const Route = createFileRoute('/')({
  component: Landing,
})

function Landing() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
