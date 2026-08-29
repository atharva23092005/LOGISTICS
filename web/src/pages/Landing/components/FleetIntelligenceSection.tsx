import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Truck, ShieldAlert, Navigation, Clock, Gauge, ArrowRight,
  AlertTriangle, CheckCircle2, RotateCw, Sparkles, MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

export function FleetIntelligenceSection() {
  const navigate = useNavigate()
  const [detourActive, setDetourActive] = useState(false)

  return (
    <section className="py-16 md:py-24 bg-[#080D18] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Truck className="h-3.5 w-3.5" />
            <span>LIVE CONVOY TELEMETRY & AUTO-REROUTE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Know Where Every Critical Vehicle Is.
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Continuous vehicle tracking with live GPS, driver communications, cargo temperature monitoring,
            and instant automated detour dispatch when highway blockades occur.
          </p>
        </div>

        {/* Fleet Simulation Card Wrapper */}
        <div className="rounded-2xl border border-white/10 bg-[#0D1626] p-6 lg:p-8 shadow-2xl space-y-6">
          
          {/* Top Controls: Interactive Blockade Simulator */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider text-[11px] block">
                Simulate Dynamic Incident Response
              </span>
              <p className="text-xs text-text-muted">
                Trigger a live landslide alert on NH-415 to observe autonomous convoy rerouting.
              </p>
            </div>

            <Button
              size="sm"
              variant={detourActive ? 'default' : 'outline'}
              onClick={() => setDetourActive(!detourActive)}
              className={cn(
                'h-9 text-xs font-bold transition-all',
                detourActive ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'border-rose-500/40 text-rose-400 hover:bg-rose-500/10'
              )}
            >
              <RotateCw className="h-3.5 w-3.5 mr-1.5" />
              {detourActive ? 'Simulated: AI Detour Dispatched' : 'Simulate Landslide Blockade'}
            </Button>
          </div>

          {/* Convoy Telemetry Dossier */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Vehicle Dossier Card */}
            <div className="lg:col-span-5 app-card p-5 bg-surface-2 border border-white/10 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 text-primary flex items-center justify-center font-mono font-bold text-xs">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AS-09-4821</h3>
                    <div className="text-2xs text-text-muted">Essential Medicines • 8.5 Tonne</div>
                  </div>
                </div>

                <Badge
                  variant={detourActive ? 'success' : 'warning'}
                  className="text-2xs font-bold"
                >
                  {detourActive ? 'REROUTED SAFE' : 'AT RISK'}
                </Badge>
              </div>

              {/* Waypoints */}
              <div className="flex items-center gap-2 text-xs text-text-muted pt-1">
                <span className="text-white font-medium">Guwahati Sector</span>
                <span>➔</span>
                <span className="text-white font-medium">Itanagar Hospital</span>
              </div>

              {/* Progress Meter */}
              <div className="space-y-1">
                <div className="flex justify-between text-2xs">
                  <span className="text-text-muted">Corridor Progress</span>
                  <span className="font-mono text-white font-bold">67% Completed</span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[67%]" />
                </div>
              </div>

              {/* 3 Telemetry Tiles */}
              <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-surface-3/60 border border-white/5 text-center text-xs">
                <div>
                  <span className="text-[10px] text-text-muted block">Speed</span>
                  <strong className="text-white text-xs">{detourActive ? '54 km/h' : '42 km/h'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">ETA</span>
                  <strong className={cn('text-xs', detourActive ? 'text-emerald-400' : 'text-warning')}>
                    {detourActive ? '5:10 PM' : '4:35 PM (Delay)'}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Status</span>
                  <strong className={cn('text-xs', detourActive ? 'text-emerald-400' : 'text-rose-400')}>
                    {detourActive ? 'Optimal' : 'Hazard Ahead'}
                  </strong>
                </div>
              </div>

              {/* Dynamic Warning / Detour Banner */}
              <div
                className={cn(
                  'p-3 rounded-xl border text-xs leading-relaxed transition-all',
                  detourActive
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                )}
              >
                {detourActive ? (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Auto-detoured via Route C North Bank bypass. Zero vehicle downtime.</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                    <span>NH-415 Km 42 mudslide alert. Inbound convoy trajectory intersects hazard in 38m.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Telemetry Corridor Summary */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="app-card p-3 bg-surface-2 space-y-1">
                  <span className="text-text-muted text-2xs block">Active NER Convoys</span>
                  <div className="text-xl font-bold text-white">47 Units</div>
                  <span className="text-[10px] text-emerald-400 font-semibold">100% Monitored</span>
                </div>
                <div className="app-card p-3 bg-surface-2 space-y-1">
                  <span className="text-text-muted text-2xs block">Fleet On-Time Rate</span>
                  <div className="text-xl font-bold text-emerald-400">91.4%</div>
                  <span className="text-[10px] text-text-dim">Disruptions bypassed</span>
                </div>
                <div className="app-card p-3 bg-surface-2 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-text-muted text-2xs block">SOS Emergency SOS</span>
                  <div className="text-xl font-bold text-text">0 Active</div>
                  <span className="text-[10px] text-emerald-400 font-semibold">All units nominal</span>
                </div>
              </div>

              <div className="app-card p-4 bg-surface-2 border border-white/5 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Autonomous Network Recalibration
                  </span>
                  <Badge variant="outline" className="text-2xs text-primary border-primary/30">Active</Badge>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  NERA continuously analyzes GPS pings against real-time GSI landslide polygons and IMD rain radars,
                  instantly calculating alternate routes and dispatching alerts directly to driver telematics terminals.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  size="sm"
                  onClick={() => navigate('/fleet')}
                  className="h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white"
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
