import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Play, ShieldAlert, Cpu, Sparkles, Navigation,
  Truck, AlertTriangle, CheckCircle2, ChevronRight, Activity,
  Layers, Compass, MapPin, Radio, Shield, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

const COPILOT_SCENARIOS = [
  {
    question: '“What is the highest logistics risk right now?”',
    location: 'NH-415 East Siang Corridor (Km 42)',
    riskLevel: '78% Landslide Probability',
    rainfall: '84 mm/h Monsoonal Rain',
    action: 'Auto-Reroute 7 Convoys via Route C North Bank bypass',
    statusBadge: 'CRITICAL HAZARD',
    statusColor: 'text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10',
  },
  {
    question: '“Status of medical supply convoy AS-09-4821?”',
    location: 'Brahmaputra Crossing ➔ Itanagar District Hospital',
    riskLevel: '28% Normal (Safe Corridor C)',
    rainfall: '12 mm/h Light Drizzle',
    action: 'ETA confirmed 17:10 hrs • Temperature 4.2°C nominal',
    statusBadge: 'CONVOY SAFE',
    statusColor: 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10',
  },
  {
    question: '“Evaluate Kaziranga Floodplain Corridor NH-37?”',
    location: 'NH-37 Bokakhat Lowlands',
    riskLevel: '62% Inundation Warning',
    rainfall: '92 mm/h Brahmaputra Surge',
    action: 'Speed limit advisory 30 km/h • Heavy axles restricted',
    statusBadge: 'CAUTION PROTOCOL',
    statusColor: 'text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10',
  },
]

