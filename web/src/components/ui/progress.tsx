import { cn } from '@/utils/cn'

interface ProgressProps {
  value: number; max?: number; className?: string
  barClassName?: string; showLabel?: boolean
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
}

export function Progress({ value, max = 100, className, barClassName, showLabel, color = 'default' }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const autoColor = color === 'default'
    ? pct >= 75 ? 'bg-danger' : pct >= 50 ? 'bg-warning' : 'bg-success'
    : { success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', info: 'bg-info', primary: 'bg-primary' }[color]
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-surface-4 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barClassName ?? autoColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-2xs text-text-muted tabular-nums w-8 text-right">{Math.round(pct)}%</span>}
    </div>
  )
}

export function RiskBar({ score, className }: { score: number; className?: string }) {
  const color = score >= 75 ? 'bg-danger' : score >= 50 ? 'bg-warning' : score >= 25 ? 'bg-info' : 'bg-success'
  const textColor = score >= 75 ? 'text-danger' : score >= 50 ? 'text-warning' : score >= 25 ? 'text-info' : 'text-success'
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-2 bg-surface-4 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${score}%` }} />
      </div>
      <span className={cn('text-xs font-bold tabular-nums w-8 text-right', textColor)}>{score}%</span>
    </div>
  )
}
