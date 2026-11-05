import { createFileRoute } from '@tanstack/react-router'
import { MotionConfig } from 'framer-motion'
import { CursorFollower } from '../components/landing/CursorFollower'
import { LandingNav } from '../components/landing/LandingNav'
import { Hero } from '../components/landing/Hero'
import { ProductReveal } from '../components/landing/ProductReveal'
import { Ribbons } from '../components/landing/Ribbons'
import { StoryScroll } from '../components/landing/StoryScroll'
import { Bento } from '../components/landing/Bento'
import { Stats } from '../components/landing/Stats'
import { Pricing } from '../components/landing/Pricing'
import { Faq } from '../components/landing/Faq'
import { FinalCta } from '../components/landing/FinalCta'
import { LandingFooter } from '../components/landing/LandingFooter'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  // reducedMotion="user": respeta "reducir movimiento" del sistema en todas
  // las animaciones de framer-motion de la landing.
  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen overflow-x-clip bg-marino-deep font-sans text-white selection:bg-rojo selection:text-white">
      <CursorFollower />
      <LandingNav />
      <main>
        <Hero />
        <ProductReveal />
        <Ribbons />
        <StoryScroll />
        <Bento />
        <Stats />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
    </MotionConfig>
  )
}
