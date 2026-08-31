import { useState, useEffect, useMemo } from 'react'
import {
  Navigation, CheckCircle2,
  Compass, Radio, AlertTriangle
} from 'lucide-react'
import { cn } from '@/utils/cn'

interface ConvoyTelemetry {
  id: string
  code: string
  name: string
  cargo: string
  temp?: string
  status: 'safe' | 'rerouted' | 'caution'
  progress: number
  speed: number
  altitude: number
  coords: { x: number; y: number }
  origin: string
  destination: string
  eta: string
}

interface HubNode {
  id: string
  name: string
  state: string
  type: 'hq' | 'terminal' | 'depot' | 'staging'
  x: number
  y: number
  status: 'operational' | 'high_alert' | 'watch'
  activeConvoys: number
}

const HUBS: HubNode[] = [
  { id: 'h-ghy', name: 'Guwahati HQ', state: 'Assam', type: 'hq', x: 105, y: 245, status: 'operational', activeConvoys: 8 },
  { id: 'h-tzp', name: 'Tezpur', state: 'Assam', type: 'staging', x: 225, y: 200, status: 'operational', activeConvoys: 4 },
  { id: 'h-ita', name: 'Itanagar', state: 'Arunachal', type: 'depot', x: 295, y: 140, status: 'watch', activeConvoys: 2 },
  { id: 'h-jht', name: 'Jorhat', state: 'Assam', type: 'depot', x: 350, y: 215, status: 'operational', activeConvoys: 5 },
  { id: 'h-dbg', name: 'Dibrugarh', state: 'Assam', type: 'terminal', x: 460, y: 165, status: 'operational', activeConvoys: 3 },
  { id: 'h-psg', name: 'Pasighat', state: 'Arunachal', type: 'terminal', x: 550, y: 115, status: 'operational', activeConvoys: 3 },
  { id: 'h-shl', name: 'Shillong', state: 'Meghalaya', type: 'depot', x: 140, y: 310, status: 'operational', activeConvoys: 2 },
  { id: 'h-slc', name: 'Silchar', state: 'Assam', type: 'depot', x: 250, y: 345, status: 'operational', activeConvoys: 2 },
  { id: 'h-khm', name: 'Kohima', state: 'Nagaland', type: 'depot', x: 435, y: 265, status: 'watch', activeConvoys: 1 },
]

