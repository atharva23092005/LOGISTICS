import { Cpu, ShieldCheck, Route, Radio, ArrowRight, Shield } from 'lucide-react'

const PILLARS = [
  {
    title: 'Predict',
    desc: 'Forecast geotechnical disruptions, monsoonal flash floods, and bridgehead washouts 6–12 hours in advance.',
    icon: Cpu,
    color: 'text-blue-700 dark:text-primary border-blue-200 dark:border-primary/30 bg-blue-50 dark:bg-primary/10',
  },
  {
    title: 'Protect',
    desc: 'Safeguard essential medical cargo, oxygen tankers, and emergency food relief with automated priority tags.',
    icon: ShieldCheck,
    color: 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    title: 'Reroute',
    desc: 'Dynamically calculate multi-modal alternate corridors that match heavy axle weights and hill slope limits.',
    icon: Route,
    color: 'text-sky-700 dark:text-cyan-400 border-sky-200 dark:border-cyan-500/30 bg-sky-50 dark:bg-cyan-500/10',
  },
  {
    title: 'Respond',
    desc: 'Coordinate disaster management cells, offline field officers, and convoy drivers with 1-click tactical dispatch.',
    icon: Radio,
    color: 'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10',
  },
]

export function ImpactPillarsSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/25 text-blue-700 dark:text-primary text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" />
            <span>OPERATIONAL VALUE PILLARS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            From Road Intelligence to Supply Resilience.
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-muted leading-relaxed">
            Every minute of earlier intelligence can become a safer logistics decision.
          </p>
        </div>

        {/* 4 Impact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.title}
                className="p-6 bg-white dark:bg-surface/80 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 rounded-2xl space-y-4 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`h-11 w-11 rounded-2xl border flex items-center justify-center ${p.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{p.title}</h3>
                <p className="text-xs text-slate-600 dark:text-text-muted leading-relaxed">{p.desc}</p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

