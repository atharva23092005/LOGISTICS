import { useEffect } from 'react'
import { connectWebSocket, disconnectWebSocket } from '@/services/websocket'
import { useVehicleSimulator } from '@/hooks/useVehicleSimulator'
import { useAppStore } from '@/stores/appStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useAlertStore } from '@/stores/alertStore'
import { vehicleApi, alertApi, routeApi } from '@/services/api'

const selAuth = (s: ReturnType<typeof useAppStore.getState>) => s.isAuthenticated
const selDemo = (s: ReturnType<typeof useAppStore.getState>) => s.demoMode

export function AppProviders({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore(selAuth)
  const demoMode        = useAppStore(selDemo)

  // Hydrate stores with real validated data from backend on startup
  useEffect(() => {
    async function hydrateStores() {
      try {
        const [vRes, aRes] = await Promise.allSettled([
          vehicleApi.getAll(),
          alertApi.getAll(),
        ])
        if (vRes.status === 'fulfilled' && vRes.value.data?.data) {
          useVehicleStore.getState().setVehicles(vRes.value.data.data)
        }
        if (aRes.status === 'fulfilled' && aRes.value.data?.data) {
          useAlertStore.getState().setAlerts(aRes.value.data.data)
        }
      } catch (e) {
        console.warn('Initial store hydration from backend failed, using local store state:', e)
      }
    }

    hydrateStores()
  }, [isAuthenticated])

  // Connect WebSocket in live mode only
  useEffect(() => {
    if (isAuthenticated && !demoMode) {
      connectWebSocket()
      return () => disconnectWebSocket()
    }
  }, [isAuthenticated, demoMode])

  // GPS vehicle simulator — advances vehicles along their routePoints
  useVehicleSimulator(isAuthenticated)

  return <>{children}</>
}
