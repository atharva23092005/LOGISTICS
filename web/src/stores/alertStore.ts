import { create } from 'zustand'
import type { LogisticsAlert, AlertSeverity, AlertStatus } from '@/types'
import { mockAlerts } from '@/mock/alerts'

interface AlertState {
  alerts: LogisticsAlert[]
  selectedAlertId: string | null
  filter: { severity: string; status: string; source: string }

  // Actions
  setAlerts: (alerts: LogisticsAlert[]) => void
  addAlert: (a: LogisticsAlert) => void
  updateAlert: (id: string, patch: Partial<LogisticsAlert>) => void
  acknowledgeAlert: (id: string) => void
  resolveAlert: (id: string) => void
  selectAlert: (id: string | null) => void
  setFilter: (f: Partial<AlertState['filter']>) => void

  // Computed
  getActive: () => LogisticsAlert[]
  getCritical: () => LogisticsAlert[]
  getFiltered: () => LogisticsAlert[]
  getStats: () => { total: number; critical: number; warning: number; info: number; active: number; resolved: number }
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: mockAlerts,
  selectedAlertId: null,
  filter: { severity: 'all', status: 'all', source: 'all' },

  setAlerts: (alerts) => set({ alerts }),
  addAlert: (a) => set((s) => ({ alerts: [a, ...s.alerts] })),
  updateAlert: (id, patch) =>
    set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
  acknowledgeAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id ? { ...a, status: 'acknowledged' as AlertStatus } : a
      ),
    })),
  resolveAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id ? { ...a, status: 'resolved' as AlertStatus } : a
      ),
    })),
  selectAlert: (id) => set({ selectedAlertId: id }),
  setFilter: (f) => set((s) => ({ filter: { ...s.filter, ...f } })),

  getActive: () => get().alerts.filter((a) => a.status === 'active'),
  getCritical: () =>
    get().alerts.filter((a) => a.severity === 'critical' && a.status === 'active'),

  getFiltered: () => {
    const { alerts, filter } = get()
    return alerts.filter((a) => {
      if (filter.severity !== 'all' && a.severity !== filter.severity) return false
      if (filter.status !== 'all' && a.status !== filter.status) return false
      if (filter.source !== 'all' && a.source !== filter.source) return false
      return true
    })
  },

  getStats: () => {
    const { alerts } = get()
    const bySeverity = (s: AlertSeverity) => alerts.filter((a) => a.severity === s && a.status !== 'resolved').length
    return {
      total: alerts.length,
      critical: bySeverity('critical'),
      warning: bySeverity('warning'),
      info: bySeverity('info'),
      active: alerts.filter((a) => a.status === 'active').length,
      resolved: alerts.filter((a) => a.status === 'resolved').length,
    }
  },
}))
