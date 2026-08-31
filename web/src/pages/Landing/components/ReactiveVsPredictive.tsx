import { ArrowDown, XCircle, CheckCircle2, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react'

const TRADITIONAL_STEPS = [
  'Disaster occurs on remote mountain highway',
  'Road completely blocked by 200m landslide',
  'Delayed info reaches control room (4–6 hours later)',
  'Medical & food convoys get stranded in hazard zone',
  'Manual phone-based rerouting under zero signal',
  'Critical regional supply chain breakdown',
]

const NERA_STEPS = [
  'Multi-source ingestion: IMD radar + ISRO 0.5m DEM + GPS telemetry',
  'XGBoost ML engine predicts 78% landslide risk 6–12h ahead',
  'Autonomous hazard polygon broadcast to drivers & command center',
  'At-risk inbound convoys identified & notified instantaneously',
  'Terrain-safe multi-modal alternate corridors (Route C) calculated',
  'Automated priority dispatch executed for essential supplies',
  'Offline field officer confirmation on ground clearance via PWA',
]

export function ReactiveVsPredictive() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/25 text-blue-700 dark:text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>OPERATIONAL PARADIGM SHIFT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Move From Reacting to Disruptions to Anticipating Them.
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-muted leading-relaxed">
            See how NERA transforms standard emergency logistics from slow, reactive crisis mitigation into a predictive, self-healing supply network.
          </p>
        </div>

        {/* 2-Column Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* ── LEFT: TRADITIONAL REACTIVE RESPONSE ── */}
          <div className="rounded-2xl border border-rose-200 dark:border-rose-500/25 bg-rose-50/40 dark:bg-[#120B10]/80 p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-rose-200/80 dark:border-rose-500/20">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center">
                    <XCircle className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Traditional Response</h3>
                    <span className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold">Reactive & Siloed Manual Operations</span>
                  </div>
                </div>
                <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-500/25">
                  LEGACY
                </span>
              </div>

              <div className="space-y-2 pt-2">
                {TRADITIONAL_STEPS.map((step, idx) => (
                  <div key={step} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-text-muted">
                    <div className="h-5 w-5 rounded-full bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 border border-rose-200 dark:border-rose-500/20 font-mono">
                      {idx + 1}
                    </div>
                    <div className="bg-white dark:bg-surface/80 border border-rose-100 dark:border-white/5 p-2.5 rounded-xl flex-1 text-slate-700 dark:text-text-muted shadow-sm">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-100/60 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-center">
              <span className="text-xs font-bold text-rose-800 dark:text-rose-400">
                Outcome: 6+ Hours Average Delivery Delay & Critical Cargo Stranded
              </span>
            </div>
          </div>

          {/* ── RIGHT: NERA PREDICTIVE INTELLIGENCE ── */}
          <div className="rounded-2xl border border-blue-200 dark:border-primary/40 bg-blue-50/40 dark:bg-[#091526]/85 p-5 sm:p-6 space-y-4 shadow-sm dark:shadow-xl dark:shadow-primary/5 flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-blue-200/80 dark:border-primary/30">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-100 dark:bg-primary/20 text-blue-600 dark:text-primary border border-blue-200 dark:border-primary/40 flex items-center justify-center">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">NERA Intelligence Platform</h3>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Predictive & Autonomous Self-Healing</span>
                  </div>
                </div>
                <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-primary/20 text-blue-800 dark:text-primary border border-blue-200 dark:border-primary/30">
                  AI-POWERED
                </span>
              </div>

              <div className="space-y-2 pt-2">
                {NERA_STEPS.map((step, idx) => (
                  <div key={step} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-text">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 border border-emerald-200 dark:border-emerald-500/30 font-mono">
                      ✓
                    </div>
                    <div className="bg-white dark:bg-surface-2/95 border border-slate-200/80 dark:border-white/10 p-2.5 rounded-xl flex-1 font-medium text-slate-900 dark:text-white shadow-sm">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-100/60 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-center">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                Outcome: 94.2% Disruption Avoidance & Zero Stranded Critical Cargo
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

