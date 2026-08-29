import { useState } from 'react'
import {
  Sparkles, ShieldCheck, Clock, Navigation, Mountain, CheckCircle2,
  AlertTriangle, Send, Edit3, ChevronRight, MapPin, AlertOctagon,
  TrendingUp, CloudRain, TableProperties, ShieldAlert, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs } from '@/components/ui/tabs'
import { cn } from '@/utils/cn'
import { ElevationProfile } from '@/modules/routing/ElevationProfile'
import { RouteComparisonMatrix } from '@/modules/routing/RouteComparisonMatrix'
import { RiskCard } from '@/components/cards/RiskCard'
import { WeatherIcon } from '@/components/ui/WeatherIcon'
import { mockPredictions } from '@/mock/predictions'
import { mockWeather } from '@/mock/weather'
import type { RouteOption } from '@/types'

interface RouteDetailsPanelProps {
  selectedRoute: RouteOption
  recommendedRoute: RouteOption
  onDispatch: (route: RouteOption) => void
  onOverride: (route: RouteOption) => void
  className?: string
}

const DETAIL_TABS = [
  { id: 'spotlight', label: 'AI Intelligence' },
  { id: 'terrain',   label: 'Terrain & Slope' },
  { id: 'compare',   label: 'Matrix' },
  { id: 'hazards',   label: 'Hazards & Weather' },
]

