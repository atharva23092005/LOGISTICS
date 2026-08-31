import { Mountain, EyeOff, AlertCircle, WifiOff, ShieldAlert } from 'lucide-react'

const PROBLEMS = [
  {
    step: '01',
    title: 'Unpredictable Disruptions',
    desc: 'Landslides, monsoonal flash floods, cloudbursts, and sudden road subsidence sever critical lifelines without warning.',
    icon: Mountain,
    badge: 'Geotechnical Volatility',
    accent: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
  },
  {
    step: '02',
    title: 'Fragmented Visibility',
    desc: 'Decision-makers lack a single tactical picture that unifies road passability, live vehicle telemetry, and hazard radar.',
    icon: EyeOff,
    badge: 'Operational Silos',
    accent: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  },
  {
    step: '03',
    title: 'Reactive Decision Making',
    desc: 'Without predictive ML intelligence, rerouting begins only after convoys are already stranded in mudslides or floodwaters.',
    icon: AlertCircle,
    badge: 'Supply Chain Stagnation',
    accent: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20',
  },
  {
    step: '04',
    title: 'Zero-Signal Dead Zones',
    desc: 'Field officers and checkpoint teams must report incidents from remote hill corridors where cellular coverage is zero.',
    icon: WifiOff,
    badge: 'Connectivity Gaps',
    accent: 'text-sky-700 dark:text-cyan-400 bg-sky-50 dark:bg-cyan-500/10 border-sky-200 dark:border-cyan-500/20',
  },
]

export function ProblemSection() {
  return (
    <section id="platform" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-700 dark:text-rose-400 text-xs font-semibold">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>THE TERRAIN REALITY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            NER Logistics Can&apos;t Wait for Disaster to Strike.
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-muted leading-relaxed">
            Over 70% of the North Eastern Region consists of rugged mountainous corridors and river floodplains.
            Conventional logistics systems fail when natural hazards strike without foresight.
          </p>
        </div>

        {/* 4 Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROBLEMS.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.step}
                className="p-5 space-y-4 bg-white dark:bg-surface/80 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all rounded-2xl group flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-mono font-bold text-blue-700 dark:text-primary px-2 py-0.5 rounded bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/20">
                      PHASE {p.step}
                    </span>
                    <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${p.accent}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-text-muted leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-text-dim uppercase tracking-wider font-mono">
                    {p.badge}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

