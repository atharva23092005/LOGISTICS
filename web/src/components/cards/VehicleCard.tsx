import {
  MapPin, Navigation, RotateCcw, Phone, Clock,
  Truck, HeartPulse, Fuel, ShieldAlert, User as UserIcon
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Vehicle } from '@/types'
import { formatDuration, formatDistance, timeAgo } from '@/utils/format'

const priorityBadge = {
  emergency: 'danger' as const,
  high: 'warning' as const,
  medium: 'info' as const,
  low: 'muted' as const
}

const statusColor = {
  on_route: 'text-success',
  delayed: 'text-warning',
  stopped: 'text-danger',
  offline: 'text-text-muted',
  emergency: 'text-danger'
}

const statusDot = {
  on_route: 'status-dot-green',
  delayed: 'status-dot-amber',
  stopped: 'status-dot-red animate-status-pulse',
  offline: '',
  emergency: 'status-dot-red animate-status-pulse'
}

const vehicleIcon: Record<string, any> = {
  truck: Truck,
  van: Truck,
  ambulance: HeartPulse,
  tanker: Fuel,
  rescue: ShieldAlert
}

interface VehicleCardProps {
  vehicle: Vehicle
  onSelect?: (v: Vehicle) => void
  onReroute?: (v: Vehicle) => void
  onContact?: (v: Vehicle) => void
  selected?: boolean
  compact?: boolean
}

export function VehicleCard({
  vehicle: v,
  onSelect,
  onReroute,
  onContact,
  selected,
  compact
}: VehicleCardProps) {
  const etaMs   = new Date(v.eta).getTime() - Date.now()
  const etaMins = Math.max(0, Math.floor(etaMs / 60000))
  const Icon = vehicleIcon[v.type] ?? Truck
  const isStopped = v.status === 'stopped' || v.priority === 'emergency'
  const isDelayed = v.status === 'delayed' || v.priority === 'high'

  return (
    <div
      onClick={() => onSelect?.(v)}
      className={cn(
        'app-card p-3 transition-all space-y-2',
        onSelect && 'cursor-pointer hover:border-white/20',
        selected
          ? 'border-primary/60 bg-primary/[0.08] ring-1 ring-primary/40 shadow-md'
          : isStopped
          ? 'border-danger/35 bg-danger/[0.04]'
          : isDelayed
          ? 'border-warning/30 bg-warning/[0.04]'
          : 'border-border/60 bg-surface'
      )}
    >
      {/* ── ROW 1: Header (Icon + Reg No + Cargo vs Priority Badge + Status Dot) ── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            'p-1.5 rounded-md border flex-shrink-0',
            isStopped ? 'bg-danger/15 border-danger/30 text-danger' :
            isDelayed ? 'bg-warning/15 border-warning/30 text-warning' :
            'bg-surface-2 border-white/5 text-primary'
          )}>
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-text leading-tight truncate">
              {v.registrationNo}
            </div>
            <div className="text-2xs text-text-muted truncate">
              {v.cargo}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {v.priority === 'emergency' && (
            <Badge variant="danger" className="text-2xs font-bold px-1.5 py-0">
              EMRG
            </Badge>
          )}
          <span className={cn('flex items-center gap-1 text-2xs font-semibold', statusColor[v.status])}>
            <span className={cn('status-dot flex-shrink-0', statusDot[v.status])} />
            {v.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── ROW 2: Waypoint Route Path ── */}
      <div className="flex items-center gap-1.5 text-2xs text-text-muted">
        <span className="status-dot status-dot-green flex-shrink-0" />
        <span className="truncate">{v.origin}</span>
        <Navigation className="h-2.5 w-2.5 flex-shrink-0 text-text-dim" />
        <span className="truncate">{v.destination}</span>
      </div>

      {/* ── ROW 3: Progress Bar ── */}
      <Progress
        value={v.progress}
        color={isStopped ? 'danger' : isDelayed ? 'warning' : 'success'}
        className="h-1.5 my-1"
      />

      {/* ── ROW 4: 3-Tile Metric Readout Grid ── */}
      <div className="grid grid-cols-3 gap-1 text-2xs text-center pt-0.5">
        <div>
          <div className="text-text-dim">Speed</div>
          <div className="font-semibold text-text">{v.speed} km/h</div>
        </div>
        <div>
          <div className="text-text-dim">Transit ETA</div>
          <div className="font-semibold text-text">{formatDuration(etaMins)}</div>
        </div>
        <div>
          <div className="text-text-dim">Remaining</div>
          <div className="font-semibold text-text">{formatDistance(v.distanceRemaining)}</div>
        </div>
      </div>

      {/* ── ROW 5: Driver & Actions Footer ── */}
      {!compact && (
        <>
          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-2xs text-text-muted">
            <span className="flex items-center gap-1">
              <UserIcon className="h-3 w-3 text-text-dim" />
              {v.driver}
            </span>
            <span>Updated {timeAgo(v.lastUpdate)}</span>
          </div>

          {(onReroute || onContact) && (
            <div className="flex gap-1.5 pt-1">
              {v.status !== 'on_route' && onReroute && (
                <Button
                  size="sm"
                  variant="warning"
                  className="flex-1 h-6 text-2xs font-semibold"
                  onClick={e => { e.stopPropagation(); onReroute(v) }}
                >
                  <RotateCcw className="h-2.5 w-2.5 mr-1" />
                  Reroute Detour
                </Button>
              )}
              {onContact && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-2xs font-semibold"
                  onClick={e => { e.stopPropagation(); onContact(v) }}
                >
                  <Phone className="h-2.5 w-2.5 mr-1" />
                  Radio
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
