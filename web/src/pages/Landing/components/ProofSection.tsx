import { Eyebrow, Heading } from './primitives'

const METRICS = [
  { value: '94.2%', label: 'Disruption avoidance', sub: 'Automated reroute protocol' },
  { value: '6–12h', label: 'Forecast lead time', sub: 'Ahead of road failure' },
  { value: '47', label: 'Vehicles monitored', sub: 'Live GPS telemetry' },
  { value: '128', label: 'Road segments', sub: 'DEM slope-mapped' },
]

const VERBS = [
  { verb: 'Predict', line: 'Geotechnical risk, 6–12h out.' },
  { verb: 'Protect', line: 'Priority tags for medical & relief cargo.' },
  { verb: 'Reroute', line: 'Corridors matched to slope & tonnage.' },
  { verb: 'Respond', line: 'One-click dispatch, online or off.' },
]

export function ProofSection() {
  return (
    <section id="impact" className="relative border-y border-slate-200 bg-paper-deep dark:border-white/10 dark:bg-ink-900">

      <div className="relative mx-auto w-full max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <Eyebrow>Impact</Eyebrow>
          <Heading className="mt-6 text-3xl sm:text-4xl">
            Every minute of earlier intelligence is a safer decision.
          </Heading>
        </div>

        {/* Metrics */}
        <dl className="mt-14 grid grid-cols-2 gap-y-10 border-y border-slate-200 py-10 dark:border-white/10 lg:grid-cols-4 lg:divide-x lg:divide-slate-200 dark:lg:divide-white/10">
          {METRICS.map((m) => (
            <div key={m.label} className="lg:px-8 lg:first:pl-0">
              <dt className="font-display text-4xl font-semibold tracking-tight text-ink dark:text-white sm:text-5xl">
                {m.value}
              </dt>
              <dd className="mt-3 text-[14px] font-medium text-ink dark:text-slate-200">{m.label}</dd>
              <dd className="mt-1 font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {m.sub}
              </dd>
            </div>
          ))}
        </dl>

        {/* Verbs */}
        <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {VERBS.map((v) => (
            <div key={v.verb} className="flex items-baseline gap-3">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-spruce dark:text-spruce-400">
                {v.verb}
              </span>
              <span className="text-[13px] text-slate-600 dark:text-slate-400">{v.line}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
