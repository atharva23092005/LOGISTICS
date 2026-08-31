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
        'rounded-2xl p-4 border border-slate-200/90 dark:border-border shadow-2xl bg-white/95 dark:bg-surface/95 backdrop-blur-xl text-text space-y-3.5 ring-1 ring-black/5 dark:ring-white/10',
        className
      )}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/30 text-primary shadow-2xs">
            <Mountain className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-text flex items-center gap-2">
              <span>Elevation Profile & Terrain Gradient</span>
              <span className={cn(
                'text-[9px] font-semibold px-2 py-0.5 rounded-full border',
                route.isAIRecommended ? 'text-emerald-600 dark:text-success bg-emerald-50 dark:bg-success/10 border-emerald-200 dark:border-success/30' : 'text-amber-700 dark:text-warning bg-amber-50 dark:bg-warning/10 border-amber-200 dark:border-warning/30'
              )}>
                {route.label.split('—')[0].trim()}
              </span>
            </div>
            <div className="text-2xs text-text-muted mt-0.5">
              Corridor altitude variance & slope failure trigger analysis
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-slate-100 dark:hover:bg-surface-2 transition-colors"
            title="Close Profile"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Key Terrain Metric Chips ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-slate-50 dark:bg-surface-2 border border-slate-200/90 dark:border-border/80 p-2.5 rounded-xl shadow-2xs">
          <div className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
            <Mountain className="h-3.5 w-3.5 text-primary flex-shrink-0" /> Peak Altitude
          </div>
          <div className="text-sm font-bold text-text mt-1">
            {maxElev} <span className="text-2xs font-normal text-text-dim">meters</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-surface-2 border border-slate-200/90 dark:border-border/80 p-2.5 rounded-xl shadow-2xs">
          <div className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-success flex-shrink-0" /> Total Ascent
          </div>
          <div className="text-sm font-bold text-text mt-1">
            +{totalAscent} <span className="text-2xs font-normal text-text-dim">m</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-surface-2 border border-slate-200/90 dark:border-border/80 p-2.5 rounded-xl shadow-2xs">
          <div className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
            <AlertTriangle className={cn('h-3.5 w-3.5 flex-shrink-0', isHighRiskSlope ? 'text-danger' : 'text-warning')} /> Max Gradient
          </div>
          <div className={cn('text-sm font-bold mt-1', isHighRiskSlope ? 'text-danger' : 'text-text')}>
            {maxSlope}° <span className="text-2xs font-normal text-text-dim">{isHighRiskSlope ? '(Hazard)' : '(Safe)'}</span>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-surface-2 border border-slate-200/90 dark:border-border/80 p-2.5 rounded-xl shadow-2xs">
          <div className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-info flex-shrink-0" /> Avg Slope
          </div>
          <div className="text-sm font-bold text-text mt-1">
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
              axisLine={{ stroke: 'rgb(var(--border))' }}
            />
            <YAxis
              unit="m"
              stroke="#64748B"
              fontSize={10}
              domain={[0, Math.ceil(maxElev * 1.15)]}
              tickLine={false}
              axisLine={{ stroke: 'rgb(var(--border))' }}
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

      {/* ── Legend / Explanatory Footer ───────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-2xs text-text-muted pt-2 border-t border-slate-200 dark:border-border gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block" />
            <span>Elevation Curve (meters)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-danger inline-block" />
            <span>Landslide Hazard Point</span>
          </div>
        </div>

        <div className="text-[11px] text-text-dim flex items-center gap-1">
          <Info className="h-3.5 w-3.5 text-primary flex-shrink-0" />
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
    <div className="p-3 rounded-xl border border-slate-200 dark:border-border shadow-xl bg-white/95 dark:bg-surface/95 backdrop-blur-md text-text text-xs space-y-1.5 max-w-xs">
      <div className="font-bold text-text text-2xs border-b border-slate-200 dark:border-border pb-1 flex items-center gap-1.5">
        <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        <span>{data.locationName}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <div className="text-text-muted">Distance:</div>
        <div className="font-semibold text-text text-right">{data.distanceKm} km</div>
        <div className="text-text-muted">Altitude:</div>
        <div className="font-semibold text-primary text-right">{data.elevationMeters} m</div>
        <div className="text-text-muted">Slope Gradient:</div>
        <div className={cn('font-semibold text-right', data.slope > 15 ? 'text-danger' : 'text-emerald-600 dark:text-success')}>
          {data.slope}°
        </div>
      </div>
      {isHazard && (
        <div className="mt-1 pt-1 border-t border-rose-200 dark:border-danger/20 text-[10px] text-rose-700 dark:text-danger font-medium leading-tight flex items-start gap-1">
          <AlertTriangle className="h-3.5 w-3.5 text-danger flex-shrink-0 mt-0.5" />
          <span>{data.hazardWarning}</span>
        </div>
      )}
    </div>
  )
}
