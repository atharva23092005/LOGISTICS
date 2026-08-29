import { cn } from '@/utils/cn'
import type { District } from '@/types'

interface Props {
  district: District
  compact?: boolean
  onClick?: () => void
}

function scoreColor(score: number) {
  if (score >= 80) return { text: 'text-success', bg: 'bg-success', ring: 'border-success/30', label: 'Good' }
  if (score >= 60) return { text: 'text-warning', bg: 'bg-warning', ring: 'border-warning/30', label: 'Fair' }
  if (score >= 40) return { text: 'text-orange-400', bg: 'bg-orange-400', ring: 'border-orange-400/30', label: 'Poor' }
  return           { text: 'text-danger',  bg: 'bg-danger',  ring: 'border-danger/30',  label: 'Critical' }
}

function ScoreBar({ value, label }: { value: number; label: string }) {
  const c = scoreColor(value)
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[10px]">
        <span className="text-text-muted">{label}</span>
        <span className={cn('font-bold', c.text)}>{value}</span>
      </div>
      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', c.bg)}
          style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

/** Circular score gauge rendered as SVG */
function ScoreGauge({ score, size = 56 }: { score: number; size?: number }) {
  const c = scoreColor(score)
  const r = (size - 8) / 2
  const circumference = 2 * Math.PI * r
  const dash = (score / 100) * circumference
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#1E293B" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" strokeWidth={6}
          className={c.text.replace('text-', 'stroke-')}
          stroke="currentColor"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold leading-none tabular-nums', c.text,
          size >= 56 ? 'text-base' : 'text-xs')}>{score}</span>
        {size >= 56 && <span className="text-[8px] text-text-subtle mt-0.5">/100</span>}
      </div>
    </div>
  )
}

export function DistrictHealthCard({ district: d, compact = false, onClick }: Props) {
  const h = d.healthScore
  const c = scoreColor(h.overall)

  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all hover:bg-surface-2 text-left',
          c.ring
        )}
      >
        <ScoreGauge score={h.overall} size={40} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-text truncate">{d.name}</div>
          <div className="text-[10px] text-text-muted">{d.state}</div>
        </div>
        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full border', c.text, c.ring, c.bg + '/10')}>
          {c.label}
        </span>
      </button>
    )
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface border rounded-xl p-4 space-y-3',
        c.ring,
        onClick && 'cursor-pointer hover:bg-surface-2 transition-all'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <ScoreGauge score={h.overall} size={56} />
        <div>
          <div className="text-sm font-bold text-text">{d.name}</div>
          <div className="text-xs text-text-muted">{d.state}</div>
          <span className={cn('inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 border',
            c.text, c.ring, c.bg + '/10')}>
            {c.label}
          </span>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="space-y-1.5 pt-1 border-t border-border">
        <ScoreBar value={h.roads}     label="Roads" />
        <ScoreBar value={h.weather}   label="Weather" />
        <ScoreBar value={h.fleet}     label="Fleet" />
        <ScoreBar value={h.incidents} label="Incidents" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-1 text-center text-[10px] border-t border-border pt-2">
        <div>
          <div className="font-bold text-text tabular-nums">{d.activeVehicles}</div>
          <div className="text-text-muted">Vehicles</div>
        </div>
        <div>
          <div className={cn('font-bold tabular-nums', d.blockedRoads > 0 ? 'text-danger' : 'text-success')}>
            {d.blockedRoads}
          </div>
          <div className="text-text-muted">Blocked</div>
        </div>
        <div>
          <div className={cn('font-bold tabular-nums', d.activeAlerts > 2 ? 'text-danger' : d.activeAlerts > 0 ? 'text-warning' : 'text-success')}>
            {d.activeAlerts}
          </div>
          <div className="text-text-muted">Alerts</div>
        </div>
      </div>
    </div>
  )
}

/** Mini row used in Sidebar / overview lists */
export function DistrictHealthRow({ district: d }: { district: District }) {
  const c = scoreColor(d.healthScore.overall)
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full flex-shrink-0', c.bg)} />
        <span className="text-xs text-text">{d.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn('text-xs font-bold tabular-nums', c.text)}>{d.healthScore.overall}</span>
        <div className="w-16 h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full', c.bg)} style={{ width: `${d.healthScore.overall}%` }} />
        </div>
      </div>
    </div>
  )
}
