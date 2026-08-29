import { useState } from 'react'
import {
  Sparkles, ShieldAlert, AlertOctagon, AlertTriangle, Navigation,
  Clock, CheckCircle, ChevronRight, Award, ShieldCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import type { RouteOption } from '@/types'

interface RouteSelectionListProps {
  routes: RouteOption[]
  selectedId: string
  onSelectRoute: (id: string) => void
}

export function RouteSelectionList({
  routes,
  selectedId,
  onSelectRoute,
}: RouteSelectionListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-2xs font-bold text-text-muted uppercase tracking-wider">
          Computed Corridors ({routes.length})
        </span>
        <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> AI Ranked
        </span>
      </div>

      <div className="space-y-2">
        {routes.map((r, index) => {
          const isSelected = r.id === selectedId
          const isAI = r.isAIRecommended
          const isHighRisk = r.riskScore >= 75
          const isMedRisk = r.riskScore >= 40 && r.riskScore < 75

          return (
            <div
              key={r.id}
              onClick={() => onSelectRoute(r.id)}
              className={cn(
                'rounded-xl p-3 border transition-all cursor-pointer text-text relative overflow-hidden',
                isSelected
                  ? 'bg-primary/10 border-primary ring-1 ring-primary shadow-md'
                  : isAI
                  ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50'
                  : isHighRisk
                  ? 'bg-rose-500/5 border-rose-500/25 hover:border-rose-500/40'
                  : 'bg-surface-2/60 border-border/70 hover:border-border'
              )}
            >
              {/* Selected indicator bar */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}

              {/* Header: Rank + Title + Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      'h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-black font-mono flex-shrink-0',
                      isAI
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : isHighRisk
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-amber-500/20 text-amber-300'
                    )}
                  >
                    #{index + 1}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate">
                        {r.label.split('—')[0].trim()}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted truncate">
                      {r.label.split('—')[1]?.trim() || r.via.join(' → ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {isAI ? (
                    <Badge variant="success" className="text-[9px] py-0 px-1.5 flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5" /> AI Pick
                    </Badge>
                  ) : isHighRisk ? (
                    <Badge variant="danger" className="text-[9px] py-0 px-1.5">
                      Blocked
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="text-[9px] py-0 px-1.5">
                      Delayed
                    </Badge>
                  )}
                </div>
              </div>

              {/* Metrics strip */}
              <div className="grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-border/50 text-center text-2xs">
                <div>
                  <span className="text-[9px] text-text-dim block">Time</span>
                  <span className="font-semibold text-white font-mono">
                    {Math.floor(r.duration / 60)}h {r.duration % 60}m
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-text-dim block">Distance</span>
                  <span className="font-semibold text-white font-mono">{r.distance} km</span>
                </div>
                <div>
                  <span className="text-[9px] text-text-dim block">Risk</span>
                  <span
                    className={cn(
                      'font-bold font-mono',
                      isAI ? 'text-emerald-400' : isHighRisk ? 'text-rose-400' : 'text-amber-400'
                    )}
                  >
                    {r.riskScore}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
