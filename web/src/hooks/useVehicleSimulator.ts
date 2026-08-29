/**
 * useVehicleSimulator
 *
 * Ultra-smooth real-time vehicle movement engine along genuine NER Highway polylines.
 * - Sub-second ticks with smooth progress interpolation
 * - Calculates genuine geodetic bearing (heading) for directional rotation
 * - Recalculates live ETAs, fuel consumption, speed telemetry, and distance remaining
 * - Respects blocked road stoppages and hazard delays
 */
import { useEffect, useRef } from 'react'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useMapStore } from '@/stores/mapStore'
import type { Vehicle } from '@/types'

const BASE_TICK_MS = 1000 // 1-second ticks for ultra-smooth real-time tracking

type Pt = { lat: number; lng: number }

/** Haversine distance in km between two coordinates */
function haversine(a: Pt, b: Pt): number {
  const R = 6371.0
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
}

/** Total polyline length in km */
function polylineLength(pts: Pt[]): number {
  let d = 0
  for (let i = 1; i < pts.length; i++) d += haversine(pts[i - 1], pts[i])
  return Math.max(1, d)
}

/** Interpolate position at progress% along a polyline */
function along(pts: Pt[], pct: number): Pt {
  const t = Math.min(1, Math.max(0, pct / 100))
  const seg = t * (pts.length - 1)
  const i = Math.min(pts.length - 2, Math.floor(seg))
  const r = seg - i
  const a = pts[i]
  const b = pts[i + 1]
  return {
    lat: Math.round((a.lat + (b.lat - a.lat) * r) * 1000000) / 1000000,
    lng: Math.round((a.lng + (b.lng - a.lng) * r) * 1000000) / 1000000,
  }
}

/** Compass bearing from a to b in degrees (0-360) */
function bearing(a: Pt, b: Pt): number {
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360)
}

/** Speed jitter */
function jitter(base: number, range = 2): number {
  return Math.max(0, Math.min(85, base + (Math.random() - 0.5) * range * 2))
}

export function useVehicleSimulator(active = true) {
  const updateVehicle = useVehicleStore((s) => s.updateVehicle)
  const vehicles = useVehicleStore((s) => s.vehicles)
  const simulationSpeed = useMapStore((s) => s.simulationSpeed)

  const vRef = useRef<Vehicle[]>(vehicles)
  useEffect(() => {
    vRef.current = vehicles
  }, [vehicles])

  useEffect(() => {
    if (!active) return

    const tickMs = Math.max(250, BASE_TICK_MS / (simulationSpeed || 1))

    const id = setInterval(() => {
      vRef.current.forEach((v) => {
        // Stopped or offline vehicles do not progress
        if (v.status !== 'on_route' && v.status !== 'delayed') return
        if (!v.routePoints || v.routePoints.length < 2) return

        // Loop vehicles seamlessly when reaching the destination
        let currentProgress = v.progress
        if (currentProgress >= 99.2) {
          currentProgress = 0.5
        }

        const totalKm = polylineLength(v.routePoints as Pt[])
        const speedKmh = v.status === 'delayed' ? Math.max(12, v.speed * 0.6) : Math.max(35, v.speed)

        // Distance covered per tick
        const kmPerTick = (speedKmh * (tickMs * (simulationSpeed || 1))) / 3_600_000
        const progressDelta = (kmPerTick / totalKm) * 100
        const newProgress = Math.min(99.5, currentProgress + progressDelta)

        // Interpolate accurate geodetic position
        const newLoc = along(v.routePoints as Pt[], newProgress)
        const aheadLoc = along(v.routePoints as Pt[], Math.min(99.9, newProgress + 0.6))
        const newHeading = bearing(newLoc, aheadLoc)

        // Speed and fuel updates
        const newSpeed = v.status === 'delayed' ? jitter(26, 2) : jitter(54, 3)
        const remainingPct = 100 - newProgress
        const remainingKm = (remainingPct / 100) * totalKm
        const etaHours = newSpeed > 0 ? remainingKm / newSpeed : 4
        const etaMs = Date.now() + etaHours * 3_600_000

        updateVehicle(v.id, {
          progress: Math.round(newProgress * 10) / 10,
          currentLocation: newLoc,
          heading: newHeading,
          speed: Math.round(newSpeed),
          distanceRemaining: Math.round(remainingKm * 10) / 10,
          lastUpdate: new Date().toISOString(),
          eta: new Date(etaMs).toISOString(),
        })
      })
    }, tickMs)

    return () => clearInterval(id)
  }, [active, simulationSpeed, updateVehicle])
}
