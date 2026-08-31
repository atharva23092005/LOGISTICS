import {
  AlertTriangle, Info, CheckCircle, XCircle, MapPin,
  Clock, Cpu, Radio, Navigation, Cloud, ArrowRight,
  ShieldAlert, ShieldCheck, Truck, Activity
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { LogisticsAlert } from '@/types'
import { timeAgo } from '@/utils/format'

const sevCfg = {
  critical: {
    icon: XCircle,
    border: 'border-danger/35 bg-danger/[0.04]',
    badge: 'danger' as const,
    dot: 'status-dot-red animate-status-pulse',
    text: 'text-danger',
    progressColor: 'danger' as const
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-warning/30 bg-warning/[0.04]',
    badge: 'warning' as const,
    dot: 'status-dot-amber',
    text: 'text-warning',
    progressColor: 'warning' as const
  },
  info: {
    icon: Info,
    border: 'border-info/25 bg-info/[0.03]',
    badge: 'info' as const,
    dot: 'status-dot-green',
    text: 'text-info',
    progressColor: 'info' as const
  },
}

const statusColor: Record<string, string> = {
  active: 'text-danger',
  acknowledged: 'text-warning',
  resolved: 'text-success'
}

const statusDot: Record<string, string> = {
  active: 'status-dot-red animate-status-pulse',
  acknowledged: 'status-dot-amber',
  resolved: 'status-dot-green'
}

const srcIcon: Record<string, any> = {
  AI: Cpu,
  FIELD: Radio,
  GPS: Navigation,
  WEATHER: Cloud,
  SYSTEM: Info
}

interface AlertCardProps {
  alert: LogisticsAlert
  selected?: boolean
  onSelect?: (a: LogisticsAlert) => void
  onAcknowledge?: (id: string) => void
  onResolve?: (id: string) => void
  onViewMap?: (a: LogisticsAlert) => void
  onEscalate?: (a: LogisticsAlert) => void
  compact?: boolean
}

export function AlertCard({
  alert: a,
  selected,
  onSelect,
  onAcknowledge,
  onResolve,
  onViewMap,
  onEscalate,
  compact
}: AlertCardProps) {
  const sc = sevCfg[a.severity] ?? sevCfg.info
  const Icon = sc.icon
  const SrcIcon = srcIcon[a.source] ?? Info
  const isResolved = a.status === 'resolved'
  const riskValue = a.aiRiskScore ?? (a.severity === 'critical' ? 87 : a.severity === 'warning' ? 54 : 18)

  return (
    <div
      onClick={() => onSelect?.(a)}
      className={cn(
        'app-card p-3 transition-all space-y-2',
        sc.border,
        onSelect && 'cursor-pointer hover:border-primary/40 hover:shadow-sm',
        selected ? 'border-primary bg-primary/[0.08] ring-1 ring-primary/40 shadow-md' : 'hover:border-primary/40',
        isResolved && 'opacity-60 saturate-50 bg-surface'
      )}
    >
      {/* ── ROW 1: Header (Icon + Title + Subtitle vs Badge + Live Status Dot) ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <div className={cn('p-1 rounded-md bg-surface-2 border border-border flex-shrink-0 mt-0.5', sc.text)}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-text truncate leading-tight">
              {a.title}
            </div>
            <div className="text-2xs text-text-muted truncate">
              {a.description}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Badge variant={sc.badge} className="text-2xs font-bold px-1.5 py-0">
            {a.severity === 'critical' ? 'CRIT' : a.severity === 'warning' ? 'WARN' : 'INFO'}
          </Badge>
          <span className={cn('flex items-center gap-1 text-2xs font-semibold', statusColor[a.status] ?? 'text-text-muted')}>
            <span className={cn('status-dot flex-shrink-0', statusDot[a.status] ?? '')} />
            {a.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── ROW 2: Corridor & Location Breadcrumb ── */}
      <div className="flex items-center gap-1.5 text-2xs text-text-muted">
        <span className="status-dot status-dot-green flex-shrink-0" />
        <span className="truncate">{a.locationName ?? 'Regional Arterial Highway'}</span>
        <Navigation className="h-2.5 w-2.5 flex-shrink-0 text-text-dim" />
        <span className="truncate flex items-center gap-1">
          <SrcIcon className="h-2.5 w-2.5 text-text-dim" />
          {a.source} Telemetry
        </span>
      </div>

      {/* ── ROW 3: Hazard Risk Progress Meter ── */}
      <Progress
        value={riskValue}
        color={sc.progressColor}
        className="h-1.5 my-1"
      />

      {/* ── ROW 4: 3-Tile Metric Readout Grid ── */}
      <div className="grid grid-cols-3 gap-1 text-2xs text-center pt-0.5">
        <div>
          <div className="text-text-dim">Hazard Risk</div>
          <div className={cn('font-semibold', sc.text)}>
            {riskValue}% Risk
          </div>
        </div>
        <div>
          <div className="text-text-dim">Convoys Impact</div>
          <div className="font-semibold text-text">
            {a.affectedVehicles && a.affectedVehicles.length > 0 ? `${a.affectedVehicles.length} Units` : 'Clear'}
          </div>
        </div>
        <div>
          <div className="text-text-dim">Logged</div>
          <div className="font-semibold text-text">
            {timeAgo(a.timestamp)}
          </div>
        </div>
      </div>

      {/* ── ROW 5: Optional Expanded Controls / Actions ── */}
      {!compact && a.status === 'active' && (onViewMap || onAcknowledge || onResolve) && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-border/50">
          {onViewMap && a.location && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => { e.stopPropagation(); onViewMap(a) }}
              className="h-6 text-2xs font-semibold flex-1"
            >
              <MapPin className="h-2.5 w-2.5 mr-1" />
              Locate
            </Button>
          )}

          {onAcknowledge && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); onAcknowledge(a.id) }}
              className="h-6 text-2xs font-semibold flex-1"
            >
              <CheckCircle className="h-2.5 w-2.5 mr-1 text-success" />
              Ack
            </Button>
          )}

          {onResolve && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onResolve(a.id) }}
              className="h-6 text-2xs font-semibold text-text-muted hover:text-success"
            >
              <ShieldCheck className="h-2.5 w-2.5 mr-1" />
              Resolve
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