export function RouteDetailsPanel({
  selectedRoute,
  recommendedRoute,
  onDispatch,
  onOverride,
  className,
}: RouteDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('spotlight')
  const [activeWaypoint, setActiveWaypoint] = useState<number | null>(null)

  const isRecommended = selectedRoute.isAIRecommended
  const isHighRisk = selectedRoute.riskScore >= 75
  const isMedRisk = selectedRoute.riskScore >= 40 && selectedRoute.riskScore < 75

  const maxSlope = selectedRoute.elevationProfile
    ? Math.max(...selectedRoute.elevationProfile.map((p) => p.slope))
    : 7.4
  const peakElev = selectedRoute.elevationProfile
    ? Math.max(...selectedRoute.elevationProfile.map((p) => p.elevationMeters))
    : 750

  return (
    <div className={cn('h-full flex flex-col bg-surface border-l border-border overflow-hidden', className)}>
      {/* ── Panel Header ── */}
      <div className="p-3 border-b border-border bg-surface-2/70 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={cn(
                'p-1.5 rounded-lg border flex items-center justify-center flex-shrink-0',
                isRecommended
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : isHighRisk
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              )}
            >
              {isRecommended ? (
                <Sparkles className="h-4 w-4" />
              ) : isHighRisk ? (
                <AlertOctagon className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-white truncate">
                  {selectedRoute.label.split('—')[0].trim()}
                </h2>
                <Badge
                  variant={isRecommended ? 'success' : isHighRisk ? 'danger' : 'warning'}
                  className="text-[9px] py-0 px-1.5"
                >
                  {isRecommended ? 'AI Optimal' : isHighRisk ? 'Blocked' : 'Delayed'}
                </Badge>
              </div>
              <p className="text-[10px] text-text-muted truncate">
                {selectedRoute.label.split('—')[1]?.trim() || selectedRoute.via.join(' → ')}
              </p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span
              className={cn(
                'text-sm font-black font-mono tabular-nums',
                isRecommended ? 'text-emerald-400' : isHighRisk ? 'text-rose-400' : 'text-amber-400'
              )}
            >
              {selectedRoute.riskScore}%
            </span>
            <div className="text-[9px] text-text-dim">Risk Score</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mt-2.5">
          <Tabs
            tabs={DETAIL_TABS}
            active={activeTab}
            onChange={setActiveTab}
            variant="pill"
          />
        </div>
      </div>

      {/* ── Panel Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* ── TAB 1: AI INTELLIGENCE & REASONING SPOTLIGHT ── */}
        {activeTab === 'spotlight' && (
          <div className="space-y-3.5">
            {/* 1. Scoreboard (4 Metric Tiles) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-surface-2 p-2.5 rounded-xl border border-white/5 text-center space-y-0.5">
                <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Safety Index</div>
                <div
                  className={cn(
                    'text-base font-black font-mono tabular-nums',
                    isRecommended ? 'text-emerald-400' : isHighRisk ? 'text-rose-400' : 'text-amber-400'
                  )}
                >
                  {100 - selectedRoute.riskScore}/100
                </div>
                <div className="text-[9px] text-text-dim font-medium">
                  {isRecommended ? 'Optimal' : isHighRisk ? 'Critical Risk' : 'Caution'}
                </div>
              </div>

              <div className="bg-surface-2 p-2.5 rounded-xl border border-white/5 text-center space-y-0.5">
                <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Transit Time</div>
                <div className="text-base font-black text-white font-mono tabular-nums">
                  {Math.floor(selectedRoute.duration / 60)}h {selectedRoute.duration % 60}m
                </div>
                <div className="text-[9px] text-text-dim">
                  {isRecommended ? 'Passable' : isHighRisk ? '0% Passable' : '+1.5h Delay'}
                </div>
              </div>

              <div className="bg-surface-2 p-2.5 rounded-xl border border-white/5 text-center space-y-0.5">
                <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Distance</div>
                <div className="text-base font-black text-white font-mono tabular-nums">
                  {selectedRoute.distance} km
                </div>
                <div className="text-[9px] text-text-dim">Total Route</div>
              </div>

              <div className="bg-surface-2 p-2.5 rounded-xl border border-white/5 text-center space-y-0.5">
                <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Max Slope</div>
                <div
                  className={cn(
                    'text-base font-black font-mono tabular-nums',
                    maxSlope > 15 ? 'text-rose-400' : 'text-emerald-400'
                  )}
                >
                  {maxSlope}°
                </div>
                <div className="text-[9px] text-text-dim">
                  {maxSlope > 15 ? 'Hazard (>15°)' : 'Safe (<15°)'}
                </div>
              </div>
            </div>

            {/* 2. Visual Waypoint Stepper Ribbon */}
            <div className="bg-surface-2/80 rounded-xl p-2.5 border border-border/60 space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-text-muted">
                <span className="font-semibold uppercase tracking-wider">Corridor Waypoint Flow</span>
                <span className="text-primary font-medium">{selectedRoute.via.length} Verified Sectors</span>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar py-1">
                {selectedRoute.via.map((wp, idx) => {
                  const isFirst = idx === 0
                  const isLast = idx === selectedRoute.via.length - 1
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

            {/* 3. Explainable AI Diagnostic Reasons */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
                <span>{isRecommended ? 'Why AI Selected This Route' : 'Diagnostic Failure Analysis'}</span>
                <span className={isRecommended ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {selectedRoute.whyReasons.length} Key Factors
                </span>
              </div>

              <div
                className={cn(
                  'space-y-2 rounded-xl p-3 border',
                  isRecommended
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : isHighRisk
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-amber-950/20 border-amber-500/30'
                )}
              >
                {selectedRoute.whyReasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs leading-relaxed">
                    {isRecommended ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : isHighRisk ? (
                      <AlertOctagon className="h-3.5 w-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-slate-200">{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Avoided Hazards Chips */}
            {selectedRoute.avoidedHazards && selectedRoute.avoidedHazards.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Critical Disruption Zones Avoided
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRoute.avoidedHazards.map((hazard) => (
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

            {/* 5. Direct Action CTA */}
            <div className="pt-2 border-t border-border flex items-center gap-2">
              {!isRecommended && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-8 px-2.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                  onClick={() => onOverride(selectedRoute)}
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1" />
                  Override AI
                </Button>
              )}

              <Button
                size="sm"
                className={cn(
                  'flex-1 text-xs h-8 font-bold text-white shadow-lg ml-auto',
                  isRecommended
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/50'
                    : 'bg-primary hover:bg-primary-hover shadow-primary/30'
                )}
                onClick={() => onDispatch(selectedRoute)}
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                {isRecommended ? 'Dispatch Optimal Convoy' : 'Dispatch Selected Route'}
              </Button>
            </div>
          </div>
        )}

        {/* ── TAB 2: TOPOGRAPHIC TERRAIN & SLOPE ── */}
        {activeTab === 'terrain' && (
          <ElevationProfile route={selectedRoute} className="w-full" />
        )}

        {/* ── TAB 3: SIDE-BY-SIDE MATRIX ── */}
        {activeTab === 'compare' && (
          <RouteComparisonMatrix onDispatch={onDispatch} className="w-full" />
        )}

        {/* ── TAB 4: HAZARDS & WEATHER RADAR ── */}
        {activeTab === 'hazards' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-2xs font-semibold text-text-muted uppercase tracking-wider">
                Live Disaster Sensor Feeds
              </span>
              <span className="badge-critical text-2xs">Active Radar</span>
            </div>

            {mockPredictions.slice(0, 3).map((p) => (
              <RiskCard key={p.id} prediction={p} showTimeline />
            ))}

            <div className="pt-2 border-t border-border space-y-2">
              <div className="text-2xs font-semibold text-text-muted uppercase tracking-wider px-1">
                District Weather & Rainfall
              </div>

              {mockWeather.slice(0, 4).map((w) => (
                <div key={w.district} className="app-card p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text">{w.district} Sector</span>
                    <WeatherIcon condition={w.condition} className="h-4 w-4" />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-2xs">
                    <span className="text-text-muted">Rainfall</span>
                    <span className="text-text text-right font-medium">{w.rainfall} mm/hr</span>
                    <span className="text-text-muted">Visibility</span>
                    <span className="text-text text-right">{w.visibility} km</span>
                    <span className="text-text-muted">Landslide Risk</span>
                    <span
                      className={cn(
                        'text-right font-bold',
                        w.landslideRisk >= 75 ? 'text-danger' : w.landslideRisk >= 50 ? 'text-warning' : 'text-success'
                      )}
                    >
                      {w.landslideRisk}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
