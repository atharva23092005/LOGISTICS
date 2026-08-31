import { Mountain, EyeOff, Clock3, WifiOff } from 'lucide-react'
import { Section, Eyebrow, Heading } from './primitives'

const PROBLEMS = [
  {
    icon: Mountain,
    title: 'Unpredictable disruptions',
    desc: 'Landslides, monsoon flash floods and road subsidence sever critical lifelines with no warning.',
  },
  {
    icon: EyeOff,
    title: 'Fragmented visibility',
    desc: 'No single picture unifies road passability, live vehicle telemetry and hazard forecasts.',
  },
  {
    icon: Clock3,
    title: 'Reactive decisions',
    desc: 'Without prediction, rerouting only begins after convoys are already stranded.',
  },
  {
    icon: WifiOff,
    title: 'Signal dead zones',
    desc: 'Field teams must report incidents from remote passes where cellular coverage is zero.',
  },
]

export function ProblemSection() {
  return (
    <Section id="problem" className="border-t border-slate-200 dark:border-white/10">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* framing */}
        <div className="lg:col-span-5">
          <Eyebrow tone="rose">The terrain reality</Eyebrow>
          <Heading className="mt-6 text-3xl sm:text-4xl">
            The North East can't wait for disaster to strike.
          </Heading>
          <p className="mt-5 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Conventional logistics systems assume the road will be there tomorrow. Across the
            North Eastern Region, that assumption fails often — and when it does, lives and
            supplies are on the line.
          </p>

          <div className="mt-8 flex items-baseline gap-4 border-l-2 border-rose-500/60 pl-5">
            <span className="font-display text-5xl font-semibold tracking-tight text-ink dark:text-white">
              70%
            </span>
            <span className="text-[13px] leading-snug text-slate-500 dark:text-slate-400">
              of the region is rugged mountain corridor
              <br className="hidden sm:inline" /> or river floodplain
            </span>
          </div>
        </div>

        {/* problem list */}
        <div className="lg:col-span-7">
          <ul className="divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">
            {PROBLEMS.map((p) => {
              const Icon = p.icon
              return (
                <li key={p.title} className="flex items-start gap-5 py-6">
                  <span className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-medium tracking-tight text-ink dark:text-white">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-slate-600 dark:text-slate-400">
                      {p.desc}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </Section>
  )
}
