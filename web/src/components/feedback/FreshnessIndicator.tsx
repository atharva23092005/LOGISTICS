/**
 * FreshnessIndicator — Data confidence + staleness badge
 * Shows how recent data is and confidence level.
 */
import { cn } from '@/utils/cn'
import { formatDistanceToNow } from 'date-fns'

interface Props {
  lastUpdated: string      // ISO string
  confidence?: number      // 0–100, optional
  source?: string          // e.g. "Field Officer", "AI Model"
  compact?: boolean
  className?: string
}

function staleness(isoDate: string): { label: string; color: string; dot: string } {
  const mins = (Date.now() - new Date(isoDate).getTime()) / 60000
  if (mins < 15)  return { label: 'Live',   color: 'text-success', dot: 'bg-success' }
  if (mins < 60)  return { label: 'Recent', color: 'text-info',    dot: 'bg-info'    }
  if (mins < 180) return { label: 'Stale',  color: 'text-warning', dot: 'bg-warning' }
  return             { label: 'Outdated', color: 'text-danger',  dot: 'bg-danger animate-pulse' }
}

export function FreshnessIndicator({ lastUpdated, confidence, source, compact, className }: Props) {
  const s   = staleness(lastUpdated)
  const ago = formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })

  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1 text-[9px]', s.color, className)}>
        <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', s.dot)} />
        {s.label}
      </span>
    )
  }

  return (
    <div className={cn('flex items-center gap-2 text-[10px]', className)}>
      <span className={cn('flex items-center gap-1', s.color)}>
        <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', s.dot)} />
        {s.label} · {ago}
      </span>
      {source && <span className="text-text-subtle">· {source}</span>}
      {confidence !== undefined && (
        <span className={cn('font-semibold',
          confidence >= 85 ? 'text-success' : confidence >= 70 ? 'text-info' : 'text-warning')}>
          {confidence}% confidence
        </span>
      )}
    </div>
  )
}

/** Inline version for use inside popups / small cards */
export function DataConfidenceBadge({ confidence, className }: { confidence: number; className?: string }) {
  const color = confidence >= 85 ? 'text-success bg-success/10 border-success/20'
    : confidence >= 70 ? 'text-info bg-info/10 border-info/20'
    : 'text-warning bg-warning/10 border-warning/20'
  return (
    <span className={cn('inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border', color, className)}>
      {confidence}% data confidence
    </span>
  )
}
