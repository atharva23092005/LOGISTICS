import { io, Socket } from 'socket.io-client'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useAlertStore } from '@/stores/alertStore'
import { useAppStore } from '@/stores/appStore'
import type { LogisticsAlert } from '@/types'

let socket: Socket | null = null

export function connectWebSocket(): Socket {
  if (socket?.connected) return socket

  socket = io('/', {
    transports: ['websocket', 'polling'],
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  })

  socket.on('connect', () => {
    console.log('WebSocket connected:', socket!.id)
    useAppStore.getState().setNetworkOnline(true)
  })

  socket.on('disconnect', () => {
    console.log('WebSocket disconnected')
    useAppStore.getState().setNetworkOnline(false)
  })

  // Live vehicle position updates
  socket.on('vehicles:positions', (updates: Array<{ id: string; location: { lat: number; lng: number }; speed: number; timestamp: string }>) => {
    const { updateVehicle } = useVehicleStore.getState()
    updates.forEach((u) => {
      updateVehicle(u.id, {
        currentLocation: u.location,
        speed: u.speed,
        lastUpdate: u.timestamp,
      })
    })
  })

  // New alert from backend
  socket.on('alert:new', (alert: LogisticsAlert) => {
    useAlertStore.getState().addAlert(alert)
  })

  // Alert status change
  socket.on('alert:updated', (alert: { id: string; status: string }) => {
    if (alert.status === 'acknowledged') useAlertStore.getState().acknowledgeAlert(alert.id)
    if (alert.status === 'resolved')     useAlertStore.getState().resolveAlert(alert.id)
  })

  // Emergency state
  socket.on('emergency:activated',   () => useAppStore.getState().activateEmergency('Remote activation'))
  socket.on('emergency:deactivated', () => useAppStore.getState().deactivateEmergency())

  return socket
}

export function disconnectWebSocket() {
  socket?.disconnect()
  socket = null
}

export function getSocket(): Socket | null {
  return socket
}
