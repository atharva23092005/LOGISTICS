import { ArrowDown, XCircle, CheckCircle2, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react'

const TRADITIONAL_STEPS = [
  'Incident occurs on hill corridor',
  'Road completely blocked by mudslide',
  'Delayed info reaches control room (hours later)',
  'Vehicles get stranded in hazard zone',
  'Manual phone-based rerouting attempt',
  'Critical supply chain breakdown',
]

const NERA_STEPS = [
  'Weather (IMD) + Terrain DEM + Field telemetry ingested',
  'XGBoost ML engine predicts 78% landslide risk',
  'Proactive hazard alert generated automatically',
  'Affected inbound convoys identified instantaneously',
  'Terrain-safe alternate corridors (Route C) calculated',
  'Automated priority dispatch sent to drivers & command',
  'Offline field officer confirmation on clearance',
]

export function ReactiveVsPredictive() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-[#080D18] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>OPERATIONAL PARADIGM SHIFT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Move From Reacting to Disruptions to Anticipating Them.
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            See how NERA transforms standard emergency logistics from slow, reactive crisis mitigation into a predictive, self-healing supply network.
          </p>
        </div>

        {/* 2-Column Comparison Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* ── LEFT: TRADITIONAL REACTIVE RESPONSE ── */}
          <div className="rounded-2xl border border-rose-500/20 bg-[#120B10]/70 p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-rose-500/20">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
                    <XCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Traditional Response</h3>
                    <span className="text-[10px] text-rose-400 font-semibold">Reactive & Siloed</span>
                  </div>
                </div>
                <span className="text-2xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  Legacy Operations
                </span>
              </div>

              <div className="space-y-2 pt-2">
                {TRADITIONAL_STEPS.map((step, idx) => (
                  <div key={step} className="flex items-start gap-2.5 text-xs text-text-muted">
                    <div className="h-5 w-5 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="bg-surface/60 border border-white/5 p-2 rounded-lg flex-1">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <span className="text-xs font-bold text-rose-400">
                Outcome: 6+ Hours Average Cargo Delay & Supply Vulnerability
              </span>
            </div>
          </div>

          {/* ── RIGHT: NERA PREDICTIVE INTELLIGENCE ── */}
          <div className="rounded-2xl border border-primary/40 bg-[#091526]/80 p-5 sm:p-6 space-y-4 shadow-xl shadow-primary/5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-primary/30">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">NERA Intelligence</h3>
                    <span className="text-[10px] text-emerald-400 font-semibold">Predictive & Autonomous</span>
                  </div>
                </div>
                <span className="text-2xs px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 font-semibold">
                  AI-Powered Geo-Engine
                </span>
              </div>

              <div className="space-y-2 pt-2">
                {NERA_STEPS.map((step, idx) => (
                  <div key={step} className="flex items-start gap-2.5 text-xs text-text">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div className="bg-surface-2/90 border border-white/10 p-2 rounded-lg flex-1 font-medium">
                      {step}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
              <span className="text-xs font-bold text-emerald-400">
                Outcome: 94.2% Disruption Avoidance & Zero Stranded Medical Cargo
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
