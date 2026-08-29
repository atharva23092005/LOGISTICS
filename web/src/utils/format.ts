import { formatDistanceToNow, format } from 'date-fns'

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'dd MMM, HH:mm')
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function formatDistance(km: number): string {
  return `${km} km`
}

export function riskColor(score: number): string {
  if (score >= 75) return 'text-danger'
  if (score >= 50) return 'text-warning'
  if (score >= 25) return 'text-info'
  return 'text-success'
}

export function riskBg(score: number): string {
  if (score >= 75) return 'bg-danger/10 border-danger/30'
  if (score >= 50) return 'bg-warning/10 border-warning/30'
  if (score >= 25) return 'bg-info/10 border-info/30'
  return 'bg-success/10 border-success/30'
}

export function riskLabel(score: number): string {
  if (score >= 75) return 'CRITICAL'
  if (score >= 50) return 'HIGH'
  if (score >= 25) return 'MEDIUM'
  return 'LOW'
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    open: 'text-success',
    partial: 'text-warning',
    blocked: 'text-danger',
    on_route: 'text-success',
    delayed: 'text-warning',
    stopped: 'text-danger',
    offline: 'text-text-muted',
    emergency: 'text-danger',
    active: 'text-danger',
    acknowledged: 'text-warning',
    resolved: 'text-success',
    synced: 'text-success',
    pending: 'text-warning',
    failed: 'text-danger',
  }
  return map[status] ?? 'text-text-muted'
}

export function priorityColor(priority: string): string {
  const map: Record<string, string> = {
    emergency: 'text-danger',
    high: 'text-warning',
    medium: 'text-info',
    low: 'text-text-muted',
  }
  return map[priority] ?? 'text-text-muted'
}

export function weatherLabel(condition: string): string {
  const map: Record<string, string> = {
    clear: 'Clear Skies',
    cloudy: 'Overcast',
    rain: 'Moderate Rain',
    heavy_rain: 'Heavy Torrential Rain',
    storm: 'Thunderstorm Warning',
    fog: 'Dense Fog / Low Visibility',
  }
  return map[condition] ?? 'Normal'
}

export function weatherIcon(condition: string): string {
  return weatherLabel(condition)
}

