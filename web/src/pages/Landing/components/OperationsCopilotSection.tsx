import { useState } from 'react'
import {
  Sparkles, Cpu, MessageSquare, CheckCircle2, ShieldAlert,
  ArrowRight, Layers, HelpCircle, Terminal
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

const QUERIES = [
  {
    q: '“What are today’s biggest logistics risks?”',
    a: 'NH-415 in East Siang (78% landslide risk) and NH-37 Kaziranga lowlands (62% flood risk). Recommend rerouting 12 inbound convoys via Route C North Bank.',
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
    <section className="py-16 md:py-24 bg-[#0A101D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>GEO-SPATIAL COPILOT AGENT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Ask Your Logistics Network Anything.
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            A domain-tuned operations assistant that speaks geotechnical and supply chain terminology,
            explaining every risk prediction and calculating immediate mitigation protocols.
          </p>
        </div>

        {/* 2-Column AI Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Interactive Query Chips */}
          <div className="lg:col-span-6 space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider text-[11px] block mb-2">
              Select an Operational Intelligence Query
            </span>
            {QUERIES.map((item, idx) => {
              const isSelected = selectedIdx === idx
              return (
                <div
                  key={item.q}
                  onClick={() => setSelectedIdx(idx)}
                  className={cn(
                    'p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3',
                    isSelected
                      ? 'bg-[#0D1626] border-primary/60 shadow-lg shadow-primary/5 text-white'
                      : 'bg-surface-2/40 border-white/5 hover:border-white/20 text-text-muted'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MessageSquare className={cn('h-4 w-4 flex-shrink-0', isSelected ? 'text-primary' : 'text-text-dim')} />
                    <span className="text-xs font-semibold truncate">{item.q}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-text-dim flex-shrink-0">
                    {item.tag}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Right: Terminal Response Window */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border border-primary/30 bg-[#070C16] p-5 sm:p-6 shadow-2xl space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                    <Cpu className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-white">NERA Copilot Intelligence Console</span>
                </div>
                <Badge variant="outline" className="text-2xs text-primary border-primary/30">
                  Tool Execution Ready
                </Badge>
              </div>

              {/* Chat Turn */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-surface-2 text-xs font-medium text-white">
                  {QUERIES[selectedIdx].q}
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-xs text-text leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 text-primary text-2xs font-bold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" /> Copilot Response
                  </div>
                  <p className="text-white text-xs">{QUERIES[selectedIdx].a}</p>
                </div>
              </div>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center text-2xs text-text-muted">
                <div className="p-2 rounded-lg bg-surface-2">
                  <strong className="text-white block text-xs mb-0.5">Context-Aware</strong>
                  Understands live map state
                </div>
                <div className="p-2 rounded-lg bg-surface-2">
                  <strong className="text-white block text-xs mb-0.5">Explainable</strong>
                  XGBoost feature tracing
                </div>
                <div className="p-2 rounded-lg bg-surface-2">
                  <strong className="text-white block text-xs mb-0.5">Action-Oriented</strong>
                  Prepares 1-click dispatches
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
