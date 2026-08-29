import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot
} from 'recharts'
import {
  Mountain, TrendingUp, AlertTriangle, ShieldCheck,
  ChevronDown, X, Info, MapPin
} from 'lucide-react'
import { cn } from '@/utils/cn'
import type { RouteOption } from '@/types'

interface ElevationProfileProps {
  route: RouteOption
  className?: string
  onClose?: () => void
}

export function ElevationProfile({ route, className, onClose }: ElevationProfileProps) {
  const profile = route.elevationProfile || []

  if (profile.length === 0) {
    return null
  }

  // Calculate terrain metrics
  const maxElev = Math.max(...profile.map((p) => p.elevationMeters))
  const minElev = Math.min(...profile.map((p) => p.elevationMeters))
  const maxSlope = Math.max(...profile.map((p) => p.slope))
  const avgSlope = (profile.reduce((acc, p) => acc + p.slope, 0) / profile.length).toFixed(1)
  const totalAscent = Math.max(0, maxElev - minElev)

  const isHighRiskSlope = maxSlope > 15.0

  return (
    <div
      className={cn(
        'glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl bg-[#0D1626]/95 backdrop-blur-xl text-text space-y-3.5',
        className
      )}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary">
            <Mountain className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Elevation Profile & Terrain Gradient</span>
              <span className={cn(
                'text-[9px] font-semibold px-2 py-0.5 rounded-full border',
                route.isAIRecommended ? 'text-success bg-success/10 border-success/30' : 'text-warning bg-warning/10 border-warning/30'
              )}>
                {route.label.split('—')[0].trim()}
              </span>
            </div>
            <div className="text-[10px] text-text-muted">
              Corridor altitude variance & slope failure trigger analysis
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Key Terrain Metric Chips ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
          <div className="text-[10px] text-text-muted flex items-center gap-1">
            <Mountain className="h-3 w-3 text-primary" /> Peak Altitude
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {maxElev} <span className="text-2xs font-normal text-text-dim">meters</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
          <div className="text-[10px] text-text-muted flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-success" /> Total Ascent
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            +{totalAscent} <span className="text-2xs font-normal text-text-dim">m</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
          <div className="text-[10px] text-text-muted flex items-center gap-1">
            <AlertTriangle className={cn('h-3 w-3', isHighRiskSlope ? 'text-danger' : 'text-warning')} /> Max Gradient
          </div>
          <div className={cn('text-sm font-bold mt-0.5', isHighRiskSlope ? 'text-danger' : 'text-white')}>
            {maxSlope}° <span className="text-2xs font-normal text-text-dim">{isHighRiskSlope ? '(Hazard)' : '(Safe)'}</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
          <div className="text-[10px] text-text-muted flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-info" /> Avg Slope
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {avgSlope}° <span className="text-2xs font-normal text-text-dim">gradient</span>
          </div>
        </div>
      </div>

      {/* ── Recharts Elevation Area Graph ─────────────────────────────────── */}
      <div className="h-44 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={profile} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="distanceKm"
              unit=" km"
              stroke="#64748B"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1F3352' }}
            />
            <YAxis
              unit="m"
              stroke="#64748B"
              fontSize={10}
              domain={[0, Math.ceil(maxElev * 1.15)]}
              tickLine={false}
              axisLine={{ stroke: '#1F3352' }}
            />
            <Tooltip content={<CustomElevationTooltip />} />
            <Area
              type="monotone"
              dataKey="elevationMeters"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#elevationGrad)"
            />
            {profile.map((p, idx) => {
              if (p.hazardWarning) {
                return (
                  <ReferenceDot
                    key={idx}
                    x={p.distanceKm}
                    y={p.elevationMeters}
                    r={5}
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />
                )
              }
              return null
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend & Summary Note ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-2xs text-text-muted pt-1 border-t border-white/5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" /> Elevation Curve (meters)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-danger" /> Landslide Hazard Point
          </span>
        </div>
        <div className="flex items-center gap-1 text-text-dim">
          <Info className="h-3 w-3 text-primary" />
          <span>Slopes &gt; 15° significantly elevate landslide trigger risks during monsoon.</span>
        </div>
      </div>
    </div>
  )
}

function CustomElevationTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload
  const isHazard = Boolean(data.hazardWarning)

  return (
    <div className="glass-panel p-2.5 rounded-xl border border-white/10 shadow-xl bg-[#0D1626]/95 backdrop-blur-md text-text text-xs space-y-1 max-w-xs">
      <div className="font-bold text-white text-2xs border-b border-white/10 pb-1 flex items-center gap-1">
        <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
        <span>{data.locationName}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px]">
        <div className="text-text-muted">Distance:</div>
        <div className="font-semibold text-white text-right">{data.distanceKm} km</div>
        <div className="text-text-muted">Altitude:</div>
        <div className="font-semibold text-primary text-right">{data.elevationMeters} m</div>
        <div className="text-text-muted">Slope Gradient:</div>
        <div className={cn('font-semibold text-right', data.slope > 15 ? 'text-danger' : 'text-success')}>
          {data.slope}°
        </div>
      </div>
      {isHazard && (
        <div className="mt-1 pt-1 border-t border-danger/20 text-[10px] text-danger font-medium leading-tight flex items-start gap-1">
          <AlertTriangle className="h-3 w-3 text-danger flex-shrink-0 mt-0.5" />
          <span>{data.hazardWarning}</span>
        </div>
      )}
    </div>
  )
}
