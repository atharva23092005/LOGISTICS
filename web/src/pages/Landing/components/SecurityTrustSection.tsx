import {
  ShieldCheck, Lock, FileText, UserCheck, WifiOff,
  GitBranch, Database, Shield
} from 'lucide-react'

const PILLARS = [
  {
    title: 'Role-Based Access Control (RBAC)',
    desc: 'Scoped administrative permissions separating HQ Command, Dispatchers, Field Officers, and Geotechnical Analysts.',
    icon: UserCheck,
  },
  {
    title: 'Human-in-the-Loop AI Guardrails',
    desc: 'Automated ML recommendations require authorized human confirmation before public highway broadcast.',
    icon: ShieldCheck,
  },
  {
    title: 'Immutable Tactical Audit Logs',
    desc: 'Every route re-allocation, incident status change, and operator decision is cryptographically timestamped.',
    icon: FileText,
  },
  {
    title: 'Offline-First Resilience',
    desc: 'Field client terminals operate autonomously in zero-signal mountain passes with encrypted local storage.',
    icon: WifiOff,
  },
  {
    title: 'Data Provenance & Lineage',
    desc: 'Complete lineage tracking from raw IMD radar and ISRO raster DEM pixels directly to risk scoring outputs.',
    icon: GitBranch,
  },
  {
    title: 'Encrypted Telemetry Pipelines',
    desc: 'End-to-end TLS encryption across all vehicle GPS pings, MQTT socket brokers, and REST endpoints.',
    icon: Lock,
  },
]

export function SecurityTrustSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" />
            <span>ENTERPRISE GOVERNANCE & SECURITY</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Built for Mission-Critical Operations.
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-muted leading-relaxed">
            Engineered to meet the stringent security, audibility, and privacy standards required by government agencies
            and disaster management authorities.
          </p>
        </div>

        {/* 6 Security Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PILLARS.map((p) => {
            const Icon = p.icon
            return (
              <div
                key={p.title}
                className="p-5 bg-white dark:bg-surface/80 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all rounded-2xl space-y-3 shadow-sm hover:shadow-md"
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{p.title}</h3>
                <p className="text-xs text-slate-600 dark:text-text-muted leading-relaxed">{p.desc}</p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

