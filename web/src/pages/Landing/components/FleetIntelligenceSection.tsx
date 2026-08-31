import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Truck, ShieldAlert, Navigation, Clock, Gauge, ArrowRight,
  AlertTriangle, CheckCircle2, RotateCw, Sparkles, MapPin, Radio, Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

export function FleetIntelligenceSection() {
  const navigate = useNavigate()
  const [detourActive, setDetourActive] = useState(false)

  return (
    <section className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/25 text-blue-700 dark:text-primary text-xs font-semibold">
            <Truck className="h-3.5 w-3.5" />
            <span>LIVE CONVOY TELEMETRY & AUTO-REROUTE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Know Where Every Critical Vehicle Is.
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-muted leading-relaxed">
            Continuous vehicle tracking with live GPS, driver communications, cargo temperature monitoring,
            and instant automated detour dispatch when highway blockades occur.
          </p>
        </div>

        {/* Fleet Simulation Card Wrapper */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#080E1A]/95 p-6 lg:p-8 shadow-sm dark:shadow-2xl space-y-6 backdrop-blur-xl">
          
          {/* Top Controls: Interactive Blockade Simulator */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block font-mono">
                Interactive Incident Simulator
              </span>
              <p className="text-xs text-slate-500 dark:text-text-muted">
                Trigger a simulated landslide hazard on NH-415 to observe autonomous convoy rerouting in real time.
              </p>
            </div>

            <Button
              size="sm"
              variant={detourActive ? 'default' : 'outline'}
              onClick={() => setDetourActive(!detourActive)}
              className={cn(
                'h-9 text-xs font-bold transition-all shadow-sm',
                detourActive
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
              )}
            >
              <RotateCw className={cn('h-3.5 w-3.5 mr-1.5', detourActive ? 'animate-spin-slow' : '')} />
              {detourActive ? 'Simulated: AI Detour Active' : 'Simulate Landslide Blockade'}
            </Button>
          </div>

          {/* Convoy Telemetry Dossier */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Vehicle Dossier Card */}
            <div className="lg:col-span-5 p-5 bg-slate-50/80 dark:bg-surface/80 border border-slate-200 dark:border-white/10 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-primary/15 border border-blue-200 dark:border-primary/30 text-blue-600 dark:text-primary flex items-center justify-center font-mono font-bold text-xs">
                    <Truck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono">AS-09-4821</h3>
                    <div className="text-2xs text-slate-500 dark:text-text-muted">Essential Medicines • 8.5 Tonne</div>
                  </div>
                </div>

                <Badge
                  variant={detourActive ? 'success' : 'warning'}
                  className="text-2xs font-bold font-mono py-0.5 px-2"
                >
                  {detourActive ? 'REROUTED SAFE' : 'HAZARD INTERSECT'}
                </Badge>
              </div>

              {/* Waypoints */}
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-text-muted pt-1">
                <span className="text-slate-900 dark:text-white font-semibold">Guwahati Sector HQ</span>
                <span className="text-slate-400 dark:text-text-dim">➔</span>
                <span className="text-slate-900 dark:text-white font-semibold">Itanagar Hospital</span>
              </div>

              {/* Progress Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-2xs font-mono">
                  <span className="text-slate-500 dark:text-text-muted">Corridor Progress</span>
                  <span className="text-slate-900 dark:text-white font-bold">{detourActive ? '72% Completed' : '67% Completed'}</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-surface-3 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full transition-all duration-700', detourActive ? 'bg-emerald-500 w-[72%]' : 'bg-blue-600 dark:bg-primary w-[67%]')}
                  />
                </div>
              </div>

              {/* 3 Telemetry Tiles */}
              <div className="grid grid-cols-3 gap-2 py-2.5 px-2.5 rounded-xl bg-white dark:bg-surface-2/90 border border-slate-200/80 dark:border-white/5 text-center text-xs font-mono shadow-sm">
                <div>
                  <span className="text-[9px] text-slate-500 dark:text-text-muted block">Speed</span>
                  <strong className="text-slate-900 dark:text-white text-xs">{detourActive ? '54 km/h' : '42 km/h'}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 dark:text-text-muted block">ETA</span>
                  <strong className={cn('text-xs', detourActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-warning')}>
                    {detourActive ? '5:10 PM' : '4:35 PM (Delay)'}
                  </strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 dark:text-text-muted block">Status</span>
                  <strong className={cn('text-xs', detourActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400')}>
                    {detourActive ? 'Optimal' : 'Hazard Ahead'}
                  </strong>
                </div>
              </div>

              {/* Dynamic Warning / Detour Banner */}
              <div
                className={cn(
                  'p-3.5 rounded-xl border text-xs leading-relaxed transition-all shadow-sm',
                  detourActive
                    ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                    : 'border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300'
                )}
              >
                {detourActive ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Auto-detoured via Route C North Bank bypass. Zero vehicle downtime or bottleneck delay.</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>NH-415 Km 42 mudslide alert. Inbound convoy trajectory intersects hazard in 38m.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Telemetry Corridor Summary */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-surface/80 border border-slate-200 dark:border-white/10 space-y-1 shadow-sm">
                  <span className="text-slate-500 dark:text-text-muted text-2xs block">Active NER Convoys</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">47 Units</div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold font-mono">100% Monitored</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-surface/80 border border-slate-200 dark:border-white/10 space-y-1 shadow-sm">
                  <span className="text-slate-500 dark:text-text-muted text-2xs block">Fleet On-Time Rate</span>
                  <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">91.4%</div>
                  <span className="text-[10px] text-slate-400 dark:text-text-dim">Disruptions bypassed</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-surface/80 border border-slate-200 dark:border-white/10 space-y-1 col-span-2 sm:col-span-1 shadow-sm">
                  <span className="text-slate-500 dark:text-text-muted text-2xs block">Emergency SOS Alarms</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">0 Active</div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold font-mono">All units nominal</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 dark:bg-surface/80 border border-slate-200 dark:border-white/10 rounded-xl space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-primary" /> Autonomous Network Recalibration
                  </span>
                  <Badge variant="outline" className="text-2xs text-blue-700 dark:text-primary border-blue-300 dark:border-primary/30 font-mono">Active</Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-text-muted leading-relaxed">
                  NERA continuously analyzes GPS pings against real-time GSI landslide polygons and IMD rain radars,
                  instantly calculating alternate routes and dispatching alerts directly to driver telematics terminals.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  size="sm"
                  onClick={() => navigate('/fleet')}
                  className="h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  <span>Open Full Fleet Operations</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

