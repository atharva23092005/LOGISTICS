import { cn } from '@/utils/cn'
import type { LucideIcon } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  className?: string
  onClick?: () => void
}

const COLOR_MAP = {
  default: 'text-primary bg-primary/10 border-primary/20',
  success: 'text-success bg-success/10 border-success/20',
  warning: 'text-warning bg-warning/10 border-warning/20',
  danger:  'text-danger bg-danger/10 border-danger/20',
  info:    'text-info bg-info/10 border-info/20',
}

const ICON_COLOR = {
  default: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger:  'text-danger',
  info:    'text-info',
}

export function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  trend,
  trendValue,
  color = 'default',
  className,
  onClick,
}: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface border border-border/80 rounded-xl p-4 transition-all duration-150',
        'hover:border-white/15',
        onClick && 'cursor-pointer hover:bg-surface-2',
        className
      )}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div className={cn('p-2 rounded-lg border', COLOR_MAP[color])}>
          <Icon className={cn('h-4 w-4', ICON_COLOR[color])} />
        </div>
        {trend && trendValue && (
          <span
            className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
              trend === 'up'
                ? 'text-danger bg-danger/10 border-danger/20'
                : trend === 'down'
                ? 'text-success bg-success/10 border-success/20'
                : 'text-text-muted bg-surface-3 border-border'
            )}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white tabular-nums leading-tight mb-0.5">
        {value}
      </div>
      <div className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
        {label}
      </div>
      {sub && <div className="text-[10px] text-text-dim mt-0.5">{sub}</div>}
    </div>
  )
}
