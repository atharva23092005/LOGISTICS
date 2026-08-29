/**
 * CopilotPanel — AI Operations Copilot
 * Derives proactive recommendations from live store state.
 * Shows ranked actions with Accept / Dismiss.
 */
import { useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Cpu, ChevronRight, X, CheckCircle, AlertTriangle, Navigation,
  Truck, CloudRain, HeartPulse, Mountain, Ban, AlertOctagon
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useAlertStore }   from '@/stores/alertStore'
import { useRouteStore }   from '@/stores/routeStore'
import { mockPredictions } from '@/mock/predictions'
import type { CopilotRecommendation } from '@/types'

// Module-level selectors
const selVehicles = (s: ReturnType<typeof useVehicleStore.getState>) => s.vehicles
const selAlerts   = (s: ReturnType<typeof useAlertStore.getState>)   => s.alerts
const selRoads    = (s: ReturnType<typeof useRouteStore.getState>)   => s.roads

function renderCopilotIcon(icon: string) {
  switch (icon) {
    case 'heart-pulse':
    case 'ambulance':
    case '🚑':
      return <HeartPulse className="h-3.5 w-3.5 text-danger flex-shrink-0" />
    case 'mountain':
    case '⛰️':
      return <Mountain className="h-3.5 w-3.5 text-warning flex-shrink-0" />
    case 'alert':
    case '⚠️':
      return <AlertTriangle className="h-3.5 w-3.5 text-warning flex-shrink-0" />
    case 'truck':
    case '🚛':
      return <Truck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
    case 'ban':
    case '🚫':
      return <Ban className="h-3.5 w-3.5 text-danger flex-shrink-0" />
    case 'octagon':
    case '🔴':
    default:
      return <AlertOctagon className="h-3.5 w-3.5 text-danger flex-shrink-0" />
  }
}

function useCopilotRecommendations(): CopilotRecommendation[] {
  const vehicles = useVehicleStore(selVehicles)
  const alerts   = useAlertStore(selAlerts)
  const roads    = useRouteStore(selRoads)

  return useMemo(() => {
    const recs: CopilotRecommendation[] = []

    // 1 — Emergency vehicles stopped
    const strandedEmergency = vehicles.filter(v => v.priority === 'emergency' && v.status === 'stopped')
    strandedEmergency.forEach(v => {
      recs.push({
        id: `reroute-${v.id}`,
        priority: 'critical',
        title: `Reroute ${v.registrationNo}`,
        description: `${v.cargo} convoy stranded. NH-6 safe corridor available (Risk 22%).`,
        action: 'reroute',
        actionLabel: 'Reroute Now',
        icon: 'heart-pulse',
        relatedVehicleIds: [v.id],
        relatedRoadId: v.affectedByRoadId,
      })
    })

    // 2 — Critical AI predictions
    mockPredictions
      .filter(p => p.riskLevel === 'critical' && p.riskScore >= 80)
      .forEach(p => {
        recs.push({
          id: `pred-${p.id}`,
          priority: 'critical',
          title: `${p.roadName} — ${p.riskScore}% Landslide Risk`,
          description: `AI confidence: ${p.confidence}%. ${p.recommendation}`,
          action: 'navigate-routes',
          actionLabel: 'View Routes',
          icon: 'mountain',
          relatedRoadId: p.roadId,
        })
      })

    // 3 — High-risk predictions
    mockPredictions
      .filter(p => p.riskLevel === 'high' && p.riskScore >= 65)
      .forEach(p => {
        const affected = vehicles.filter(v => v.routeId?.includes(p.roadId.split('-')[0])).length
        recs.push({
          id: `warn-${p.id}`,
          priority: 'high',
          title: `Monitor ${p.roadName}`,
          description: `Risk rising to ${p.riskScore}%. ${affected > 0 ? `${affected} vehicles on this route.` : 'Pre-position emergency vehicle.'}`,
          action: 'navigate-alerts',
          actionLabel: 'Monitor',
          icon: 'alert',
          relatedRoadId: p.roadId,
        })
      })

    // 4 — Multiple delayed vehicles
    const delayed = vehicles.filter(v => v.status === 'delayed')
    if (delayed.length >= 2) {
      recs.push({
        id: 'bulk-delay',
        priority: 'high',
        title: `${delayed.length} Vehicles Delayed`,
        description: `Cascade impact detected. Consider alternate routing for ${delayed.filter(v => v.priority !== 'low').length} priority vehicles.`,
        action: 'navigate-fleet',
        actionLabel: 'Review Fleet',
        icon: 'truck',
        relatedVehicleIds: delayed.map(v => v.id),
      })
    }

    // 5 — Blocked roads with active vehicles
    const blockedRoads = roads.filter(r => r.status === 'blocked')
    blockedRoads.forEach(r => {
      if (r.affectedVehicles.length > 0) {
        recs.push({
          id: `blocked-${r.id}`,
          priority: 'high',
          title: `${r.name} — ${r.affectedVehicles.length} Vehicles Affected`,
          description: `Road blocked since ${new Date(r.blockedSince ?? '').toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}. Calculate alternate routes.`,
          action: 'navigate-routes',
          actionLabel: 'Recalculate',
          icon: 'ban',
          relatedRoadId: r.id,
          relatedVehicleIds: r.affectedVehicles,
        })
      }
    })

    // 6 — Critical active alerts
    const critAlerts = alerts.filter(a => a.severity === 'critical' && a.status === 'active')
    if (critAlerts.length > 0) {
      recs.push({
        id: 'crit-alerts',
        priority: 'high',
        title: `${critAlerts.length} Unacknowledged Critical Alerts`,
        description: `Immediate review required. Oldest: ${critAlerts[0]?.title ?? '—'}`,
        action: 'navigate-alerts',
        actionLabel: 'Review Alerts',
        icon: 'octagon',
      })
    }

    // Sort: critical first
    return recs
      .sort((a, b) => {
        const order = { critical: 0, high: 1, medium: 2 }
        return order[a.priority] - order[b.priority]
      })
      .slice(0, 5) // cap at 5 recommendations
  }, [vehicles, alerts, roads])
}

