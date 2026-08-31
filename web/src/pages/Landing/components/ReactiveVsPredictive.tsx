import { CheckCircle2 } from 'lucide-react'
import { Section, Eyebrow, Heading } from './primitives'

const STEPS = [
  {
    n: '01',
    title: 'Ingest',
    desc: 'IMD Doppler radar, ISRO 0.5 m elevation and live GPS telemetry stream into one model.',
  },
  {
    n: '02',
    title: 'Predict',
    desc: 'XGBoost scores landslide and flood risk 6–12 hours ahead, segment by segment.',
  },
  {
    n: '03',
    title: 'Reroute',
    desc: 'Terrain-safe corridors are computed and at-risk convoys are notified instantly.',
  },
  {
    n: '04',
    title: 'Respond',
    desc: 'Priority dispatch executes; field officers confirm ground clearance offline.',
  },
]

export function ReactiveVsPredictive() {
  return (
    <Section id="approach" className="border-t border-slate-200 dark:border-white/10">
      <div className="max-w-2xl">
        <Eyebrow>The approach</Eyebrow>
        <Heading className="mt-6 text-3xl sm:text-4xl">From reacting to anticipating.</Heading>
        <p className="mt-5 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
          The old way is a chain of delays: a road fails, and it's 4–6 hours before the control
          room even knows — by which point convoys are stranded and rerouting happens by phone,
          under no signal. NERA runs the loop in reverse, before the failure.
        </p>
      </div>

      {/* Predictive pipeline */}
      <ol className="mt-14 grid grid-cols-1 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6">
        {STEPS.map((s, i) => (
          <li key={s.n} className="relative">
            {/* connector */}
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="absolute left-11 top-4 hidden h-px w-[calc(100%-1.5rem)] bg-gradient-to-r from-spruce/40 to-slate-200 dark:to-white/10 lg:block"
              />
            )}
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-spruce/30 bg-spruce-wash font-mono text-[11px] font-semibold text-spruce dark:border-spruce-400/30 dark:bg-spruce-400/10 dark:text-spruce-400">
                {s.n}
              </span>
              <h3 className="font-display text-lg font-medium tracking-tight text-ink dark:text-white">
                {s.title}
              </h3>
            </div>
            <p className="mt-3 pr-4 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400 lg:pl-11">
              {s.desc}
            </p>
          </li>
        ))}
      </ol>

      {/* Outcome */}
      <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl border border-spruce/20 bg-spruce-wash px-6 py-5 dark:border-spruce-400/20 dark:bg-spruce-400/5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-spruce dark:text-spruce-400" strokeWidth={1.8} />
          <p className="text-[14px] font-medium text-ink dark:text-white">
            94.2% disruption avoidance, with zero stranded critical cargo.
          </p>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-spruce dark:text-spruce-400">
          Measured on prototype network
        </span>
      </div>
    </Section>
  )
}
