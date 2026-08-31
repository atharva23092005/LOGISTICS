import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Compass } from 'lucide-react'
import { Eyebrow, Heading, WavyPatternField, btnPrimary, btnSecondary } from './primitives'
import { HeroMapSimulation } from './HeroMapSimulation'

/* A single rotating line of live operational context — the hero's "pulse". */
const FEED = [
  { tone: 'rose', code: 'NH-415 · KM 42', text: 'Landslide risk 78% — 7 convoys rerouted via Route C', tag: 'REROUTED' },
  { tone: 'spruce', code: 'AS-09-4821 · MED', text: 'Cold-chain convoy on safe corridor · ETA 17:10', tag: 'ON TRACK' },
  { tone: 'amber', code: 'NH-37 · Bokakhat', text: 'Floodplain inundation watch — 30 km/h advisory', tag: 'CAUTION' },
] as const

const HERO_STATS = [
  { value: '8', label: 'NE states monitored' },
  { value: '6–12h', label: 'Hazard lead time' },
  { value: '94.2%', label: 'Disruption avoidance' },
]

export function HeroSection() {
  const navigate = useNavigate()
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIdx((p) => (p + 1) % FEED.length), 4200)
    return () => clearInterval(t)
  }, [])

  const feed = FEED[idx]

  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
      {/* Equidistant thin architectural wave pattern backdrop — darkened for clear visibility */}
      <WavyPatternField className="text-slate-900/[0.22] dark:text-white/[0.16]" rows={18} step={42} amplitude={16} wavelength={240} strokeWidth={1} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-spruce/20 to-transparent" />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-6 sm:px-8 lg:grid-cols-12 lg:gap-10">
        {/* ── Left: thesis ── */}
        <div className="lg:col-span-6">
          <Eyebrow>NER Logistics Intelligence</Eyebrow>

          <Heading as="h1" className="mt-6 text-4xl leading-[1.06] sm:text-5xl lg:text-[3.4rem]">
            Predict the disruption
            <br className="hidden sm:inline" />{' '}
            before it stops
            <br className="hidden sm:inline" />{' '}
            <span className="text-spruce dark:text-spruce-400">the supply chain.</span>
          </Heading>

          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            NERA forecasts landslides and floods across India's eight North Eastern states,
            tracks essential medical and food convoys, and computes terrain-safe routes —
            so relief keeps moving when the mountains don't cooperate.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => navigate('/dashboard')} className={btnPrimary}>
              Launch command center
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button onClick={() => navigate('/map')} className={btnSecondary}>
              <Compass className="h-4 w-4 text-spruce dark:text-spruce-400" />
              View live map
            </button>
          </div>

          {/* Proof anchor */}
          <dl className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-slate-200 pt-6 dark:border-white/10">
            {HERO_STATS.map((s) => (
              <div key={s.label}>
                <dt className="font-display text-2xl font-semibold tracking-tight text-ink dark:text-white">
                  {s.value}
                </dt>
                <dd className="mt-0.5 text-[12px] text-slate-500 dark:text-slate-400">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Right: Realistic GIS simulation map ── */}
        <div className="lg:col-span-6">
          <HeroMapSimulation feed={feed} idx={idx} />
        </div>
      </div>
    </section>
  )
}
