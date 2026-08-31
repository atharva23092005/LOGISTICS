import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Route as RouteIcon, Award, Navigation, Clock, ShieldAlert,
  CheckCircle2, ArrowRight, Layers, Sparkles, AlertTriangle, ShieldCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

const ROUTES = [
  {
    id: 'route-a',
    name: 'Route A — NH-415 Direct',
    tag: 'Fastest Transit',
    distance: '245 km',
    duration: '4h 30m',
    risk: 72,
    severity: 'High Risk',
    color: 'border-rose-200 dark:border-rose-500/40 bg-rose-50/50 dark:bg-[#120B10]/80 text-rose-800 dark:text-rose-400',
    riskColor: 'text-rose-700 dark:text-rose-400',
    barColor: 'bg-rose-500',
    status: 'Blockade Impending at Km 42 (78% ML Landslide Probability)',
    isAI: false,
  },
  {
    id: 'route-b',
    name: 'Route B — Old Hill Cut',
    tag: 'Shortest Distance',
    distance: '210 km',
    duration: '5h 05m',
    risk: 81,
    severity: 'Critical Risk',
    color: 'border-rose-200 dark:border-rose-500/40 bg-rose-50/50 dark:bg-[#120B10]/80 text-rose-800 dark:text-rose-400',
    riskColor: 'text-rose-700 dark:text-rose-400',
    barColor: 'bg-rose-500',
    status: 'Flooded Culvert & 28° Steep Slope Incline',
    isAI: false,
  },
  {
    id: 'route-c',
    name: 'Route C — North Bank Safe Bypass',
    tag: 'AI RECOMMENDED',
    distance: '280 km',
    duration: '5h 45m',
    risk: 28,
    severity: 'Lowest Risk (Safe)',
    color: 'border-emerald-300 dark:border-emerald-500/60 bg-emerald-50/60 dark:bg-[#0A1A18]/85 text-emerald-800 dark:text-emerald-400 ring-1 ring-emerald-400/40 dark:ring-emerald-500/40 shadow-sm dark:shadow-xl dark:shadow-emerald-500/5',
    riskColor: 'text-emerald-700 dark:text-emerald-400',
    barColor: 'bg-emerald-500',
    status: 'Clear All-Weather 40T Certified Paved Bypass',
    isAI: true,
  },
]

export function RouteOptimizationSection() {
  const navigate = useNavigate()
  const [selectedRoute, setSelectedRoute] = useState('route-c')

  return (
    <section id="solutions" className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <RouteIcon className="h-3.5 w-3.5" />
            <span>AI MULTI-MODAL ROUTING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            The Fastest Route Isn&apos;t Always the Safest.
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-muted leading-relaxed">
            Terrain-aware optimization prioritizes delivery safety, road slope limits, and structural bridge capacities
            over raw straight-line speed.
          </p>
        </div>

        {/* Corridor Context Bar */}
        <div className="p-4 bg-white dark:bg-surface/80 border border-slate-200 dark:border-white/10 rounded-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-primary/15 border border-blue-200 dark:border-primary/30 text-blue-600 dark:text-primary flex items-center justify-center">
              <Navigation className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-text-muted">Origin ➔ Destination Arterial Corridor</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Guwahati Sector HQ ➔ Itanagar District Hospital</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning" className="text-xs font-semibold py-1 px-2.5">
              Priority Cargo: Essential Medical Supplies & Vaccines
            </Badge>
          </div>
        </div>

        {/* 3 Routes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {ROUTES.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedRoute(r.id)}
              className={cn(
                'rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative shadow-sm',
                r.color,
                selectedRoute === r.id ? 'shadow-md scale-[1.02]' : 'opacity-90 hover:opacity-100'
              )}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">{r.name}</span>
                  {r.isAI ? (
                    <Badge variant="success" className="text-[10px] font-bold flex items-center gap-1 py-0.5 px-2">
                      <Award className="h-3 w-3" />
                      AI PICK
                    </Badge>
                  ) : (
                    <span className="text-2xs text-slate-500 dark:text-text-muted font-mono">{r.tag}</span>
                  )}
                </div>

                {/* 3 Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-white/90 dark:bg-surface-2/90 border border-slate-200/80 dark:border-white/5 text-center text-xs font-mono shadow-sm">
                  <div>
                    <span className="text-[9px] text-slate-500 dark:text-text-muted block">Distance</span>
                    <strong className="text-slate-900 dark:text-white text-xs">{r.distance}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 dark:text-text-muted block">ETA</span>
                    <strong className="text-slate-900 dark:text-white text-xs">{r.duration}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 dark:text-text-muted block">Risk</span>
                    <strong className={cn('text-xs font-bold', r.riskColor)}>{r.risk}%</strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-2xs">
                    <span className="text-slate-500 dark:text-text-muted">Geotechnical Vulnerability</span>
                    <span className={cn('font-bold font-mono', r.riskColor)}>{r.severity}</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 dark:bg-surface-3 rounded-full overflow-hidden">
                    <div className={cn('h-full', r.barColor)} style={{ width: `${r.risk}%` }} />
                  </div>
                </div>

                <p className="text-2xs text-slate-600 dark:text-text-muted leading-relaxed">{r.status}</p>
              </div>

              {r.isAI && (
                <div className="pt-3 border-t border-emerald-200 dark:border-emerald-500/20 space-y-2 text-xs text-slate-800 dark:text-text font-medium">
                  <div className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-wider font-mono">
                    <Sparkles className="h-3.5 w-3.5" /> AI Decision Rationale
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-text-muted space-y-1">
                    <div>✓ Avoids 2 active landslide-prone hill cuts</div>
                    <div>✓ Avoids flooded Kaziranga culvert overflow</div>
                    <div>✓ Confirmed 40T reinforced bridgehead capacity</div>
                    <div>✓ Prioritizes vaccine cold-chain temperature limits</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-10 text-center">
          <Button
            size="lg"
            onClick={() => navigate('/routes')}
            className="h-11 px-7 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"
          >
            <span>Try Multi-Modal Route Intelligence</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>

      </div>
    </section>
  )
}

