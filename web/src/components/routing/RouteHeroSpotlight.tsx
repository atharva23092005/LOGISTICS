import { useState } from 'react'
import {
  Sparkles, ShieldCheck, Clock, Navigation, Mountain, CheckCircle2,
  AlertTriangle, Send, Edit3, ChevronRight, Check, MapPin, Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils/cn'
import type { RouteOption } from '@/types'
import { formatDuration, formatDistance } from '@/utils/format'

interface RouteHeroSpotlightProps {
  route: RouteOption
  onDispatch: (route: RouteOption) => void
  onOverride: (route: RouteOption) => void
  onOpenElevation: () => void
}

export function RouteHeroSpotlight({
  route,
  onDispatch,
  onOverride,
  onOpenElevation,
}: RouteHeroSpotlightProps) {
  const [activeWaypoint, setActiveWaypoint] = useState<number | null>(null)

  const isLowRisk = route.riskScore < 30
  const maxSlope = route.elevationProfile
    ? Math.max(...route.elevationProfile.map((p) => p.slope))
    : 7.4
  const peakElev = route.elevationProfile
    ? Math.max(...route.elevationProfile.map((p) => p.elevationMeters))
    : 750

  return (
    <div className="rounded-2xl p-4 border border-emerald-500/35 bg-gradient-to-b from-emerald-950/20 via-surface to-surface shadow-xl space-y-3.5 relative overflow-hidden">
      {/* ── Top Decision Banner ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              AI Optimal Choice
            </span>
            <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/20">
              96% Safety Confidence
            </span>
          </div>

          <h2 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
            {route.label}
          </h2>
          <p className="text-2xs text-text-muted">
            Corridor Verified: North Bank Safe Bypass via SH-15 & NH-27
          </p>
        </div>

        <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      {/* ── 4-Tile Perceptual Metric Scoreboard ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* 1. Hazard Risk */}
        <div className="bg-surface-2 p-2.5 rounded-xl border border-emerald-500/20 text-center space-y-0.5">
          <div className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Hazard Risk</div>
          <div className="text-base font-black text-white font-mono tabular-nums">{route.riskScore}%</div>
          <div className="text-[9px] text-emerald-400 font-semibold flex items-center justify-center gap-0.5">
            <CheckCircle2 className="h-2.5 w-2.5" /> Minimal
          </div>
        </div>

        {/* 2. Transit Time */}
        <div className="bg-surface-2 p-2.5 rounded-xl border border-white/5 text-center space-y-0.5">
          <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Transit Time</div>
          <div className="text-base font-black text-white font-mono tabular-nums">
            {Math.floor(route.duration / 60)}h {route.duration % 60}m
          </div>
          <div className="text-[9px] text-text-muted">100% Passable</div>
        </div>

        {/* 3. Distance */}
        <div className="bg-surface-2 p-2.5 rounded-xl border border-white/5 text-center space-y-0.5">
          <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Distance</div>
          <div className="text-base font-black text-white font-mono tabular-nums">{route.distance} km</div>
          <div className="text-[9px] text-text-muted">North Corridor</div>
        </div>

        {/* 4. Max Slope */}
        <div className="bg-surface-2 p-2.5 rounded-xl border border-white/5 text-center space-y-0.5">
          <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Max Slope</div>
          <div className="text-base font-black text-emerald-400 font-mono tabular-nums">{maxSlope}°</div>
          <div className="text-[9px] text-emerald-400 font-medium">Safe (&lt;15°)</div>
        </div>
      </div>

      {/* ── Visual Waypoint Ribbon (Corridor Stepper) ── */}
      <div className="bg-surface-2/80 rounded-xl p-2.5 border border-border/60 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-text-muted">
          <span className="font-semibold uppercase tracking-wider">Waypoint Transit Ribbon</span>
          <span className="text-emerald-400 font-medium">5 Verified Sectors</span>
        </div>

        <div className="flex items-center justify-between gap-1 overflow-x-auto hide-scrollbar py-1">
          {route.via.map((wp, idx) => {
            const isFirst = idx === 0
            const isLast = idx === route.via.length - 1
            const isHovered = activeWaypoint === idx

            return (
              <div
                key={wp}
                onMouseEnter={() => setActiveWaypoint(idx)}
                onMouseLeave={() => setActiveWaypoint(null)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-lg text-2xs font-mono transition-all flex-shrink-0 cursor-pointer border',
                  isHovered
                    ? 'bg-primary/20 text-white border-primary/50 scale-105'
                    : isFirst
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : isLast
                    ? 'bg-primary/15 text-primary border-primary/30'
                    : 'bg-surface text-text-muted border-border/40 hover:text-white'
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="font-semibold">{wp}</span>
                {!isLast && <ChevronRight className="h-2.5 w-2.5 text-text-dim ml-0.5" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Explainable AI Reasoning Checklist ── */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
          <span>Why AI Recommends This Route</span>
          <span className="text-emerald-400 font-semibold">4 Verification Factors</span>
        </div>

        <div className="space-y-1.5 bg-surface-2/50 rounded-xl p-2.5 border border-border/50">
          {route.whyReasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="text-slate-200 leading-snug">{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Avoided Hazards Chips ── */}
      {route.avoidedHazards && route.avoidedHazards.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
            Critical Disruption Zones Avoided
          </div>
          <div className="flex flex-wrap gap-1.5">
            {route.avoidedHazards.map((hazard) => (
              <span
                key={hazard}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 flex items-center gap-1.5"
              >
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                <span>{hazard}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="pt-2 border-t border-emerald-500/20 flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-8 px-2.5 border-border hover:bg-surface-2 text-text-muted hover:text-white"
          onClick={onOpenElevation}
        >
          <Mountain className="h-3.5 w-3.5 text-primary mr-1" />
          Terrain ({peakElev}m)
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="text-xs h-8 px-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
          onClick={() => onOverride(route)}
        >
          <Edit3 className="h-3.5 w-3.5 mr-1" /> Override
        </Button>

        <Button
          size="sm"
          className="flex-1 text-xs h-8 font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 ml-auto"
          onClick={() => onDispatch(route)}
        >
          <Send className="h-3.5 w-3.5 mr-1" /> Dispatch Convoy
        </Button>
      </div>
    </div>
  )
}
