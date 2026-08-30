import { Mountain, EyeOff, AlertCircle, WifiOff } from 'lucide-react'

const PROBLEMS = [
  {
    step: '01',
    title: 'Unpredictable Disruptions',
    desc: 'Landslides, monsoonal flash floods, heavy rainfall and sudden road subsidence can sever critical transport arteries without warning.',
    icon: Mountain,
    badge: 'Geotechnical Volatility',
  },
  {
    step: '02',
    title: 'Limited Visibility',
    desc: 'Decision-makers often lack a single operational picture that unifies road passability, live vehicle telemetry, and hazard alerts.',
    icon: EyeOff,
    badge: 'Fragmented Silos',
  },
  {
    step: '03',
    title: 'Reactive Decisions',
    desc: 'Without predictive intelligence, rerouting begins only after trucks are already stranded in mudslides or flood zones.',
    icon: AlertCircle,
    badge: 'Supply Chain Delay',
  },
  {
    step: '04',
    title: 'Connectivity Gaps',
    desc: 'Field officers and checkpoint teams must report incidents from remote hill corridors where cellular coverage is intermittent or zero.',
    icon: WifiOff,
    badge: 'Zero-Signal Zones',
  },
]

export function ProblemSection() {
  return (
    <section id="platform" className="py-16 md:py-24 bg-[#0A101D] relative overflow-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
            <span>THE CHALLENGE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            NER Logistics Can&apos;t Wait for Disruptions to Happen.
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Over 70% of the North Eastern Region consists of rugged mountainous terrain and floodplains.
            Conventional logistics systems fail when natural hazards strike without foresight.
          </p>
        </div>

        {/* 4 Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {PROBLEMS.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.step}
                className="app-card p-5 space-y-3 bg-[#0D1626] border border-white/10 hover:border-primary/40 transition-all rounded-2xl group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                      {p.step}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-surface-2 flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>

                  <p className="text-xs text-text-muted leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5">
                  <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
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
