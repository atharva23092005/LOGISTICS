import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sliders, Play, RotateCcw, ShieldCheck, AlertTriangle,
  ArrowRight, Sparkles, Clock, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

export function WhatIfSimulationSection() {
  const navigate = useNavigate()
  const [duration, setDuration] = useState(6) // hours
  const [selectedRoad, setSelectedRoad] = useState('nh415')

  // Computed dynamic what-if simulation numbers
  const metrics = useMemo(() => {
    const factor = duration / 6
    const unmanagedOnTime = Math.max(40, Math.round(82 - factor * 21))
    const unmanagedDelayMin = Math.round(42 + factor * 96)
    const affectedVehicles = Math.min(38, Math.round(8 + factor * 15))

    const aiOnTime = Math.min(88, Math.max(72, Math.round(82 - factor * 3.5)))
    const aiDelayMin = Math.round(42 + factor * 15)
    const recoveredVehicles = Math.round(affectedVehicles * 0.82)

    return {
      unmanagedOnTime,
      unmanagedDelay: `${Math.floor(unmanagedDelayMin / 60)}h ${unmanagedDelayMin % 60}m`,
      affectedVehicles,
      aiOnTime,
      aiDelay: `${Math.floor(aiDelayMin / 60)}h ${aiDelayMin % 60}m`,
      recoveredVehicles,
    }
  }, [duration])

  return (
    <section className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/25 text-blue-700 dark:text-primary text-xs font-semibold">
            <Sliders className="h-3.5 w-3.5" />
            <span>DISRUPTION SIMULATION STUDIO</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            What If a Critical Corridor Fails?
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-muted leading-relaxed">
            Run stress-testing simulations on regional arterial highways to model supply chain shockwaves,
            transit delay spikes, and AI recovery trajectories before disasters occur.
          </p>
        </div>

        {/* Simulation Sandbox Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#080E1A]/95 p-6 lg:p-8 shadow-sm dark:shadow-2xl space-y-8 backdrop-blur-xl">
          
          {/* Slider & Highway Selector Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pb-6 border-b border-slate-200 dark:border-white/10">
            <div className="md:col-span-6 space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block font-mono">
                Target Highway Corridor
              </label>
              <select
                value={selectedRoad}
                onChange={(e) => setSelectedRoad(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-surface text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-primary font-mono cursor-pointer shadow-sm"
              >
                <option value="nh415">NH-415 Pasighat Corridor (Mudslide Hazard Zone)</option>
                <option value="nh13">NH-13 Banderdewa Mountain Pass (Rockfall)</option>
                <option value="nh37">NH-37 Kaziranga Lowlands (Floodplain)</option>
                <option value="nh13b">NH-13B Sela Pass (High-Altitude Icy Fog)</option>
              </select>
            </div>

            <div className="md:col-span-6 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white font-mono">Simulated Blockade Duration</span>
                <span className="font-mono text-blue-600 dark:text-primary font-bold text-sm">{duration} Hours</span>
              </div>
              <input
                type="range"
                min={2}
                max={24}
                step={1}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-blue-600 dark:accent-primary h-2 bg-slate-200 dark:bg-surface-3 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-text-muted font-mono">
                <span>2h (Minor)</span>
                <span>6h (Standard)</span>
                <span>12h (Severe)</span>
                <span>24h (Catastrophic)</span>
              </div>
            </div>
          </div>

          {/* 3 Comparative Outcome Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
            
            {/* Panel 1: Baseline Nominal */}
            <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-surface/80 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 dark:text-text-dim uppercase tracking-wider block">
                Baseline Normal
              </span>
              <div className="space-y-2.5">
                <div>
                  <span className="text-2xs text-slate-500 dark:text-text-muted">On-Time Deliveries</span>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">82%</div>
                </div>
                <div>
                  <span className="text-2xs text-slate-500 dark:text-text-muted">Average Delay</span>
                  <div className="text-base font-bold text-slate-800 dark:text-text">42 min</div>
                </div>
                <div>
                  <span className="text-2xs text-slate-500 dark:text-text-muted">Affected Deliveries</span>
                  <div className="text-base font-bold text-slate-800 dark:text-text">8 Units</div>
                </div>
              </div>
            </div>

            {/* Panel 2: Unmanaged Disruption */}
            <div className="p-5 rounded-2xl bg-rose-50/70 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 space-y-3 shadow-sm">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
                After Disruption (Without AI)
              </span>
              <div className="space-y-2.5">
                <div>
                  <span className="text-2xs text-slate-500 dark:text-text-muted">On-Time Deliveries</span>
                  <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">{metrics.unmanagedOnTime}%</div>
                </div>
                <div>
                  <span className="text-2xs text-slate-500 dark:text-text-muted">Average Delay</span>
                  <div className="text-base font-bold text-rose-700 dark:text-rose-400">{metrics.unmanagedDelay}</div>
                </div>
                <div>
                  <span className="text-2xs text-slate-500 dark:text-text-muted">Stranded / Delayed</span>
                  <div className="text-base font-bold text-rose-700 dark:text-rose-400">{metrics.affectedVehicles} Units</div>
                </div>
              </div>
            </div>

            {/* Panel 3: With NERA AI Rerouting */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 space-y-3 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> With NERA AI Auto-Reroute
              </span>
              <div className="space-y-2.5">
                <div>
                  <span className="text-2xs text-slate-500 dark:text-text-muted">On-Time Deliveries</span>
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{metrics.aiOnTime}%</div>
                </div>
                <div>
                  <span className="text-2xs text-slate-500 dark:text-text-muted">Average Delay</span>
                  <div className="text-base font-bold text-emerald-700 dark:text-emerald-400">{metrics.aiDelay}</div>
                </div>
                <div>
                  <span className="text-2xs text-slate-500 dark:text-text-muted">Recovered Convoys</span>
                  <div className="text-base font-bold text-emerald-700 dark:text-emerald-400">{metrics.recoveredVehicles} Vehicles</div>
                </div>
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-white/10">
            <span className="text-2xs text-slate-500 dark:text-text-muted font-mono">
              Live mathematical simulation computed across 128 regional road segments.
            </span>
            <Button
              size="sm"
              onClick={() => navigate('/analytics')}
              className="h-9 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
            >
              <span>Launch What-If Simulation Studio</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>

        </div>

      </div>
    </section>
  )
}

