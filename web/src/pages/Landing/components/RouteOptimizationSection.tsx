import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Route as RouteIcon, Award, Navigation, Clock, ShieldAlert,
  CheckCircle2, ArrowRight, Layers, Sparkles, AlertTriangle
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
    color: 'border-rose-500/40 bg-rose-500/[0.04] text-rose-400',
    riskColor: 'text-rose-400',
    barColor: 'bg-rose-500',
    status: 'Blockade Impending at Km 42',
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
    color: 'border-rose-500/40 bg-rose-500/[0.04] text-rose-400',
    riskColor: 'text-rose-400',
    barColor: 'bg-rose-500',
    status: 'Flooded Culvert & 28° Steep Slope',
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
    color: 'border-emerald-500/60 bg-emerald-500/[0.08] text-emerald-400 ring-1 ring-emerald-500/40',
    riskColor: 'text-emerald-400',
    barColor: 'bg-emerald-500',
    status: 'Clear All-Weather 40T Paved Bypass',
    isAI: true,
  },
]

export function RouteOptimizationSection() {
  const navigate = useNavigate()
  const [selectedRoute, setSelectedRoute] = useState('route-c')

  const active = ROUTES.find((r) => r.id === selectedRoute) ?? ROUTES[2]

  return (
    <section id="solutions" className="py-16 md:py-24 bg-[#0A101D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <RouteIcon className="h-3.5 w-3.5" />
            <span>AI MULTI-MODAL ROUTING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            The Fastest Route Isn&apos;t Always the Safest.
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Terrain-aware optimization prioritizes delivery safety, road slope limits, and structural bridge capacities
            over raw straight-line speed.
          </p>
        </div>

        {/* Corridor Context Bar */}
        <div className="app-card p-4 bg-[#0D1626] border border-white/10 rounded-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs text-text-muted">Origin ➔ Destination Corridor</div>
              <div className="text-sm font-bold text-white">Guwahati Sector HQ ➔ Itanagar District Hospital</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning" className="text-xs font-semibold">
              Cargo: Essential Medical Supplies & Vaccines
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
                'rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative',
                r.color,
                selectedRoute === r.id ? 'shadow-2xl scale-[1.02]' : 'opacity-85 hover:opacity-100'
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{r.name}</span>
                  {r.isAI ? (
                    <Badge variant="success" className="text-[10px] font-bold flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      AI PICK
                    </Badge>
                  ) : (
                    <span className="text-2xs text-text-muted">{r.tag}</span>
                  )}
                </div>

                {/* 3 Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-surface-2/90 border border-white/5 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-text-muted block">Distance</span>
                    <strong className="text-white text-xs">{r.distance}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block">ETA</span>
                    <strong className="text-white text-xs">{r.duration}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted block">Risk</span>
                    <strong className={cn('text-xs', r.riskColor)}>{r.risk}%</strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-2xs">
                    <span className="text-text-muted">Geotechnical Vulnerability</span>
                    <span className={cn('font-bold', r.riskColor)}>{r.severity}</span>
                  </div>
                  <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div className={cn('h-full', r.barColor)} style={{ width: `${r.risk}%` }} />
                  </div>
                </div>

                <p className="text-2xs text-text-muted">{r.status}</p>
              </div>

              {r.isAI && (
                <div className="pt-3 border-t border-white/10 space-y-1.5 text-xs text-text font-medium">
                  <div className="text-emerald-400 flex items-center gap-1 text-2xs font-bold uppercase tracking-wider">
                    <Sparkles className="h-3 w-3" /> AI Decision Rationale
                  </div>
                  <div className="text-[11px] text-text-muted space-y-1">
                    <div>✓ Avoids 2 landslide-prone hill cuts</div>
                    <div>✓ Avoids flooded Kaziranga culvert</div>
                    <div>✓ Confirmed 40T reinforced bridgehead</div>
                    <div>✓ Prioritizes medical temperature control</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={() => navigate('/routes')}
            className="h-11 px-6 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20"
          >
            <span>Try Multi-Modal Route Intelligence</span>
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>

      </div>
    </section>
  )
}
