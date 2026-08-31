import { useState } from 'react'
import {
  Sparkles, Cpu, MessageSquare, CheckCircle2, ShieldAlert,
  ArrowRight, Layers, HelpCircle, Terminal, Bot
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

const QUERIES = [
  {
    q: '“What are today’s biggest logistics risks?”',
    a: 'NH-415 in East Siang (78% landslide risk) and NH-37 Kaziranga lowlands (62% flood risk). Recommend rerouting 12 inbound convoys via Route C North Bank bypass.',
    tag: 'Macro Risk Assessment',
  },
  {
    q: '“Which vehicles are affected by NH-415?”',
    a: '7 vehicles currently on trajectory: AS-09-4821 (Medical), MED-14 (Vaccines), and POL-08 (Fuel). All 7 have prepared auto-detours through Tezpur.',
    tag: 'Fleet Trajectory Intersect',
  },
  {
    q: '“Why is Route A considered high risk?”',
    a: 'Route A crosses a 24.5° slope gradient with 88% subsoil saturation and 84 mm/h monsoonal rainfall. Historical GSI landslide recurrence probability is 87%.',
    tag: 'Explainable AI Diagnostic',
  },
  {
    q: '“What happens if NH-415 is blocked for 6 hours?”',
    a: 'Simulated impact: On-time delivery drops from 91.4% to 61% without AI. With NERA auto-reroute, on-time delivery recovers to 79%, saving 163 fleet idle hours.',
    tag: 'What-If Simulation',
  },
  {
    q: '“Which deliveries should be prioritized first?”',
    a: 'Emergency Tier 1: 3,000 vaccine vials aboard AS-09-4821 (temp threshold <6h). Priority 2: 15 tonnes food rations for Pasighat relief shelters.',
    tag: 'Triage Prioritization',
  },
  {
    q: '“Show all high-risk roads in Arunachal Pradesh.”',
    a: 'Active high-risk sectors: NH-415 (Km 42 Pasighat), NH-13 (Banderdewa Ascent), and NH-13B (Sela Pass elevation hazard). Total 3 segments at Risk Level >70%.',
    tag: 'Geographic Search',
  },
]

export function OperationsCopilotSection() {
  const [selectedIdx, setSelectedIdx] = useState(0)

  return (
    <section className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/25 text-blue-700 dark:text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>GEO-SPATIAL COPILOT AGENT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Ask Your Logistics Network Anything.
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-muted leading-relaxed">
            A domain-tuned operations assistant that speaks geotechnical and supply chain terminology,
            explaining every risk prediction and calculating immediate mitigation protocols.
          </p>
        </div>

        {/* 2-Column AI Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Query Chips */}
          <div className="lg:col-span-6 space-y-2.5">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block mb-2 font-mono">
              Operational Intelligence Queries (Select to Query)
            </span>
            {QUERIES.map((item, idx) => {
              const isSelected = selectedIdx === idx
              return (
                <div
                  key={item.q}
                  onClick={() => setSelectedIdx(idx)}
                  className={cn(
                    'p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-sm',
                    isSelected
                      ? 'bg-blue-50 dark:bg-surface-2/95 border-blue-500 dark:border-primary ring-1 ring-blue-500/50 dark:ring-primary/50 text-slate-900 dark:text-white scale-[1.01]'
                      : 'bg-white dark:bg-surface/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 text-slate-700 dark:text-text-muted'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare className={cn('h-4 w-4 flex-shrink-0', isSelected ? 'text-blue-600 dark:text-primary' : 'text-slate-400 dark:text-text-dim')} />
                    <span className="text-xs font-semibold truncate">{item.q}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-text-dim flex-shrink-0 border border-slate-200 dark:border-white/5">
                    {item.tag}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Right: Terminal Response Window */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-primary/30 bg-white dark:bg-[#080E1A]/95 p-5 sm:p-6 shadow-sm dark:shadow-2xl space-y-4 backdrop-blur-xl">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-blue-50 dark:bg-primary/20 text-blue-600 dark:text-primary flex items-center justify-center border border-blue-200 dark:border-primary/30">
                    <Cpu className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">NERA Copilot Intelligence Console</span>
                </div>
                <Badge variant="outline" className="text-2xs text-blue-700 dark:text-primary border-blue-300 dark:border-primary/30 font-mono">
                  Execution Ready
                </Badge>
              </div>

              {/* Chat Turn */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-surface-2 text-xs font-semibold text-slate-800 dark:text-white border border-slate-200 dark:border-white/5 shadow-sm">
                  {QUERIES[selectedIdx].q}
                </div>

                <div className="p-4 rounded-xl bg-blue-50/80 dark:bg-primary/10 border border-blue-200 dark:border-primary/25 text-xs text-slate-800 dark:text-text leading-relaxed space-y-2 shadow-sm">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-primary text-2xs font-bold uppercase tracking-wider font-mono">
                    <Sparkles className="h-3.5 w-3.5" /> Copilot Response
                  </div>
                  <p className="text-slate-900 dark:text-white text-xs leading-relaxed">{QUERIES[selectedIdx].a}</p>
                </div>
              </div>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-white/10 text-center text-2xs text-slate-500 dark:text-text-muted font-mono">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-surface/70 border border-slate-200 dark:border-white/5">
                  <strong className="text-slate-900 dark:text-white block text-xs mb-0.5">Context-Aware</strong>
                  Live GIS telemetry
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-surface/70 border border-slate-200 dark:border-white/5">
                  <strong className="text-slate-900 dark:text-white block text-xs mb-0.5">Explainable</strong>
                  XGBoost feature trees
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-surface/70 border border-slate-200 dark:border-white/5">
                  <strong className="text-slate-900 dark:text-white block text-xs mb-0.5">Actionable</strong>
                  1-click dispatches
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

