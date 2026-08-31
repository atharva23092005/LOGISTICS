import { Eye, Cpu, WifiOff, Route, ShieldCheck, Activity } from 'lucide-react'

const PILLARS = [
  {
    icon: Eye,
    title: 'Real-Time Visibility',
    desc: 'Highways • Convoys • Field Incidents',
    color: 'text-blue-600 dark:text-primary',
    bg: 'bg-blue-50 dark:bg-primary/10 border-blue-200 dark:border-primary/20',
  },
  {
    icon: Cpu,
    title: 'Predictive Geo-AI',
    desc: 'XGBoost geotechnical disruption forecast',
    color: 'text-sky-600 dark:text-cyan-400',
    bg: 'bg-sky-50 dark:bg-cyan-500/10 border-sky-200 dark:border-cyan-500/20',
  },
  {
    icon: WifiOff,
    title: 'Offline Field Ops',
    desc: 'IndexedDB PWA sync without cell towers',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  },
  {
    icon: Route,
    title: 'Multi-Modal Routing',
    desc: 'Terrain & bridge tonnage optimization',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  },
]

const STATS = [
  { value: '47+', label: 'Vehicles Monitored', sub: 'Live active GPS telemetry', badge: 'Active Fleet' },
  { value: '128', label: 'Road Segments', sub: 'Mapped with DEM slope layers', badge: 'GIS Grid' },
  { value: '24', label: 'Districts Monitored', sub: 'Across 8 North East States', badge: '8 States' },
  { value: '94.2%', label: 'Disruption Avoidance', sub: 'Automated AI detour protocol', badge: 'Auto-Reroute' },
]

export function ImpactMetricsStrip() {
  return (
    <section className="relative z-20 border-y border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-[#080D18]/90 backdrop-blur-xl py-6">
      {/* Background Dot Texture */}
      <div className="absolute inset-0 bg-dot-matrix opacity-30 dark:opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* ── 4 Feature Value Props ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
          {PILLARS.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.title} className="flex items-center gap-3.5 p-2 rounded-xl bg-white dark:bg-surface/40 border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 transition-all shadow-sm">
                <div className={`h-10 w-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${p.bg}`}>
                  <Icon className={`h-5 w-5 ${p.color}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">{p.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-text-muted">{p.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── 4 Key Prototype Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          {STATS.map((s) => (
            <div key={s.label} className="p-4 rounded-xl bg-white dark:bg-surface/50 border border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-primary/40 transition-all space-y-1.5 text-center group shadow-sm">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 dark:bg-white/5 text-blue-700 dark:text-primary border border-blue-200 dark:border-primary/20">
                  {s.badge}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-mono group-hover:text-blue-600 dark:group-hover:text-primary transition-colors">
                {s.value}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-text tracking-tight">{s.label}</div>
              <div className="text-[10px] text-slate-400 dark:text-text-dim">{s.sub}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

