import { create } from 'zustand'
import type { LogisticsAlert, EventType } from '@/types'
import { useAlertStore }   from './alertStore'
import { useVehicleStore } from './vehicleStore'
import { useRouteStore }   from './routeStore'
import { useAppStore }     from './appStore'

export interface BusEvent {
  id: string
  type: EventType
  timestamp: string
  payload: Record<string, unknown>
}

interface EventBusState {
  events: BusEvent[]
  emit:   (type: EventType, payload?: Record<string, unknown>) => void
  clear:  () => void
}

let counter = 0

export const useEventBus = create<EventBusState>((set) => ({
  events: [],

  emit: (type, payload = {}) => {
    const event: BusEvent = {
      id:        `evt-${++counter}-${Date.now()}`,
      type,
      timestamp: new Date().toISOString(),
      payload,
    }
    set(s => ({ events: [event, ...s.events].slice(0, 100) }))

    switch (type) {

      case 'ROAD_BLOCKED': {
        const { roadId, roadName, affectedVehicles = [] } = payload as Record<string, unknown>
        if (roadId) useRouteStore.getState().updateRoadStatus(roadId as string, 'blocked', 87)
        useAlertStore.getState().addAlert({
          id: `alert-${Date.now()}`,
          type: 'ROAD_BLOCKED',
          title: `${roadName ?? 'Road'} Blocked — Landslide Confirmed`,
          description: `Road blocked due to confirmed landslide. ${(affectedVehicles as string[]).length} vehicles stranded. Rerouting required.`,
          severity: 'critical',
          status: 'active',
          source: 'SYSTEM',
          timestamp: new Date().toISOString(),
          affectedVehicles: affectedVehicles as string[],
          roadId: roadId as string,
          aiRiskScore: 87,
          dataConfidence: 94,
        } as LogisticsAlert)
        break
      }

      case 'LANDSLIDE_PREDICTED': {
        useAlertStore.getState().addAlert({
          id: `alert-${Date.now()}`,
          type: 'LANDSLIDE_PREDICTED',
          title: `AI Prediction: Landslide Risk ${payload.riskScore ?? 72}% — ${payload.roadName ?? 'Unknown'}`,
          description: `AI model predicts ${payload.riskScore ?? 72}% landslide probability in next 6 hours. Confidence: 86%. Pre-emptive rerouting recommended.`,
          severity: 'critical',
          status: 'active',
          source: 'AI',
          timestamp: new Date().toISOString(),
          aiRiskScore: (payload.riskScore as number) ?? 72,
          roadId: payload.roadId as string,
          dataConfidence: 86,
        } as LogisticsAlert)
        break
      }

      case 'VEHICLE_DELAYED': {
        const { vehicleId } = payload as { vehicleId: string }
        if (vehicleId) useVehicleStore.getState().updateVehicle(vehicleId, { status: 'delayed' })
        break
      }

      case 'VEHICLE_STOPPED': {
        const { vehicleId } = payload as { vehicleId: string }
        if (vehicleId) useVehicleStore.getState().updateVehicle(vehicleId, { status: 'stopped', speed: 0 })
        break
      }

      case 'VEHICLE_REROUTED': {
        const { vehicleId, newRouteId } = payload as { vehicleId: string; newRouteId: string }
        if (vehicleId) useVehicleStore.getState().updateVehicle(vehicleId, { routeId: newRouteId, status: 'on_route' })
        useAlertStore.getState().addAlert({
          id: `alert-${Date.now()}`,
          type: 'VEHICLE_REROUTED',
          title: `Vehicle Rerouted via Safe Corridor`,
          description: `AI-recommended route activated. Vehicle rerouted via NH-6 & NH-13 (Risk 28%). Medical cargo prioritised.`,
          severity: 'info',
          status: 'active',
          source: 'AI',
          timestamp: new Date().toISOString(),
          affectedVehicles: [vehicleId],
          dataConfidence: 92,
        } as LogisticsAlert)
        break
      }

      case 'EMERGENCY_ACTIVATED': {
        useAppStore.getState().activateEmergency((payload.reason as string) ?? 'Critical situation')
        break
      }

      case 'WEATHER_ALERT': {
        useAlertStore.getState().addAlert({
          id: `alert-${Date.now()}`,
          type: 'WEATHER_ALERT',
          title: `Heavy Rainfall Alert — ${payload.district ?? 'Region'}`,
          description: `Rainfall intensity ${payload.rainfall ?? 80}mm/hr recorded. Landslide and flood risk elevated rapidly. Field officers alerted.`,
          severity: 'warning',
          status: 'active',
          source: 'WEATHER',
          timestamp: new Date().toISOString(),
          locationName: payload.district as string,
          aiRiskScore: (payload.riskScore as number) ?? 65,
          dataConfidence: 88,
        } as LogisticsAlert)
        break
      }

      case 'FIELD_INCIDENT_REPORTED': {
        useAlertStore.getState().addAlert({
          id: `alert-${Date.now()}`,
          type: 'FIELD_INCIDENT_REPORTED',
          title: `Field Report: ${(payload.type as string ?? 'incident').replace('_', ' ').toUpperCase()}`,
          description: `Field officer ${payload.reportedBy ?? 'on ground'} submitted incident report. GPS coordinates captured. Awaiting command center verification.`,
          severity: 'warning',
          status: 'active',
          source: 'FIELD',
          timestamp: new Date().toISOString(),
          location: payload.location as { lat: number; lng: number } | undefined,
          dataConfidence: 78,
        } as LogisticsAlert)
        break
      }

      case 'OFFLINE_SYNC': {
        useAlertStore.getState().addAlert({
          id: `alert-${Date.now()}`,
          type: 'OFFLINE_SYNC',
          title: `Field Reports Synced — ${payload.reportCount ?? 1} Report`,
          description: `${payload.reportCount ?? 1} offline field report(s) synced. ${payload.photosUploaded ?? 0} photos uploaded. GPS locations verified. Dashboard updated.`,
          severity: 'info',
          status: 'active',
          source: 'FIELD',
          timestamp: new Date().toISOString(),
          dataConfidence: 95,
        } as LogisticsAlert)
        break
      }

      default:
        break
    }
  },

  clear: () => set({ events: [] }),
}))
