import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Play, ShieldAlert, Cpu, Sparkles, Navigation,
  Truck, AlertTriangle, CheckCircle2, ChevronRight, Activity,
  Layers, Compass, MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

export function HeroSection() {
  const navigate = useNavigate()
  const [copilotStep, setCopilotStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCopilotStep((prev) => (prev + 1) % 3)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center pt-24 pb-12 overflow-hidden bg-gradient-to-b from-[#060A14] via-[#0A101D] to-[#0D1626]">
      {/* ── Background Grid & Topographic Glow ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f335215_1px,transparent_1px),linear-gradient(to_bottom,#1f335215_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ── LEFT COLUMN: HEADLINE & ACTIONS ── */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-semibold backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              <span className="tracking-wide">MISSION-CRITICAL NER LOGISTICS INTELLIGENCE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
              Predict disruptions <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400">
                before they stop
              </span>{' '}
              the supply chain.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-text-muted leading-relaxed max-w-xl font-normal">
              An AI-powered logistics intelligence platform that monitors roads, predicts geotechnical disruptions,
              tracks essential medical & food cargo, and recommends safer routes across India&apos;s North Eastern Region.
            </p>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="h-11 px-6 text-sm font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/25 rounded-xl flex items-center justify-center gap-2"
              >
                <span>Explore Command Center</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <a
                href="#how-it-works"
                className="h-11 px-5 text-sm font-semibold rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-text flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="h-3.5 w-3.5 fill-current text-primary" />
                <span>See How It Works</span>
              </a>
            </div>

            {/* Prototype Disclaimer */}
            <div className="flex items-center gap-4 text-2xs text-text-dim pt-2 border-t border-white/5">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                Govt-Grade GIS Architecture
              </span>
              <span>•</span>
              <span>8 North East States</span>
              <span>•</span>
              <span className="text-warning">Prototype Live Telemetry</span>
            </div>
          </div>

          {/* ── RIGHT COLUMN: INTERACTIVE NER MAP & COPILOT ── */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl border border-white/10 bg-[#080E1A]/80 backdrop-blur-xl shadow-2xl p-3 md:p-4 overflow-hidden group">
              
              {/* Map Canvas HUD Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-danger animate-pulse" />
                  <span className="text-xs font-bold text-white tracking-wider">LIVE NER TACTICAL MAP</span>
                  <span className="text-2xs px-1.5 py-0.5 rounded bg-white/5 text-text-muted border border-white/5">
                    EPSG:4326
                  </span>
                </div>
                <div className="flex items-center gap-2 text-2xs">
                  <span className="text-text-muted hidden sm:inline">Refresh: 1s</span>
                  <Badge variant="success" className="text-2xs font-semibold py-0.5">
                    ● SYSTEM OPERATIONAL
                  </Badge>
                </div>
              </div>

              {/* Map Visual Simulation Canvas */}
              <div className="relative h-[320px] sm:h-[380px] w-full rounded-xl bg-[#060A12] overflow-hidden border border-white/5 flex items-center justify-center my-3">
                {/* SVG Map of NER (Representative Geographic Vectors) */}
                <svg viewBox="0 0 800 500" className="w-full h-full object-cover opacity-90">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* State Boundary Outlines (Assam, Arunachal, Meghalaya, etc.) */}
                  <path
                    d="M 120,240 Q 200,210 320,210 T 520,180 T 680,120 T 740,160 T 650,260 T 480,270 T 360,320 T 220,310 Z"
                    fill="#0D1A30"
                    stroke="#1E3A5F"
                    strokeWidth="1.5"
                  />
                  {/* Arunachal Mountainous Border */}
                  <path
                    d="M 280,140 Q 420,80 620,90 T 760,110 T 680,190 T 500,190 Z"
                    fill="#0F223D"
                    stroke="#2A5285"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />

                  {/* Road Network Corridors */}
                  {/* Green Accessible Route C */}
                  <path
                    d="M 240,290 C 310,250 420,240 560,200 S 680,150 710,130"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                  {/* Amber At-Risk Route B */}
                  <path
                    d="M 240,290 C 340,320 460,310 540,260 S 640,220 710,130"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="6 4"
                  />
                  {/* Red Blocked Segment NH-415 */}
                  <path
                    d="M 440,235 L 530,215"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Critical Landslide Marker at NH-415 */}
                  <g transform="translate(485, 225)">
                    <circle r="14" fill="#EF4444" fillOpacity="0.25" className="animate-ping" />
                    <circle r="7" fill="#EF4444" stroke="#FFF" strokeWidth="1.5" />
                  </g>

                  {/* Vehicle Markers (Convoys) */}
                  <g transform="translate(360, 260)" className="transition-all duration-1000">
                    <circle r="5" fill="#3B82F6" stroke="#FFF" strokeWidth="1.5" />
                    <text x="8" y="3" fill="#94A3B8" fontSize="9" fontWeight="bold">AS-09-4821</text>
                  </g>
                  <g transform="translate(620, 165)">
                    <circle r="5" fill="#10B981" stroke="#FFF" strokeWidth="1.5" />
                    <text x="8" y="3" fill="#94A3B8" fontSize="9" fontWeight="bold">MED-14 (Safe)</text>
                  </g>
                  <g transform="translate(280, 280)">
                    <circle r="5" fill="#3B82F6" stroke="#FFF" strokeWidth="1.5" />
                    <text x="8" y="3" fill="#94A3B8" fontSize="9" fontWeight="bold">POL-08</text>
                  </g>

                  {/* District / State Hub Labels */}
                  <text x="210" y="310" fill="#E2E8F0" fontSize="11" fontWeight="bold">Guwahati</text>
                  <text x="440" y="275" fill="#94A3B8" fontSize="10">Jorhat</text>
                  <text x="570" y="195" fill="#94A3B8" fontSize="10">Dibrugarh</text>
                  <text x="690" y="125" fill="#E2E8F0" fontSize="11" fontWeight="bold">Pasighat (East Siang)</text>
                  <text x="310" y="155" fill="#64748B" fontSize="10">Itanagar</text>
                </svg>

                {/* Floating Top-Left Network KPI Strip */}
                <div className="absolute top-3 left-3 bg-[#0D1626]/90 border border-white/10 rounded-xl p-2.5 backdrop-blur-md text-left shadow-lg">
                  <div className="text-[10px] uppercase font-bold text-text-muted tracking-wider mb-1">
                    Live Network Status
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div>
                      <span className="text-text-muted text-2xs block">Active Fleet</span>
                      <strong className="text-white text-xs">47 Vehicles</strong>
                    </div>
                    <div>
                      <span className="text-text-muted text-2xs block">Hazard Segments</span>
                      <strong className="text-warning text-xs">8 High-Risk</strong>
                    </div>
                    <div>
                      <span className="text-text-muted text-2xs block">Blockades</span>
                      <strong className="text-danger text-xs">3 Critical</strong>
                    </div>
                    <div>
                      <span className="text-text-muted text-2xs block">At-Risk Cargo</span>
                      <strong className="text-primary text-xs">12 Inbound</strong>
                    </div>
                  </div>
                </div>

                {/* Legend Bottom Left */}
                <div className="absolute bottom-3 left-3 hidden sm:flex items-center gap-3 bg-[#0D1626]/80 border border-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm text-[10px] text-text-muted">
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Safe</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" /> Caution</span>
                  <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500" /> Blocked</span>
                </div>
              </div>

              {/* ── SECTION 3: FLOATING AI COPILOT OVERLAY ── */}
              <div className="rounded-xl border border-primary/30 bg-[#0A1220]/95 p-3 text-left shadow-2xl backdrop-blur-xl relative z-20">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-primary/20 flex items-center justify-center text-primary">
                      <Cpu className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-bold text-white">NER Operations Copilot</span>
                  </div>
                  <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    Context-Aware AI
                  </span>
                </div>

                {/* Chat Log Sequence */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <div className="h-4 w-4 rounded-full bg-white/10 flex items-center justify-center text-[9px] text-text-muted flex-shrink-0 mt-0.5">
                      HQ
                    </div>
                    <div className="bg-surface-2 px-2.5 py-1.5 rounded-lg text-text font-medium text-2xs">
                      “What is the biggest logistics risk right now?”
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <div className="h-4 w-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                      AI
                    </div>
                    <div className="bg-primary/10 border border-primary/20 px-2.5 py-1.5 rounded-lg text-white text-2xs leading-relaxed">
                      <p>
                        <strong className="text-danger">NH-415 in East Siang</strong> has a{' '}
                        <strong className="text-warning">78% landslide risk</strong> due to heavy rainfall (84 mm/h) and steep 24.5° slopes.
                      </p>
                      <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between">
                        <span className="text-emerald-400 font-semibold">
                          Recommended Action: Reroute 7 vehicles through Route C North Bank.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-white/5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/routes')}
                    className="h-6 text-[10px] font-semibold bg-white/5 hover:bg-white/10 border-white/10 text-white"
                  >
                    View Risk Breakdown
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate('/routes')}
                    className="h-6 text-[10px] font-semibold bg-primary hover:bg-primary/90 text-white"
                  >
                    Show Optimal Route C
                  </Button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
