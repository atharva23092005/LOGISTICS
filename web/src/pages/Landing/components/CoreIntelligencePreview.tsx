import { useState } from 'react'
import {
  LayoutDashboard, Map, Route, Truck, Bell, BarChart3,
  AlertOctagon, Shield, Radio, Cpu, Wind, CloudRain, Clock,
  CheckCircle2, ArrowRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

const MODULES = [
  { id: 'command', icon: LayoutDashboard, label: 'Command Center', desc: 'Unified situational awareness' },
  { id: 'map', icon: Map, label: 'Live Map HUD', desc: 'Real-time GPS vehicle beacons' },
  { id: 'routes', icon: Route, label: 'Route Intelligence', desc: 'Multi-corridor terrain optimizer' },
  { id: 'fleet', icon: Truck, label: 'Fleet Telemetry', desc: 'Driver logs & cargo manifests' },
  { id: 'alerts', icon: Bell, label: 'Incident Triage', desc: 'Landslide & flash flood alerts' },
  { id: 'analytics', icon: BarChart3, label: 'Simulation & ML', desc: 'What-if disruption modeling' },
  { id: 'emergency', icon: AlertOctagon, label: 'Emergency Mode', desc: 'Disaster response coordination' },
]

export function CoreIntelligencePreview() {
  const [activeModule, setActiveModule] = useState('command')

  return (
    <section id="intelligence" className="py-16 md:py-24 bg-[#0A101D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>UNIFIED PLATFORM ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            One Operational Picture. Every Critical Decision.
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            High-density enterprise cockpit unifying real-time geospatial telemetry, XGBoost landslide prediction,
            and terrain-aware route dispatch in a single command interface.
          </p>
        </div>

        {/* Command Center Mockup Wrapper */}
        <div className="rounded-2xl border border-white/10 bg-[#070C16] shadow-2xl overflow-hidden">
          
          {/* Mockup Top Window Bar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#09101E] border-b border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-text-muted font-mono text-[11px] ml-2 hidden sm:inline">
                nera://command-center.ops.ner/v2.4
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="status-dot status-dot-green" />
              <span className="text-[11px] font-bold text-white">Guwahati Ops Center</span>
            </div>
          </div>

          {/* 3-Column Cockpit Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[440px]">
            
            {/* ── LEFT: Navigation Sidebar ── */}
            <div className="md:col-span-3 bg-[#080D18] border-r border-white/5 p-3 space-y-1">
              <div className="text-[10px] uppercase font-bold text-text-dim px-2 py-1 tracking-wider">
                System Modules
              </div>
              {MODULES.map((m) => {
                const Icon = m.icon
                const isActive = activeModule === m.id
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveModule(m.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all',
                      isActive
                        ? 'bg-primary text-white font-bold shadow-md shadow-primary/20'
                        : 'text-text-muted hover:bg-surface-2 hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{m.label}</div>
                      <div className={cn('text-[9px] truncate font-normal', isActive ? 'text-white/80' : 'text-text-dim')}>
                        {m.desc}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* ── CENTER: Map Canvas Simulation ── */}
            <div className="md:col-span-6 bg-[#050811] p-4 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-white/5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-xs">NH-415 Pasighat Sector</span>
                  <Badge variant="danger" className="text-2xs">Blockade Active</Badge>
                </div>
                <span className="text-[10px] text-text-muted">Elevation: 1,840m • Slope: 24.5°</span>
              </div>

              {/* Graphical Tactical Display */}
              <div className="my-auto py-8 text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-surface/50 border border-white/10 backdrop-blur-md">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-warning font-bold text-xs">
                      <Shield className="h-4 w-4" />
                      <span>Active Dynamic Reroute In Effect</span>
                    </div>
                    <p className="text-2xs text-text-muted max-w-xs">
                      Guwahati ➔ Tezpur ➔ North Lakhimpur (Route C Safe Corridor)
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs pt-1 font-mono">
                      <span className="text-white">412 km</span>
                      <span className="text-white">8h 15m</span>
                      <span className="text-emerald-400 font-bold">18% Risk (Safe)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-dim border-t border-white/5 pt-2">
                <span>Satellite Feed: ISRO Bhuvan (0.5m DEM)</span>
                <span>Active Convoys: 7 Rerouted</span>
              </div>
            </div>

            {/* ── RIGHT: AI Intelligence Telemetry Strip ── */}
            <div className="md:col-span-3 bg-[#080D18] p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-primary" />
                  AI Telemetry Panel
                </span>
                <Badge variant="outline" className="text-2xs text-primary border-primary/30">v2.4 Live</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="app-card p-2.5 bg-surface-2 space-y-1">
                  <div className="flex justify-between text-2xs text-text-muted">
                    <span>Geotechnical Risk Score</span>
                    <span className="text-rose-400 font-bold">78% (High)</span>
                  </div>
                  <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[78%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-2xs">
                  <div className="app-card p-2 bg-surface-2">
                    <span className="text-text-muted block">Rainfall (Radar)</span>
                    <strong className="text-white text-xs">84 mm/h</strong>
                  </div>
                  <div className="app-card p-2 bg-surface-2">
                    <span className="text-text-muted block">Soil Saturation</span>
                    <strong className="text-info text-xs">88% (Critical)</strong>
                  </div>
                </div>

                <div className="app-card p-2.5 bg-surface-2 space-y-1">
                  <span className="text-2xs text-text-muted block">Affected Convoys</span>
                  <div className="text-xs font-bold text-white">7 Active Supply Units</div>
                  <div className="text-[10px] text-emerald-400">All 7 successfully notified</div>
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <div className="text-[10px] text-text-dim flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Next AI Risk Recalibration in 4m 12s</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
