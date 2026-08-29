import { Eye, Cpu, WifiOff, Route, ShieldCheck } from 'lucide-react'

const PILLARS = [
  {
    icon: Eye,
    title: 'Real-Time Visibility',
    desc: 'Roads • Vehicles • Incidents',
    color: 'text-primary',
  },
  {
    icon: Cpu,
    title: 'Predictive Intelligence',
    desc: 'AI-powered disruption forecasting',
    color: 'text-info',
  },
  {
    icon: WifiOff,
    title: 'Offline Field Operations',
    desc: 'Capture & sync without connectivity',
    color: 'text-warning',
  },
  {
    icon: Route,
    title: 'Intelligent Routing',
    desc: 'Terrain-aware multivariable rerouting',
    color: 'text-success',
  },
]

const STATS = [
  { value: '47+', label: 'Vehicles Monitored', sub: 'Live active telemetry' },
  { value: '128', label: 'Road Segments', sub: 'Mapped across Northeast' },
  { value: '24', label: 'Districts Monitored', sub: '8 North East States' },
  { value: '12', label: 'At-Risk Deliveries', sub: 'Auto-rerouting active' },
]

export function ImpactMetricsStrip() {
  return (
    <section className="relative z-20 border-y border-white/10 bg-[#080D18]/90 backdrop-blur-xl py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ── 4 Feature Value Props ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-6 border-b border-white/5">
          {PILLARS.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.title} className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className={`h-4.5 w-4.5 ${p.color}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{p.title}</h4>
                  <p className="text-[11px] text-text-muted">{p.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── 4 Key Prototype Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-center">
          {STATS.map((s) => (
            <div key={s.label} className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {s.value}
              </div>
              <div className="text-xs font-bold text-text-muted">{s.label}</div>
              <div className="text-[10px] text-text-dim">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <span className="text-[10px] text-text-dim">
            * Representative telemetry metrics simulated across the NER corridor prototype demonstration.
          </span>
        </div>

      </div>
    </section>
  )
}
