import { useNavigate } from 'react-router-dom'
import { ArrowRight, Compass } from 'lucide-react'
import { Section, Eyebrow, Heading, btnPrimary, btnSecondary } from './primitives'

export function FinalCTA() {
  const navigate = useNavigate()

  return (
    <Section bleed className="py-16 sm:py-24">
      <div className="mx-auto w-full max-w-5xl px-6 sm:px-8">
        {/* Minimal, clean, high-contrast surface card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm dark:border-white/10 dark:bg-ink-800 sm:px-12 sm:py-16">
          
          <div className="relative mx-auto max-w-2xl">
            <Eyebrow tone="spruce">Deploy Mission Network</Eyebrow>

            <Heading className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Make NER logistics predictive.
            </Heading>

            <p className="mx-auto mt-3.5 max-w-xl text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-300">
              Roads, weather, vehicles and field intelligence — unified into one resilient operational picture that foresees disruption and keeps critical lifelines open.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={() => navigate('/dashboard')} className={btnPrimary}>
                <span>Enter command center</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button onClick={() => navigate('/routes')} className={btnSecondary}>
                <Compass className="h-4 w-4 text-[#0E5F54] dark:text-spruce-400" />
                <span>Explore live corridors</span>
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>Prototype Operational · 8 North East States Active</span>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
