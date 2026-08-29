import { useState } from 'react'
import {
  AlertOctagon, AlertTriangle, Clock, Navigation, Mountain, CheckCircle2,
  ChevronRight, ArrowRight, ShieldAlert, Edit3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import type { RouteOption } from '@/types'

interface RouteAlternativeCardProps {
  route: RouteOption
  isSelected: boolean
  onSelect: (route: RouteOption) => void
  onOverride: (route: RouteOption) => void
}

export function RouteAlternativeCard({
  route,
  isSelected,
  onSelect,
  onOverride,
}: RouteAlternativeCardProps) {
  const isCriticalBlocked = route.riskScore >= 75
  const isModerateDelay = route.riskScore >= 40 && route.riskScore < 75

  const maxSlope = route.elevationProfile
    ? Math.max(...route.elevationProfile.map((p) => p.slope))
    : 14.5

  return (
    <div
      onClick={() => onSelect(route)}
      className={cn(
        'rounded-2xl p-3.5 border transition-all space-y-2.5 cursor-pointer text-text',
        isSelected
          ? 'bg-surface-2 border-primary ring-1 ring-primary shadow-lg'
          : isCriticalBlocked
          ? 'bg-gradient-to-b from-rose-950/20 to-surface border-rose-500/30 hover:border-rose-500/50'
          : 'bg-gradient-to-b from-amber-950/15 to-surface border-amber-500/30 hover:border-amber-500/50'
      )}
    >
      {/* ── Header: Route Name + Diagnostic Status Badge ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={cn(
                'text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1',
                isCriticalBlocked
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              )}
            >
              {isCriticalBlocked ? (
                <>
                  <AlertOctagon className="h-3 w-3 text-rose-400" />
                  Blocked by Landslide
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                  Heavy Congestion / Delay
                </>
              )}
            </span>

            <span className="text-[10px] font-mono text-text-muted">
              {route.label.split('—')[0].trim()}
            </span>
          </div>

          <h3 className="text-xs font-bold text-white tracking-tight">
            {route.label.split('—')[1]?.trim() || route.label}
          </h3>
        </div>

        <div className="text-right flex-shrink-0">
          <span
            className={cn(
              'text-sm font-black font-mono tabular-nums',
              isCriticalBlocked ? 'text-rose-400' : 'text-amber-400'
            )}
          >
            {route.riskScore}% Risk
          </span>
          <div className="text-[9px] text-text-dim">Hazard Exposure</div>
        </div>
      </div>

      {/* ── Metric Comparison Strip ── */}
      <div className="grid grid-cols-3 gap-1.5 text-center text-2xs bg-surface-2/80 rounded-xl p-2 border border-border/50">
        <div>
          <span className="text-[9px] text-text-muted block">Duration</span>
          <strong className="text-white font-mono">
            {Math.floor(route.duration / 60)}h {route.duration % 60}m
          </strong>
        </div>
        <div>
          <span className="text-[9px] text-text-muted block">Distance</span>
          <strong className="text-white font-mono">{route.distance} km</strong>
        </div>
        <div>
          <span className="text-[9px] text-text-muted block">Max Slope</span>
          <strong className={cn('font-mono', maxSlope > 15 ? 'text-rose-400' : 'text-amber-400')}>
            {maxSlope}° {maxSlope > 15 ? '(Hazard)' : '(Caution)'}
          </strong>
        </div>
      </div>

      {/* ── Diagnostic Failure Point ── */}
      <div
        className={cn(
          'p-2 rounded-xl text-2xs leading-relaxed border space-y-1',
          isCriticalBlocked
            ? 'bg-rose-950/40 border-rose-500/20 text-rose-200'
            : 'bg-amber-950/30 border-amber-500/20 text-amber-200'
        )}
      >
        <div className="font-bold flex items-center gap-1">
          <ShieldAlert className="h-3 w-3 flex-shrink-0" />
          <span>Why AI Demoted This Route:</span>
        </div>
        <p className="text-[11px] text-slate-300">
          {route.whyReasons[0] || 'High vulnerability to monsoonal rainfall and infrastructure bottlenecks.'}
        </p>
      </div>

      {/* ── Footer Actions ── */}
      <div className="flex items-center justify-between pt-1 text-2xs text-text-muted border-t border-border/40">
        <span className="truncate max-w-[200px]">
          Via: {route.via.slice(0, 3).join(' → ')}…
        </span>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-[10px] text-amber-400 hover:text-amber-300"
            onClick={(e) => {
              e.stopPropagation()
              onOverride(route)
            }}
          >
            <Edit3 className="h-2.5 w-2.5 mr-0.5" /> Override
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="h-6 px-2 text-[10px] font-semibold"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(route)
            }}
          >
            Inspect
          </Button>
        </div>
      </div>
    </div>
  )
}
