import { Radar, Route, Navigation, WifiOff, Siren, MessageSquareText } from 'lucide-react'
import { Section, Eyebrow, Heading } from './primitives'
import { cn } from '@/utils/cn'

const CAPABILITIES = [
  {
    icon: Radar,
    title: 'Disruption forecasting',
    desc: 'Predict landslide and flood risk 6–12 hours ahead, with hazard polygons pushed to the map before roads fail.',
    spec: 'XGBoost · IMD radar · ISRO DEM',
    featured: true,
  },
  {
    icon: Route,
    title: 'Multi-modal routing',
    desc: 'Compute terrain-safe alternate corridors that respect slope, bridge tonnage and axle limits — not just distance.',
    spec: 'Slope-aware · load-rated',
  },
  {
    icon: Navigation,
    title: 'Live fleet telemetry',
    desc: 'Track every convoy in real time and auto-detour vehicles whose path intersects an emerging hazard.',
    spec: 'GPS · MQTT · 1s refresh',
  },
  {
    icon: WifiOff,
    title: 'Offline-first field ops',
    desc: 'Field terminals keep capturing and syncing incident reports in zero-signal passes, reconciling when back online.',
    spec: 'PWA · IndexedDB sync',
  },
  {
    icon: Siren,
    title: 'Emergency response',
    desc: 'Escalate to disaster mode with one-click priority dispatch for medical, oxygen and relief cargo.',
    spec: 'SDMA · escalation mode',
  },
  {
    icon: MessageSquareText,
    title: 'Operations copilot',
    desc: 'Ask what the highest risk is right now, or simulate a corridor failure — and get the action, not just the answer.',
    spec: 'Context-aware · what-if',
  },
]

export function PlatformSection() {
  return (
    <Section id="platform" className="border-t border-slate-200 dark:border-white/10">
      <div className="max-w-2xl">
        <Eyebrow>The platform</Eyebrow>
        <Heading className="mt-6 text-3xl sm:text-4xl">
          One operational picture, from forecast to field.
        </Heading>
        <p className="mt-5 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
          Six capabilities on a single map — so a forecast becomes a reroute, a reroute becomes
          a dispatch, and a field report closes the loop.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 dark:border-white/10 dark:bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
        {CAPABILITIES.map((c) => {
          const Icon = c.icon
          return (
            <div
              key={c.title}
              className="group relative flex flex-col bg-paper p-6 transition-colors hover:bg-white dark:bg-ink-900 dark:hover:bg-ink-800 sm:p-7"
            >
              {c.featured && (
                <span className="absolute inset-x-0 top-0 h-0.5 bg-spruce" aria-hidden="true" />
              )}
              <span
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-xl border transition-colors',
                  c.featured
                    ? 'border-spruce/20 bg-spruce-wash text-spruce dark:border-spruce-400/20 dark:bg-spruce-400/10 dark:text-spruce-400'
                    : 'border-slate-200 bg-white text-slate-600 group-hover:text-spruce dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:group-hover:text-spruce-400',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>

              <h3 className="mt-5 font-display text-lg font-medium tracking-tight text-ink dark:text-white">
                {c.title}
              </h3>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">
                {c.desc}
              </p>

              <div className="mt-5 flex items-center gap-2 border-t border-slate-200/70 pt-4 dark:border-white/5">
                <span className="h-1 w-1 rounded-full bg-spruce-500" />
                <span className="font-mono text-[10.5px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {c.spec}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