export function HeroSection() {
  const navigate = useNavigate()
  const [copilotIdx, setCopilotIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCopilotIdx((prev) => (prev + 1) % COPILOT_SCENARIOS.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const currentScenario = COPILOT_SCENARIOS[copilotIdx]

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-14 overflow-hidden">
      {/* Coordinate HUD Watermarks */}
      <div className="absolute top-28 left-6 text-[10px] font-mono text-slate-400 dark:text-text-dim/60 hidden xl:block pointer-events-none select-none">
        GRID LAT 26.2006° N / LON 92.9376° E<br />
        PROJECTION: EPSG:4326 WGS84
      </div>
      <div className="absolute top-28 right-6 text-[10px] font-mono text-slate-400 dark:text-text-dim/60 text-right hidden xl:block pointer-events-none select-none">
        SECTOR: 8 NER STATES<br />
        TELEMETRY FEED: ONLINE (1000ms)
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ── LEFT COLUMN: HEADLINE & ACTIONS ── */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/30 text-blue-700 dark:text-primary text-xs font-semibold backdrop-blur-md shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-primary animate-ping" />
              <span className="tracking-wide text-[11px] font-bold">MISSION-CRITICAL NER LOGISTICS INTELLIGENCE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12]">
              Predict disruptions <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 dark:from-blue-400 dark:via-cyan-300 dark:to-emerald-400">
                before they stop
              </span>{' '}
              the supply chain.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-text-muted leading-relaxed max-w-xl font-normal">
              An AI-powered logistics intelligence platform that monitors highways, forecasts geotechnical landslides & floods,
              tracks essential medical & food cargo, and calculates terrain-safe multi-modal routes across India&apos;s 8 North Eastern States.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="h-11 px-6 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm dark:shadow-xl dark:shadow-primary/25 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              >
                <span>Launch Command Center</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/map')}
                className="h-11 px-5 text-sm font-semibold rounded-xl border-slate-200 dark:border-white/15 bg-white dark:bg-surface/60 hover:bg-slate-50 dark:hover:bg-surface text-slate-700 dark:text-text flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Compass className="h-4 w-4 text-blue-600 dark:text-primary" />
                <span>Live Tactical Map HUD</span>
              </Button>
            </div>

            {/* System Specs Bar */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-200 dark:border-white/10 text-2xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface/50 border border-slate-200/80 dark:border-white/5">
                <span className="text-slate-500 dark:text-text-muted block text-[10px] font-mono">ML Forecast</span>
                <strong className="text-slate-900 dark:text-white text-xs font-semibold">6–12h Early Alert</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface/50 border border-slate-200/80 dark:border-white/5">
                <span className="text-slate-500 dark:text-text-muted block text-[10px] font-mono">Terrain DEM</span>
                <strong className="text-sky-700 dark:text-cyan-400 text-xs font-semibold">0.5m ISRO Bhuvan</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-surface/50 border border-slate-200/80 dark:border-white/5">
                <span className="text-slate-500 dark:text-text-muted block text-[10px] font-mono">Field Resilience</span>
                <strong className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold">Offline PWA Sync</strong>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: INTERACTIVE NER MAP & DYNAMIC COPILOT ── */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl border border-slate-200 dark:border-white/15 bg-white/90 dark:bg-[#080E1A]/90 backdrop-blur-xl shadow-lg dark:shadow-2xl p-3.5 sm:p-4 overflow-hidden group">
              
              {/* Corner Coordinate Crosshairs */}
              <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-300 dark:text-white/20 select-none">+</div>
              <div className="absolute top-2 right-2 text-[8px] font-mono text-slate-300 dark:text-white/20 select-none">+</div>
              <div className="absolute bottom-2 left-2 text-[8px] font-mono text-slate-300 dark:text-white/20 select-none">+</div>
              <div className="absolute bottom-2 right-2 text-[8px] font-mono text-slate-300 dark:text-white/20 select-none">+</div>

              {/* Map Canvas HUD Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wider font-mono">LIVE NER TACTICAL HUD</span>
                  <span className="text-2xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-text-muted border border-slate-200 dark:border-white/5 font-mono">
                    EPSG:4326
                  </span>
                </div>
                <div className="flex items-center gap-2 text-2xs">
                  <span className="text-slate-500 dark:text-text-muted hidden sm:inline font-mono">Refresh: 1000ms</span>
                  <Badge variant="success" className="text-2xs font-semibold py-0.5 px-2 font-mono">
                    ● TELEMETRY SYNCED
                  </Badge>
                </div>
              </div>

              {/* Map Visual Simulation Canvas */}
              <div className="relative h-[310px] sm:h-[360px] w-full rounded-xl bg-slate-100/70 dark:bg-[#060A12] overflow-hidden border border-slate-200/80 dark:border-white/10 flex items-center justify-center my-3 shadow-inner">
                {/* SVG Map of NER */}
                <svg viewBox="0 0 800 500" className="w-full h-full object-cover">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(100,116,139,0.1)" strokeWidth="1" />
                      <circle cx="0" cy="0" r="1" fill="rgba(100,116,139,0.2)" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#tacticalGrid)" />

                  {/* Brahmaputra River Basin Contour (Blue Line) */}
                  <path
                    d="M 120,290 C 240,280 340,240 460,245 S 620,180 730,130"
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="4"
                    strokeOpacity="0.6"
                    strokeLinecap="round"
                  />

                  {/* Assam & Meghalaya Main Landmass */}
                  <path
                    d="M 120,240 Q 200,210 320,210 T 520,180 T 680,120 T 740,160 T 650,260 T 480,270 T 360,320 T 220,310 Z"
                    className="fill-slate-200/80 dark:fill-[#0D1B33] stroke-slate-300 dark:stroke-[#1E3A5F]"
                    strokeWidth="1.5"
                  />
                  {/* Arunachal Pradesh Mountainous Border */}
                  <path
                    d="M 280,140 Q 420,80 620,90 T 760,110 T 680,190 T 500,190 Z"
                    className="fill-slate-300/80 dark:fill-[#0F2442] stroke-slate-400 dark:stroke-[#2A5285]"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  {/* Nagaland / Manipur / Mizoram / Tripura Hills */}
                  <path
                    d="M 520,260 Q 640,280 680,360 T 580,440 T 490,390 T 480,270 Z"
                    className="fill-slate-200/70 dark:fill-[#0C172B] stroke-slate-300 dark:stroke-[#1E3A5F]"
                    strokeWidth="1.2"
                  />

                  {/* Road Network Corridors */}
                  {/* Green Accessible Route C North Bank */}
                  <path
                    d="M 240,290 C 310,230 420,220 560,190 S 680,140 710,125"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                  {/* Amber At-Risk Route B */}
                  <path
                    d="M 240,290 C 340,330 460,310 540,260 S 640,220 710,125"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="6 4"
                  />
                  {/* Red Blocked Segment NH-415 (East Siang) */}
                  <path
                    d="M 430,230 L 530,210"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />

                  {/* Critical Landslide Hazard Marker at NH-415 */}
                  <g transform="translate(480, 220)">
                    <circle r="18" fill="#EF4444" fillOpacity="0.2" className="animate-ping" />
                    <circle r="8" fill="#EF4444" stroke="#FFF" strokeWidth="2" />
                    <text x="12" y="4" className="fill-rose-700 dark:fill-[#F87171]" fontSize="10" fontWeight="bold">NH-415 BLOCKED (Landslide)</text>
                  </g>

                  {/* Vehicle Markers (Convoys in Transit) */}
                  <g transform="translate(350, 240)">
                    <circle r="6" fill="#2563EB" stroke="#FFF" strokeWidth="1.5" />
                    <text x="9" y="3" className="fill-slate-800 dark:fill-[#E2E8F0]" fontSize="9" fontWeight="bold">AS-09-4821 (Med)</text>
                  </g>
                  <g transform="translate(630, 150)">
                    <circle r="6" fill="#10B981" stroke="#FFF" strokeWidth="1.5" />
                    <text x="9" y="3" className="fill-slate-800 dark:fill-[#E2E8F0]" fontSize="9" fontWeight="bold">MED-14 (Safe)</text>
                  </g>
                  <g transform="translate(280, 275)">
                    <circle r="6" fill="#2563EB" stroke="#FFF" strokeWidth="1.5" />
                    <text x="9" y="3" className="fill-slate-600 dark:fill-[#94A3B8]" fontSize="9" fontWeight="bold">POL-08 (Fuel)</text>
                  </g>

                  {/* District / State Hub Labels */}
                  <text x="210" y="315" className="fill-slate-900 dark:fill-[#F8FAFC]" fontSize="12" fontWeight="bold">Guwahati Sector HQ</text>
                  <text x="430" y="275" className="fill-slate-600 dark:fill-[#94A3B8]" fontSize="10">Jorhat</text>
                  <text x="560" y="215" className="fill-slate-600 dark:fill-[#94A3B8]" fontSize="10">Dibrugarh</text>
                  <text x="690" y="115" className="fill-slate-900 dark:fill-[#F8FAFC]" fontSize="11" fontWeight="bold">Pasighat (East Siang)</text>
                  <text x="310" y="150" className="fill-blue-700 dark:fill-[#60A5FA]" fontSize="10" fontWeight="bold">Itanagar</text>
                </svg>

                {/* Floating Top-Left Network KPI Strip */}
                <div className="absolute top-2.5 left-2.5 bg-white/95 dark:bg-[#0D1626]/95 border border-slate-200 dark:border-white/10 rounded-xl p-2.5 backdrop-blur-md text-left shadow-sm dark:shadow-lg">
                  <div className="text-[9px] uppercase font-bold text-slate-500 dark:text-text-muted tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                    <Radio className="h-3 w-3 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                    Network Health
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-text-muted text-2xs block">Active Fleet</span>
                      <strong className="text-slate-900 dark:text-white text-xs font-mono">47 Units</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-text-muted text-2xs block">Hazard Sectors</span>
                      <strong className="text-amber-600 dark:text-warning text-xs font-mono">8 High-Risk</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-text-muted text-2xs block">Blockades</span>
                      <strong className="text-rose-600 dark:text-danger text-xs font-mono">3 Critical</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-text-muted text-2xs block">Auto-Rerouted</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 text-xs font-mono">12 Convoys</strong>
                    </div>
                  </div>
                </div>

                {/* Legend Bottom Left */}
                <div className="absolute bottom-2.5 left-2.5 hidden sm:flex items-center gap-3 bg-white/90 dark:bg-[#0D1626]/90 border border-slate-200 dark:border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm text-[10px] text-slate-600 dark:text-text-muted shadow-sm">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Route C Safe</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Caution</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Impassable</span>
                </div>
              </div>

              {/* ── FLOATING AI COPILOT OVERLAY ── */}
              <div className="rounded-xl border border-blue-200 dark:border-primary/30 bg-slate-50/95 dark:bg-[#0A1220]/95 p-3 text-left shadow-sm dark:shadow-2xl backdrop-blur-xl relative z-20">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-blue-100 dark:bg-primary/20 flex items-center justify-center text-blue-600 dark:text-primary">
                      <Cpu className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">NER Operations Copilot</span>
                  </div>
                  <span className="text-[10px] text-blue-600 dark:text-primary font-semibold flex items-center gap-1 font-mono">
                    <Sparkles className="h-3 w-3" />
                    Context-Aware AI
                  </span>
                </div>

                {/* Dynamic Scenario Carousel */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <div className="h-4 w-4 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center text-[9px] text-slate-600 dark:text-text-muted flex-shrink-0 mt-0.5 font-mono">
                      HQ
                    </div>
                    <div className="bg-white dark:bg-surface-2 border border-slate-200 dark:border-transparent px-2.5 py-1 rounded-lg text-slate-800 dark:text-text font-medium text-2xs shadow-sm">
                      {currentScenario.question}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="h-4 w-4 rounded-full bg-blue-100 dark:bg-primary/20 text-blue-600 dark:text-primary flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5 font-mono">
                      AI
                    </div>
                    <div className="bg-blue-50/80 dark:bg-primary/10 border border-blue-200 dark:border-primary/20 px-2.5 py-1.5 rounded-lg text-slate-800 dark:text-white text-2xs leading-relaxed flex-1 shadow-sm">
                      <div className="flex items-center justify-between pb-1 mb-1 border-b border-blue-200/60 dark:border-white/10">
                        <span className="font-semibold text-slate-900 dark:text-text-bright">{currentScenario.location}</span>
                        <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded border font-mono', currentScenario.statusColor)}>
                          {currentScenario.statusBadge}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-text-muted text-[11px]">
                        Risk: <strong className="text-amber-700 dark:text-warning">{currentScenario.riskLevel}</strong> • {currentScenario.rainfall}
                      </p>
                      <div className="mt-1 pt-1 border-t border-blue-200/60 dark:border-white/10 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] font-mono">
                        ✓ {currentScenario.action}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-200/80 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-text-dim font-mono">
                    <span>Scenario {copilotIdx + 1} of {COPILOT_SCENARIOS.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/routes')}
                      className="h-6 text-[10px] font-semibold bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-white"
                    >
                      Risk Matrix
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => navigate('/routes')}
                      className="h-6 text-[10px] font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Show Route C
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}