const priorityConfig = {
  critical: { dot: 'bg-danger animate-pulse', border: 'border-danger/30 bg-danger/5', badge: 'bg-danger/20 text-danger' },
  high:     { dot: 'bg-warning',              border: 'border-warning/30 bg-warning/5', badge: 'bg-warning/20 text-warning' },
  medium:   { dot: 'bg-info',                 border: 'border-info/30 bg-info/5',       badge: 'bg-info/20 text-info' },
}

interface Props { className?: string }

export function CopilotPanel({ className }: Props) {
  const navigate   = useNavigate()
  const recs       = useCopilotRecommendations()
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [accepted,  setAccepted]  = useState<Set<string>>(new Set())

  const visible = recs.filter(r => !dismissed.has(r.id))

  const handleAccept = useCallback((rec: CopilotRecommendation) => {
    setAccepted(s => new Set([...s, rec.id]))
    toast.success(`Action taken: ${rec.title}`)
    setTimeout(() => {
      setDismissed(s => new Set([...s, rec.id]))
    }, 1800)
    // Navigate to relevant page
    if (rec.action === 'navigate-routes')  navigate('/routes')
    if (rec.action === 'navigate-alerts')  navigate('/alerts')
    if (rec.action === 'navigate-fleet')   navigate('/fleet')
  }, [navigate])

  const handleDismiss = useCallback((id: string) => {
    setDismissed(s => new Set([...s, id]))
  }, [])

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border flex-shrink-0">
        <div className="p-1 rounded-md bg-primary/10 border border-primary/20">
          <Cpu className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-text">NER Operations Copilot</div>
          <div className="text-[10px] text-text-muted">AI-generated recommendations</div>
        </div>
        {visible.length > 0 && (
          <span className="text-[10px] font-bold bg-danger/20 text-danger px-1.5 py-0.5 rounded-full">
            {visible.filter(r => r.priority === 'critical').length || visible.length} action{visible.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Recommendation list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {visible.length === 0 ? (
          <div className="text-center py-6">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <p className="text-xs font-semibold text-success">All systems nominal</p>
            <p className="text-[10px] text-text-muted mt-1">No recommended actions at this time</p>
          </div>
        ) : (
          visible.map(rec => {
            const cfg = priorityConfig[rec.priority]
            const isAccepted = accepted.has(rec.id)
            return (
              <div key={rec.id}
                className={cn('border rounded-lg p-2.5 transition-all', cfg.border, isAccepted && 'opacity-60')}>
                <div className="flex items-start gap-2">
                  {/* Status dot */}
                  <span className={cn('h-2 w-2 rounded-full flex-shrink-0 mt-1', cfg.dot)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {renderCopilotIcon(rec.icon)}
                        <span className="text-xs font-semibold text-text leading-tight">{rec.title}</span>
                      </div>
                      <button onClick={() => handleDismiss(rec.id)}
                        className="flex-shrink-0 text-text-subtle hover:text-text-muted transition-colors">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{rec.description}</p>
                    {!isAccepted && (
                      <button
                        onClick={() => handleAccept(rec)}
                        className={cn(
                          'mt-1.5 flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md transition-colors',
                          cfg.badge, 'hover:opacity-80'
                        )}
                      >
                        <ChevronRight className="h-3 w-3" />
                        {rec.actionLabel}
                      </button>
                    )}
                    {isAccepted && (
                      <span className="mt-1.5 flex items-center gap-1 text-[10px] text-success font-semibold">
                        <CheckCircle className="h-3 w-3" /> Action taken
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      {visible.length > 0 && (
        <div className="px-3 py-2 border-t border-border flex-shrink-0">
          <button
            onClick={() => setDismissed(new Set(recs.map(r => r.id)))}
            className="text-[10px] text-text-subtle hover:text-text-muted transition-colors"
          >
            Dismiss all recommendations
          </button>
        </div>
      )}
    </div>
  )
}
