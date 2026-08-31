import { useState } from 'react'
import {
  LayoutDashboard, Map, Route, Truck, Bell, BarChart3,
  AlertOctagon, Shield, Radio, Cpu, Wind, CloudRain, Clock,
  CheckCircle2, ArrowRight, Activity, Zap, Compass, Flame
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

const MODULES = [
  { id: 'command', icon: LayoutDashboard, label: 'Command Center', desc: 'Unified situational awareness' },
  { id: 'map', icon: Map, label: 'Live Tactical HUD', desc: 'GPS vehicle transponders' },
  { id: 'routes', icon: Route, label: 'Route Intelligence', desc: 'Multi-corridor terrain optimizer' },
  { id: 'fleet', icon: Truck, label: 'Fleet Telemetry', desc: 'Driver logs & cargo sensors' },
  { id: 'alerts', icon: Bell, label: 'Incident Triage', desc: 'Landslide & flash flood radar' },
  { id: 'analytics', icon: BarChart3, label: 'What-If Studio', desc: 'Corridor failure stress-testing' },
  { id: 'emergency', icon: AlertOctagon, label: 'Emergency Mode', desc: 'Disaster priority escalation' },
]

const MODULE_DATA: Record<string, {
  header: string
  badgeText: string
  badgeVariant: 'default' | 'success' | 'warning' | 'danger'
  sub: string
  centerContent: {
    title: string
    subtitle: string
    stats: { label: string; value: string; color?: string }[]
    details: string[]
  }
  telemetry: {
    title: string
    metrics: { label: string; value: string; progress?: number; color?: string }[]
    alertText: string
  }
}> = {
  command: {
    header: 'NH-415 Pasighat Sector',
    badgeText: 'Blockade Active',
    badgeVariant: 'danger',
    sub: 'Elevation: 1,840m • Slope: 24.5°',
    centerContent: {
      title: 'Active Dynamic Reroute In Effect',
      subtitle: 'Guwahati ➔ Tezpur ➔ North Lakhimpur (Route C Safe Bypass)',
      stats: [
        { label: 'Distance', value: '412 km' },
        { label: 'ETA', value: '8h 15m' },
        { label: 'Risk', value: '18% (Safe)', color: 'text-emerald-600 dark:text-emerald-400' },
      ],
      details: [
        'XGBoost predicted 78% landslide probability at Km 42',
        '7 inbound essential cargo convoys automatically rerouted',
        'Real-time IMD radar confirms heavy rain (84 mm/h)',
      ],
    },
    telemetry: {
      title: 'AI Risk Telemetry',
      metrics: [
        { label: 'Geotechnical Risk', value: '78% (High)', progress: 78, color: 'bg-rose-500' },
        { label: 'Soil Saturation', value: '88% (Critical)', progress: 88, color: 'bg-sky-500' },
        { label: 'Rainfall Intensity', value: '84 mm/h' },
        { label: 'Convoys Rerouted', value: '7 Units' },
      ],
      alertText: 'Next AI Recalibration in 3m 42s',
    },
  },
  map: {
    header: 'Live NER Spatial View (8 States)',
    badgeText: 'Live Telemetry Active',
    badgeVariant: 'success',
    sub: 'MapLibre GL Vector Engine • 0.5m DEM',
    centerContent: {
      title: '47 Active Transponders Connected',
      subtitle: 'Tracking essential food, oxygen & vaccine shipments across hill corridors',
      stats: [
        { label: 'Active GPS Pings', value: '47/47' },
        { label: 'Ping Interval', value: '1.0s' },
        { label: 'Zero-Signal Units', value: '3 (PWA Sync)', color: 'text-amber-600 dark:text-amber-400' },
      ],
      details: [
        'Guwahati to Pasighat arterial corridor active',
        'Live weather Doppler overlay rendered on MapLibre canvas',
        'Hazard polygons mapped across East Siang & Kaziranga',
      ],
    },
    telemetry: {
      title: 'Spatial Feeds',
      metrics: [
        { label: 'Satellite Ingestion', value: 'ISRO Bhuvan' },
        { label: 'Map Engine', value: 'MapLibre GL 3D' },
        { label: 'Coordinate System', value: 'EPSG:4326 WGS84' },
        { label: 'Live Data Rate', value: '14.8 KB/s' },
      ],
      alertText: 'All 8 state boundary layers synchronized',
    },
  },
  routes: {
    header: 'Multi-Corridor Optimizer',
    badgeText: 'AI Recommended Route C',
    badgeVariant: 'success',
    sub: 'Guwahati Sector HQ ➔ Itanagar District Hospital',
    centerContent: {
      title: 'Optimal Delivery Trajectory: Route C Bypass',
      subtitle: 'Calculated with heavy vehicle axle limits and terrain slope factors',
      stats: [
        { label: 'Distance', value: '280 km' },
        { label: 'Duration', value: '5h 45m' },
        { label: 'Bridge Capacity', value: '40 Tonne Pass', color: 'text-emerald-600 dark:text-emerald-400' },
      ],
      details: [
        'Avoids vulnerable NH-415 mudslide zone at Km 42',
        'Avoids flood-prone Kaziranga lowlands culvert',
        'Confirms certified bridgehead weight tolerance',
      ],
    },
    telemetry: {
      title: 'Route Diagnostics',
      metrics: [
        { label: 'Route A Risk', value: '72% (High)', progress: 72, color: 'bg-rose-500' },
        { label: 'Route B Risk', value: '81% (Critical)', progress: 81, color: 'bg-rose-500' },
        { label: 'Route C Risk', value: '28% (Safe)', progress: 28, color: 'bg-emerald-500' },
        { label: 'Time Advantage', value: '-3h 15m saved' },
      ],
      alertText: 'Route C verified all-weather asphalt corridor',
    },
  },
  fleet: {
    header: 'Convoy Telemetry Dossier',
    badgeText: 'AS-09-4821 En Route',
    badgeVariant: 'default',
    sub: 'Cargo: Essential Medical Vaccines (8.5 Tonnes)',
    centerContent: {
      title: 'Convoy AS-09-4821 Nominal',
      subtitle: 'Speed: 54 km/h • Compartment Temp: 4.2°C (Cold Chain OK)',
      stats: [
        { label: 'Speed', value: '54 km/h' },
        { label: 'ETA', value: '17:10 hrs' },
        { label: 'Cargo Temp', value: '4.2°C (Optimal)', color: 'text-emerald-600 dark:text-emerald-400' },
      ],
      details: [
        'Origin: Guwahati Depot ➔ Destination: Itanagar Hospital',
        'Driver telematic terminal auto-updated with Route C turn-by-turn',
        'Backup satellite transponder online for zero-signal mountain stretch',
      ],
    },
    telemetry: {
      title: 'Vehicle Vitals',
      metrics: [
        { label: 'Battery / Alternator', value: '24.4 V (Nominal)' },
        { label: 'Fuel Range', value: '380 km remaining' },
        { label: 'Driver Rest Timer', value: '2h 15m remaining' },
        { label: 'SOS Alarm Status', value: 'Nominal (Green)' },
      ],
      alertText: 'Driver acknowledged reroute notification',
    },
  },
  alerts: {
    header: 'Incident Triage & Radar Feed',
    badgeText: '3 Active Warnings',
    badgeVariant: 'warning',
    sub: 'Automated Triaging via Machine Learning',
    centerContent: {
      title: 'High-Priority Alert: Landslide Blockade NH-415',
      subtitle: 'East Siang Sector • Km 42 • Road Impassable',
      stats: [
        { label: 'Severity', value: 'Level 3 Critical', color: 'text-rose-600 dark:text-rose-400' },
        { label: 'Verified By', value: 'Field PWA + Radar' },
        { label: 'Impacted Convoys', value: '7 Rerouted', color: 'text-emerald-600 dark:text-emerald-400' },
      ],
      details: [
        'Mudslide debris volume estimated at 450 m³',
        'Local BRO clearing team dispatched with heavy excavators',
        'Expected clearance window: 14–18 hours',
      ],
    },
    telemetry: {
      title: 'Incident Queue',
      metrics: [
        { label: 'NH-415 Landslide', value: 'Active Blockade', color: 'text-rose-600 dark:text-rose-400' },
        { label: 'NH-37 Waterlogging', value: 'Caution (1 lane)', color: 'text-amber-600 dark:text-amber-400' },
        { label: 'NH-13 Rockfall Alert', value: 'Cleared', color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Avg Triage Speed', value: '42ms per alert' },
      ],
      alertText: 'Automated notifications dispatched to 14 drivers',
    },
  },
  analytics: {
    header: 'What-If Corridor Stress-Testing',
    badgeText: 'Simulation Active',
    badgeVariant: 'default',
    sub: 'Mathematical Shockwave Modeling',
    centerContent: {
      title: 'Simulated 6-Hour Blockade on NH-415',
      subtitle: 'Projected delivery performance across 128 regional road segments',
      stats: [
        { label: 'Without AI', value: '61% On-Time', color: 'text-rose-600 dark:text-rose-400' },
        { label: 'With NERA AI', value: '79% On-Time', color: 'text-emerald-600 dark:text-emerald-400' },
        { label: 'Fleet Delay Saved', value: '163 Hours', color: 'text-sky-600 dark:text-cyan-400' },
      ],
      details: [
        'Calculates bottleneck spillover to secondary district roads',
        'Estimates cold-chain cargo expiration risks',
        'Recommends optimal staging points for emergency fuel trucks',
      ],
    },
    telemetry: {
      title: 'Simulation Output',
      metrics: [
        { label: 'Tested Corridors', value: '4 Trunk Routes' },
        { label: 'Simulated Duration', value: '6 Hours' },
        { label: 'Stranded Convoys Saved', value: '14 Units' },
        { label: 'Economic Savings', value: '₹18.4 Lakhs' },
      ],
      alertText: 'Model accuracy validated against historical GSI logs',
    },
  },
  emergency: {
    header: 'Disaster Escalation Response Mode',
    badgeText: 'LEVEL 3 ESCALATED',
    badgeVariant: 'danger',
    sub: 'Brahmaputra Flood Crisis Protocol Active',
    centerContent: {
      title: 'Green Corridor Protocol Engaged',
      subtitle: 'Priority clearance for medical oxygen, food rations & rescue units',
      stats: [
        { label: 'Priority 1 Medical', value: '3 Ambulances', color: 'text-rose-600 dark:text-rose-400' },
        { label: 'Priority 2 Food', value: '8 Supply Trucks', color: 'text-amber-600 dark:text-amber-400' },
        { label: 'Priority 3 Water', value: '2 Plants En Route', color: 'text-sky-600 dark:text-info' },
      ],
      details: [
        'Civilian commercial traffic restricted to secondary arterials',
        'State Disaster Management Cell synchronized in real time',
        'Direct emergency broadcasts sent to all district checkposts',
      ],
    },
    telemetry: {
      title: 'Emergency Status',
      metrics: [
        { label: 'Emergency Level', value: 'Level 3 Regional' },
        { label: 'Active Green Convoys', value: '13 Transports' },
        { label: 'Broadcast Status', value: '100% Delivered' },
        { label: 'Command Authority', value: 'HQ Ops Lead' },
      ],
      alertText: 'All checkposts operating in priority bypass mode',
    },
  },
}

export function CoreIntelligencePreview() {
  const [activeModule, setActiveModule] = useState('command')
  const current = MODULE_DATA[activeModule] || MODULE_DATA.command

  return (
    <section id="intelligence" className="py-20 md:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/25 text-blue-700 dark:text-primary text-xs font-semibold">
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>UNIFIED PLATFORM ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            One Operational Picture. Every Critical Decision.
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-muted leading-relaxed">
            High-density enterprise cockpit unifying real-time geospatial telemetry, XGBoost landslide prediction,
            and terrain-aware route dispatch in a single command interface.
          </p>
        </div>

        {/* Command Center Mockup Wrapper */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#080E1A]/95 shadow-sm dark:shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Mockup Top Window Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-[#060A12] border-b border-slate-200 dark:border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-400 dark:bg-rose-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-400 dark:bg-amber-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-400 dark:bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-slate-500 dark:text-text-muted font-mono text-[11px] ml-2 hidden sm:inline">
                nera://command-center.ops.ner/v2.4/{activeModule}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-slate-900 dark:text-white font-mono">Guwahati Ops HQ (Online)</span>
            </div>
          </div>

          {/* 3-Column Cockpit Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
            
            {/* ── LEFT: Navigation Sidebar ── */}
            <div className="md:col-span-3 bg-slate-50/80 dark:bg-[#0A101D] border-r border-slate-200 dark:border-white/10 p-3 space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 dark:text-text-dim px-2 py-1 tracking-wider font-mono">
                Platform Modules
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
                        ? 'bg-blue-600 dark:bg-primary text-white font-bold shadow-sm'
                        : 'text-slate-600 dark:text-text-muted hover:bg-slate-200/60 dark:hover:bg-surface-2 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{m.label}</div>
                      <div className={cn('text-[9px] truncate font-normal', isActive ? 'text-white/90' : 'text-slate-400 dark:text-text-dim')}>
                        {m.desc}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* ── CENTER: Map Canvas Simulation ── */}
            <div className="md:col-span-6 bg-white dark:bg-[#080E1A] p-5 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{current.header}</span>
                  <Badge variant={current.badgeVariant} className="text-2xs font-bold font-mono">{current.badgeText}</Badge>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-text-muted font-mono">{current.sub}</span>
              </div>

              {/* Graphical Tactical Display */}
              <div className="my-auto py-6 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-surface/70 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-primary" />
                    <span>{current.centerContent.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-text-muted">
                    {current.centerContent.subtitle}
                  </p>
                  
                  {/* Stats Strip */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-white dark:bg-surface-2/80 border border-slate-200 dark:border-white/5 text-center text-xs font-mono shadow-sm">
                    {current.centerContent.stats.map((st) => (
                      <div key={st.label}>
                        <span className="text-[9px] text-slate-500 dark:text-text-muted block">{st.label}</span>
                        <strong className={cn('text-xs text-slate-900 dark:text-white font-bold', st.color)}>{st.value}</strong>
                      </div>
                    ))}
                  </div>

                  {/* Bullet Details */}
                  <div className="space-y-1 text-2xs text-slate-600 dark:text-text-muted pt-1">
                    {current.centerContent.details.map((d) => (
                      <div key={d} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-text-dim border-t border-slate-100 dark:border-white/5 pt-2 font-mono">
                <span>Satellite Feed: ISRO Bhuvan (0.5m DEM)</span>
                <span>Active Convoys: 47 Monitored</span>
              </div>
            </div>

            {/* ── RIGHT: AI Intelligence Telemetry Strip ── */}
            <div className="md:col-span-3 bg-slate-50/80 dark:bg-[#0A101D] p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-blue-600 dark:text-primary" />
                  {current.telemetry.title}
                </span>
                <Badge variant="outline" className="text-2xs text-blue-700 dark:text-primary border-blue-300 dark:border-primary/30 font-mono">v2.4</Badge>
              </div>

              <div className="space-y-3 text-xs">
                {current.telemetry.metrics.map((m) => (
                  <div key={m.label} className="p-2.5 bg-white dark:bg-surface/80 border border-slate-200 dark:border-white/5 rounded-xl space-y-1 shadow-sm">
                    <div className="flex justify-between text-2xs text-slate-600 dark:text-text-muted">
                      <span>{m.label}</span>
                      <strong className={cn('text-slate-900 dark:text-white font-mono', m.color)}>{m.value}</strong>
                    </div>
                    {m.progress !== undefined && (
                      <div className="h-1.5 bg-slate-200 dark:bg-surface-3 rounded-full overflow-hidden">
                        <div className={cn('h-full', m.color || 'bg-blue-600 dark:bg-primary')} style={{ width: `${m.progress}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-white/5">
                <div className="text-[10px] text-slate-500 dark:text-text-dim flex items-center gap-1 font-mono">
                  <Clock className="h-3 w-3 text-blue-600 dark:text-primary" />
                  <span>{current.telemetry.alertText}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}

