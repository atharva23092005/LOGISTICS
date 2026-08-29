import {
  Navigation, Clock, Shield, Zap, Award, CheckCircle, ArrowRight,
  ShieldAlert, Sparkles, Mountain
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { RouteOption } from '@/types'
import { formatDuration, formatDistance } from '@/utils/format'

const typeConfig = {
  fastest:     { label: 'Fastest Transit',    icon: Zap,       color: 'text-warning', bg: 'bg-warning/15 border-warning/30' },
  shortest:    { label: 'Shortest Distance',  icon: Navigation, color: 'text-info',    bg: 'bg-info/15 border-info/30' },
  safest:      { label: 'Safest Corridor',    icon: Shield,     color: 'text-success', bg: 'bg-success/15 border-success/30' },
  recommended: { label: 'AI Recommended',     icon: Sparkles,   color: 'text-primary', bg: 'bg-primary/15 border-primary/30' },
}

interface RouteCardProps {
  route: RouteOption
  selected: boolean
  rank: number
  onSelect: (id: string) => void
  onDispatch?: (route: RouteOption) => void
}

export function RouteCard({ route, selected, rank, onSelect, onDispatch }: RouteCardProps) {
  const cfg = typeConfig[route.type] ?? typeConfig.recommended
  const TypeIcon = cfg.icon
  const isHighRisk = route.riskScore >= 75
  const isMedRisk = route.riskScore >= 40

  return (
    <div
      onClick={() => onSelect(route.id)}
      className={cn(
        'app-card p-3 transition-all space-y-2.5 cursor-pointer',
        selected
          ? 'border-primary/60 bg-primary/[0.08] ring-1 ring-primary/40 shadow-md'
          : route.isAIRecommended
          ? 'border-success/40 bg-success/[0.03] hover:border-success/60'
          : isHighRisk
          ? 'border-danger/30 bg-danger/[0.03] hover:border-danger/50'
          : isMedRisk
          ? 'border-warning/25 bg-warning/[0.03] hover:border-warning/45'
          : 'border-border/60 bg-surface hover:border-white/20'
      )}
    >
      {/* ── ROW 1: Header (Rank + Type Icon + Title + AI Pick Badge) ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            'p-1.5 rounded-lg border flex-shrink-0 flex items-center justify-center',
            cfg.bg, cfg.color
          )}>
            <TypeIcon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-2xs font-bold text-text-muted">#{rank}</span>
              <span className="text-xs font-bold text-text truncate">
                {route.label.split('—')[0].trim()}
              </span>
            </div>
            <div className="text-2xs text-text-muted mt-0.5 truncate">
              {route.via.join(' → ')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {route.isAIRecommended && (
            <Badge variant="success" className="text-2xs font-bold px-1.5 py-0 flex items-center gap-1">
              <Award className="h-2.5 w-2.5" />
              AI Pick
            </Badge>
          )}
          {selected && (
            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
          )}
        </div>
      </div>

      {/* ── ROW 2: 3-Tile Metric Readout Grid ── */}
      <div className="grid grid-cols-3 gap-1 text-2xs text-center py-1 px-1.5 rounded-lg bg-surface-2 border border-white/5">
        <div>
          <div className="text-text-dim text-[9px]">Distance</div>
          <div className="font-semibold text-text mt-0.5">{formatDistance(route.distance)}</div>
        </div>
        <div>
          <div className="text-text-dim text-[9px]">Transit ETA</div>
          <div className="font-semibold text-text mt-0.5">{formatDuration(route.duration)}</div>
        </div>
        <div>
          <div className="text-text-dim text-[9px]">Hazard Risk</div>
          <div className={cn(
            'font-bold text-2xs mt-0.5',
            isHighRisk ? 'text-danger' : isMedRisk ? 'text-warning' : 'text-success'
          )}>
            {route.riskScore}%
          </div>
        </div>
      </div>

      {/* ── ROW 3: Hazard Risk Progress Bar ── */}
      <Progress
        value={route.riskScore}
        color={isHighRisk ? 'danger' : isMedRisk ? 'warning' : 'success'}
        className="h-1.5"
      />

      {/* ── ROW 4: Avoided Hazards Chips ── */}
      {route.avoidedHazards && route.avoidedHazards.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap pt-0.5 text-2xs">
          <span className="text-text-dim text-[10px]">Avoids:</span>
          {route.avoidedHazards.map((hazard) => (
            <span
              key={hazard}
              className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-success/15 text-success border border-success/30 inline-flex items-center gap-1"
            >
              <CheckCircle className="h-2.5 w-2.5 inline" />
              <span>{hazard}</span>
            </span>
          ))}
        </div>
      )}

      {/* ── ROW 5: Actions Footer ── */}
      {selected && onDispatch && (
        <div className="pt-1 border-t border-border/50">
          <Button
            size="sm"
            variant={route.isAIRecommended ? 'default' : 'secondary'}
            className="w-full h-7 text-xs font-semibold shadow-sm"
            onClick={(e) => {
              e.stopPropagation()
              onDispatch(route)
            }}
          >
            <Navigation className="h-3 w-3 mr-1" />
            Confirm & Dispatch Convoy
          </Button>
        </div>
      )}
    </div>
  )
}