export function HeroMapSimulation({ feed, idx }: { feed: { tone: string; code: string; text: string; tag: string }; idx: number }) {
  const [simTick, setSimTick] = useState(0)
  const [activeLayer, setActiveLayer] = useState<'all' | 'corridors' | 'hazards' | 'fleet'>('all')
  const [selectedItem, setSelectedItem] = useState<{ type: 'convoy' | 'hub' | 'hazard'; id: string } | null>(null)

  // Simulation tick for vehicle animations
  useEffect(() => {
    const timer = setInterval(() => {
      setSimTick((t) => (t + 1) % 1000)
    }, 75)
    return () => clearInterval(timer)
  }, [])

  // Simulated moving convoys with real-time positional interpolation
  const convoys = useMemo<ConvoyTelemetry[]>(() => {
    // Convoy 1: Guwahati -> Tezpur -> Jorhat -> Dibrugarh -> Pasighat (Safe Corridor)
    const t1 = (simTick * 0.0035) % 1
    const p1x = 105 + t1 * (550 - 105)
    const p1y = 245 - Math.sin(t1 * Math.PI) * 65 + (t1 > 0.6 ? (t1 - 0.6) * -35 : 0)

    // Convoy 2: Shillong -> Guwahati -> Tezpur
    const t2 = (simTick * 0.0045 + 0.35) % 1
    const p2x = 140 + t2 * (225 - 140)
    const p2y = 310 - t2 * 110

    // Convoy 3: Bypass route around blocked KM 42 to Itanagar
    const t3 = (simTick * 0.003 + 0.6) % 1
    const p3x = 225 + t3 * (295 - 225)
    const p3y = 200 - t3 * 60 + Math.sin(t3 * Math.PI * 2) * 10

    return [
      {
        id: 'cv-1',
        code: 'AS-09-4821',
        name: 'Cold-Chain Convoy Alpha',
        cargo: 'Critical Vaccines & Plasma',
        temp: '-18.2°C',
        status: 'safe',
        progress: Math.round(t1 * 100),
        speed: 52,
        altitude: 210 + Math.round(t1 * 340),
        coords: { x: p1x, y: p1y },
        origin: 'Guwahati HQ',
        destination: 'Pasighat Relief Center',
        eta: '17:10 (On Time)',
      },
      {
        id: 'cv-2',
        code: 'ML-01-9023',
        name: 'Hill Transport Unit 4',
        cargo: 'Medical Oxygen Cylinders',
        status: 'safe',
        progress: Math.round(t2 * 100),
        speed: 38,
        altitude: 1420 - Math.round(t2 * 1200),
        coords: { x: p2x, y: p2y },
        origin: 'Shillong Mountain Base',
        destination: 'Tezpur Staging',
        eta: '18:45 (Clear)',
      },
      {
        id: 'cv-3',
        code: 'AR-16-1188',
        name: 'Emergency Relief Unit 9',
        cargo: 'Disaster Relief Rations',
        status: 'rerouted',
        progress: Math.round(t3 * 100),
        speed: 41,
        altitude: 480 + Math.round(t3 * 220),
        coords: { x: p3x, y: p3y },
        origin: 'Tezpur Staging',
        destination: 'Itanagar Forward Depot',
        eta: '19:20 (Via Route C Bypass)',
      },
    ]
  }, [simTick])

  const selectedConvoyData = selectedItem?.type === 'convoy' ? convoys.find((c) => c.id === selectedItem.id) : null
  const selectedHubData = selectedItem?.type === 'hub' ? HUBS.find((h) => h.id === selectedItem.id) : null

  return (
    <div className="relative rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-xs dark:border-white/10 dark:bg-ink-800/90">
      
      {/* ── Top Header Rail ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-2 pb-2.5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[10.5px] font-semibold tracking-wider text-ink dark:text-white uppercase">
            NER CORRIDORS · LIVE SIMULATION
          </span>
        </div>

        {/* Minimal Layer Filter Pills */}
        <div className="flex items-center gap-1 rounded-md bg-slate-100/80 p-0.5 dark:bg-ink-900/80 text-[10px] font-mono">
          {(['all', 'corridors', 'hazards', 'fleet'] as const).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={cn(
                'px-2 py-0.5 rounded capitalize transition-all',
                activeLayer === layer
                  ? 'bg-white text-ink shadow-2xs font-semibold dark:bg-ink-700 dark:text-white'
                  : 'text-slate-500 hover:text-ink dark:text-slate-400 dark:hover:text-white'
              )}
            >
              {layer === 'all' ? 'All' : layer}
            </button>
          ))}
        </div>
      </div>

      {/* ── Minimal GIS Map Canvas ── */}
      <div className="relative mt-2.5 overflow-hidden rounded-xl border border-slate-200/70 bg-[#F8FAFB] dark:border-white/5 dark:bg-[#081318]">
        
        <svg
          viewBox="0 0 640 390"
          className="h-[310px] w-full select-none sm:h-[360px]"
          role="img"
          aria-label="Minimal GIS simulation map of North East India corridors"
        >
          {/* ── 1. Coordinate Grid & Marks ── */}
          <g className="text-slate-200/90 dark:text-slate-800/40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 4">
            <line x1="90" y1="0" x2="90" y2="390" />
            <line x1="210" y1="0" x2="210" y2="390" />
            <line x1="330" y1="0" x2="330" y2="390" />
            <line x1="450" y1="0" x2="450" y2="390" />
            <line x1="570" y1="0" x2="570" y2="390" />
            <line x1="0" y1="75" x2="640" y2="75" />
            <line x1="0" y1="155" x2="640" y2="155" />
            <line x1="0" y1="235" x2="640" y2="235" />
            <line x1="0" y1="315" x2="640" y2="315" />
          </g>

          {/* Clean Lat/Long labels */}
          <g className="fill-slate-400/80 dark:fill-slate-600 font-mono text-[7.5px] tracking-wider">
            <text x="95" y="12">91°E</text>
            <text x="215" y="12">92.5°E</text>
            <text x="335" y="12">94°E</text>
            <text x="455" y="12">95.5°E</text>
            <text x="575" y="12">96.8°E</text>
            <text x="6" y="80">28°N</text>
            <text x="6" y="160">27°N</text>
            <text x="6" y="240">26°N</text>
            <text x="6" y="320">25°N</text>
          </g>

          {/* ── 2. Subtle Topographic Elevation Contours (Clean minimal lines) ── */}
          <g fill="none" stroke="#0E5F54" strokeWidth="0.75" strokeOpacity="0.08" className="dark:stroke-white dark:stroke-opacity-[0.06]">
            <path d="M40 230 C 140 190 280 200 390 160 S 530 110 610 80" />
            <path d="M50 260 C 150 220 290 230 400 190 S 540 140 620 110" />
            <path d="M70 290 C 170 250 310 260 420 220 S 560 170 630 140" />
          </g>

          {/* ── 3. Brahmaputra River Course (Delicate, elegant ribbon) ── */}
          <path
            d="M580 90 C530 115 470 135 410 160 S320 185 240 190 S150 225 60 235 S0 240 0 240"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeOpacity="0.45"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="360"
            y="170"
            className="fill-sky-700/60 dark:fill-sky-400/40 font-mono text-[7.5px] font-medium tracking-[0.18em]"
          >
            Brahmaputra
          </text>

          {/* ── 4. Road Logistics Corridors ── */}
          {(activeLayer === 'all' || activeLayer === 'corridors') && (
            <g>
              {/* Secondary Feeder Links */}
              <path d="M140 310 L105 245" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" className="dark:stroke-slate-700" />
              <path d="M140 310 Q195 335 250 345" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" className="dark:stroke-slate-700" />
              <path d="M350 215 Q395 240 435 265" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 3" className="dark:stroke-slate-700" />

              {/* Primary Safe Lifeline Corridor (NH-27 / NH-15) */}
              <path
                d="M105 245 C165 220 195 210 225 200 S305 210 350 215 S415 180 460 165 S515 130 550 115"
                fill="none"
                stroke="#0E5F54"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="dark:stroke-spruce-400"
              />
              <path
                d="M105 245 C165 220 195 210 225 200 S305 210 350 215 S415 180 460 165 S515 130 550 115"
                fill="none"
                stroke="#10B981"
                strokeWidth="1"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />

              {/* Dynamic AI Bypass Route (Route C around Landslide) */}
              <path
                d="M225 200 Q250 165 295 140"
                fill="none"
                stroke="#0284C7"
                strokeWidth="1.75"
                strokeDasharray="3 3"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* ── 5. Minimal Hazards & Disruptions ── */}
          {(activeLayer === 'all' || activeLayer === 'hazards') && (
            <g>
              {/* Landslide Blocked Segment on NH-415 near KM 42 */}
              <g transform="translate(260, 165)">
                <circle r="14" fill="#EF4444" fillOpacity="0.14" className="motion-safe:animate-ping" />
                <circle r="4" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.25" />
                
                {/* Minimalist hazard badge */}
                <g transform="translate(8, -8)">
                  <rect width="84" height="14" rx="3" fill="#DC2626" opacity="0.9" />
                  <text x="5" y="10" fill="#FFFFFF" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                    ⚠ KM 42 LANDSLIDE
                  </text>
                </g>
              </g>

              {/* Floodplain Inundation Risk Area (Kaziranga Zone) */}
              <g transform="translate(285, 215)">
                <ellipse rx="22" ry="9" fill="#F59E0B" fillOpacity="0.15" stroke="#F59E0B" strokeWidth="0.75" strokeDasharray="3 2" />
                <circle cx="0" cy="0" r="2.5" fill="#F59E0B" />
                <text x="6" y="3" fill="#D97706" fontSize="7" fontFamily="monospace" fontWeight="600">
                  Floodplain Watch
                </text>
              </g>
            </g>
          )}

          {/* ── 6. Logistics Hubs & Nodes ── */}
          {HUBS.map((hub) => {
            const isHQ = hub.type === 'hq'
            const isSelected = selectedItem?.type === 'hub' && selectedItem.id === hub.id

            return (
              <g
                key={hub.id}
                transform={`translate(${hub.x}, ${hub.y})`}
                className="cursor-pointer group"
                onClick={() => setSelectedItem({ type: 'hub', id: hub.id })}
              >
                {/* Clean HQ ring */}
                {isHQ && (
                  <circle r="9" fill="#0E5F54" fillOpacity="0.15" className="motion-safe:animate-ping" />
                )}
                
                {/* Hub Node Dot */}
                <circle
                  r={isHQ ? 4.5 : 3.5}
                  fill={isHQ ? '#0E5F54' : '#FFFFFF'}
                  stroke={isHQ ? '#FFFFFF' : '#0E5F54'}
                  strokeWidth="1.5"
                  className={cn(
                    'transition-transform group-hover:scale-125 dark:stroke-spruce-400',
                    isSelected && 'ring-2 ring-emerald-500 scale-125'
                  )}
                />

                {/* Hub Label */}
                <text
                  x={isHQ ? 8 : 7}
                  y={isHQ ? 3.5 : 3}
                  className={cn(
                    'font-sans transition-colors',
                    isHQ
                      ? 'fill-ink dark:fill-white font-bold text-[9.5px]'
                      : 'fill-slate-700 dark:fill-slate-300 font-medium text-[8.5px]'
                  )}
                >
                  {hub.name}
                </text>
              </g>
            )
          })}

          {/* ── 7. Moving Convoys (Fleet Layer) ── */}
          {(activeLayer === 'all' || activeLayer === 'fleet') &&
            convoys.map((c) => {
              const isSelected = selectedItem?.type === 'convoy' && selectedItem.id === c.id
              const isRerouted = c.status === 'rerouted'

              return (
                <g
                  key={c.id}
                  transform={`translate(${c.coords.x}, ${c.coords.y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedItem({ type: 'convoy', id: c.id })}
                >
                  {/* Subtle Halo */}
                  <circle
                    r="7"
                    fill={isRerouted ? '#0284C7' : '#10B981'}
                    fillOpacity="0.2"
                    className="motion-safe:animate-pulse"
                  />
                  
                  {/* Convoy Point */}
                  <circle
                    r="3.5"
                    fill={isRerouted ? '#0284C7' : '#0E5F54'}
                    stroke="#FFFFFF"
                    strokeWidth="1.25"
                    className={cn(
                      'transition-transform group-hover:scale-125 dark:fill-spruce-400',
                      isSelected && 'scale-135 ring-2 ring-white'
                    )}
                  />

                  {/* Clean Convoy Tag */}
                  <g transform="translate(-16, -13)">
                    <rect
                      width="32"
                      height="10"
                      rx="2"
                      fill={isRerouted ? '#0369A1' : '#0F766E'}
                      opacity="0.9"
                    />
                    <text
                      x="16"
                      y="7.5"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="6"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {c.code.split('-')[0]}-{c.code.split('-')[1]}
                    </text>
                  </g>
                </g>
              )
            })}
        </svg>

        {/* ── Interactive Overlaid Telemetry Card (When clicking any entity) ── */}
        {selectedConvoyData && (
          <div className="absolute top-2.5 left-2.5 z-20 max-w-[240px] rounded-lg border border-slate-200/90 bg-white/95 p-2.5 shadow-md backdrop-blur-md dark:border-white/15 dark:bg-ink-900/95">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 dark:border-white/10">
              <div className="flex items-center gap-1.5 font-mono text-[9.5px] font-bold text-spruce dark:text-spruce-300">
                <Navigation className="h-3 w-3" />
                {selectedConvoyData.code}
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-xs text-slate-400 hover:text-ink dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-1.5 space-y-0.5 text-[10.5px]">
              <div className="font-semibold text-ink dark:text-white">{selectedConvoyData.name}</div>
              <div className="text-slate-500 dark:text-slate-400">Cargo: <span className="font-medium text-ink dark:text-slate-200">{selectedConvoyData.cargo}</span></div>
              {selectedConvoyData.temp && (
                <div className="text-slate-500 dark:text-slate-400">Temp: <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{selectedConvoyData.temp}</span></div>
              )}
              <div className="flex justify-between pt-1 font-mono text-[9px] text-slate-500">
                <span>Speed: {selectedConvoyData.speed} km/h</span>
                <span>Alt: {selectedConvoyData.altitude}m</span>
              </div>
              <div className="mt-1 rounded bg-slate-50 p-1 font-mono text-[9px] text-slate-600 dark:bg-ink-800 dark:text-slate-300">
                ETA: {selectedConvoyData.eta}
              </div>
            </div>
          </div>
        )}

        {selectedHubData && (
          <div className="absolute top-2.5 left-2.5 z-20 max-w-[240px] rounded-lg border border-slate-200/90 bg-white/95 p-2.5 shadow-md backdrop-blur-md dark:border-white/15 dark:bg-ink-900/95">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 dark:border-white/10">
              <div className="font-mono text-[9.5px] font-bold text-spruce dark:text-spruce-300">
                {selectedHubData.state} · LOGISTICS NODE
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-xs text-slate-400 hover:text-ink dark:hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-1.5 space-y-0.5 text-[10.5px]">
              <div className="font-semibold text-ink dark:text-white">{selectedHubData.name}</div>
              <div className="text-slate-500 dark:text-slate-400">Active Fleet: <span className="font-mono font-bold text-spruce dark:text-spruce-400">{selectedHubData.activeConvoys} Convoys</span></div>
              <div className="mt-1 flex items-center gap-1 text-[9.5px] text-emerald-600 dark:text-emerald-400 font-mono">
                <CheckCircle2 className="h-2.5 w-2.5" /> Operational
              </div>
            </div>
          </div>
        )}

        {/* ── Minimal Legend & Scale ── */}
        <div className="pointer-events-none absolute bottom-2 left-2 flex items-center gap-2.5 rounded-md border border-slate-200/80 bg-white/90 px-2 py-0.5 backdrop-blur-xs dark:border-white/10 dark:bg-ink-900/90">
          {[
            ['bg-emerald-500', 'Lifeline'],
            ['bg-sky-500', 'Bypass'],
            ['bg-amber-500', 'Flood Watch'],
            ['bg-rose-500', 'Blocked'],
          ].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1 font-mono text-[8px] text-slate-600 dark:text-slate-400">
              <span className={cn('h-1 w-1 rounded-full', c)} />
              {l}
            </span>
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-white/90 px-1.5 py-0.5 font-mono text-[8px] text-slate-500 backdrop-blur-xs dark:border-white/10 dark:bg-ink-900/90 dark:text-slate-400">
          <Compass className="h-2.5 w-2.5 text-spruce dark:text-spruce-400" />
          <span>100 KM</span>
        </div>
      </div>

      {/* ── Live Status Feed Bar ── */}
      <div className="mt-2 flex items-center gap-2.5 rounded-lg bg-slate-50/80 px-2.5 py-1.5 dark:bg-ink-900/60">
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-spruce-500" />
        </span>
        <div key={idx} className="flex min-w-0 flex-1 items-center gap-2">
          <span className="font-mono text-[9.5px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">
            {feed.code}
          </span>
          <span className="truncate text-[11.5px] text-slate-700 dark:text-slate-200">{feed.text}</span>
        </div>
        <span className="flex-shrink-0 font-mono text-[9.5px] font-bold uppercase tracking-wider text-spruce dark:text-spruce-400">
          {feed.tag}
        </span>
      </div>
    </div>
  )
}
