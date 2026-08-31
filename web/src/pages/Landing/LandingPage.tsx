import { LandingNavbar } from './components/LandingNavbar'
import { HeroSection } from './components/HeroSection'
import { ProblemSection } from './components/ProblemSection'
import { PlatformSection } from './components/PlatformSection'
import { ReactiveVsPredictive } from './components/ReactiveVsPredictive'
import { ProofSection } from './components/ProofSection'
import { DataTrustSection } from './components/DataTrustSection'
import { FinalCTA } from './components/FinalCTA'
import { LandingFooter } from './components/LandingFooter'

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-paper font-sans text-ink antialiased selection:bg-spruce/20 selection:text-spruce-700 dark:bg-ink-900 dark:text-slate-200 dark:selection:bg-spruce-400/25 dark:selection:text-white">
      <LandingNavbar />

      <main className="relative">
        {/* 8-section narrative: Hero → Problem → Platform → Approach → Impact → Data → CTA */}
        <div className="relative">
          <HeroSection />
          <ProblemSection />
          <PlatformSection />
          <ReactiveVsPredictive />
          <ProofSection />
          <DataTrustSection />
          <FinalCTA />
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
