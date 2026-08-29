import { Cpu, ShieldCheck, Route, Radio, ArrowRight } from 'lucide-react'

const PILLARS = [
  {
    title: 'Predict',
    desc: 'Forecast geotechnical disruptions, monsoonal flash floods, and bridgehead washouts 6–12 hours in advance.',
    icon: Cpu,
    color: 'text-primary border-primary/30 bg-primary/10',
  },
  {
    title: 'Protect',
    desc: 'Safeguard essential medical cargo, oxygen tankers, and emergency food relief with automated priority tags.',
    icon: ShieldCheck,
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  },
  {
    title: 'Reroute',
    desc: 'Dynamically calculate multi-modal alternate corridors that match heavy axle weights and hill slope limits.',
    icon: Route,
    color: 'text-info border-info/30 bg-info/10',
  },
  {
    title: 'Respond',
    desc: 'Coordinate disaster management cells, offline field officers, and convoy drivers with 1-click tactical dispatch.',
    icon: Radio,
    color: 'text-warning border-warning/30 bg-warning/10',
  },
]

export function ImpactPillarsSection() {
  return (
    <section className="py-16 md:py-24 bg-[#0A101D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <span>OPERATIONAL VALUE PILLARS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            From Road Intelligence to Supply Resilience.
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
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
                className="app-card p-6 bg-[#0D1626] border border-white/10 hover:border-white/20 transition-all rounded-2xl space-y-4"
              >
                <div className={`h-11 w-11 rounded-2xl border flex items-center justify-center ${p.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{p.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{p.desc}</p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
