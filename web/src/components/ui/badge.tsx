import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-primary/15 text-primary border border-primary/30',
        success:     'bg-success/15 text-success border border-success/30',
        warning:     'bg-warning/15 text-warning border border-warning/30',
        danger:      'bg-danger/15 text-danger border border-danger/30',
        info:        'bg-info/15 text-info border border-info/30',
        muted:       'bg-surface-3 text-text-muted border border-border',
        critical:    'bg-danger text-white',
        emergency:   'bg-danger text-white animate-pulse-border',
        outline:     'border border-border text-text-muted',
        accent:      'bg-accent/15 text-accent border border-accent/30',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, BadgeProps['variant']> = {
    critical: 'danger', warning: 'warning', info: 'info', success: 'success',
  }
  return <Badge variant={map[severity] ?? 'muted'}>{severity.toUpperCase()}</Badge>
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    on_route: 'bg-success', open: 'bg-success', active: 'bg-danger animate-status-pulse',
    delayed: 'bg-warning', partial: 'bg-warning', acknowledged: 'bg-warning',
    stopped: 'bg-danger', blocked: 'bg-danger', offline: 'bg-text-subtle',
    resolved: 'bg-text-subtle', synced: 'bg-success', pending: 'bg-warning', failed: 'bg-danger',
  }
  const labels: Record<string, string> = {
    on_route: 'On Route', open: 'Open', active: 'Active', delayed: 'Delayed',
    partial: 'Partial', acknowledged: 'Acknowledged', stopped: 'Stopped',
    blocked: 'Blocked', offline: 'Offline', resolved: 'Resolved',
    synced: 'Synced', pending: 'Pending', failed: 'Failed',
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-text-muted font-medium">
      <span className={cn('status-dot', colors[status] ?? 'bg-text-subtle')} />
      {labels[status] ?? status}
    </span>
  )
}
