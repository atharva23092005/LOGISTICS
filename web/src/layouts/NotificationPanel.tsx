import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Bell, CheckCheck } from 'lucide-react'
import { Button }    from '@/components/ui/button'
import { AlertCard } from '@/components/cards/AlertCard'
import { useAlertStore } from '@/stores/alertStore'

const selAllAlerts   = (s: ReturnType<typeof useAlertStore.getState>) => s.alerts
const selAcknowledge = (s: ReturnType<typeof useAlertStore.getState>) => s.acknowledgeAlert
const selActiveCount = (s: ReturnType<typeof useAlertStore.getState>) =>
  s.alerts.filter(a => a.status === 'active').length

interface NotificationPanelProps { onClose: () => void }

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const navigate      = useNavigate()
  const allAlerts     = useAlertStore(selAllAlerts)
  const acknowledge   = useAlertStore(selAcknowledge)
  const activeCount   = useAlertStore(selActiveCount)
  const activeAlerts  = allAlerts.filter(a => a.status === 'active')

  const handleViewAll = useCallback(() => { navigate('/alerts'); onClose() }, [navigate, onClose])

  return (
    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-24px)] surface-elevated border border-border rounded-2xl z-50 animate-scale-in overflow-hidden shadow-modal">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-text">Notifications</span>
          {activeCount > 0 && (
            <span className="badge-critical text-2xs">{activeCount}</span>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Mark all as read"
            onClick={() => activeAlerts.forEach(a => acknowledge(a.id))}
          >
            <CheckCheck className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto p-3 space-y-2">
        {activeAlerts.length === 0
          ? <div className="text-center py-8 text-xs text-text-muted">No active notifications</div>
          : activeAlerts.map(a => (
              <AlertCard key={a.id} alert={a} compact onAcknowledge={acknowledge} />
            ))
        }
      </div>
      <div className="p-3 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full text-primary" onClick={handleViewAll}>
          View All Alerts
        </Button>
      </div>
    </div>
  )
}
