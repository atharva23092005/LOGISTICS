import { vehicleState } from '../vehicles/vehicleRoutes.js'

// Simulates live vehicle GPS movement and periodic events
export function startSimulator(io) {
  console.log('🚀 WebSocket simulator started')

  // Vehicle position updates every 4 seconds
  setInterval(() => {
    const updates = vehicleState
      .filter((v) => v.status === 'on_route' || v.status === 'delayed')
      .map((v) => {
        // Slight position drift to simulate movement
        const drift = v.status === 'on_route' ? 0.003 : 0.0005
        const newLat = v.currentLocation.lat + (Math.random() - 0.5) * drift
        const newLng = v.currentLocation.lng + (Math.random() - 0.5) * drift
        const speedVariance = v.status === 'on_route' ? (Math.random() - 0.5) * 8 : (Math.random() - 0.5) * 4
        const newSpeed = Math.max(0, Math.min(90, v.speed + speedVariance))

        v.currentLocation = { lat: newLat, lng: newLng }
        v.speed = Math.round(newSpeed)
        v.lastUpdate = new Date().toISOString()

        return { id: v.id, location: v.currentLocation, speed: v.speed, timestamp: v.lastUpdate }
      })

    if (updates.length > 0) {
      io.emit('vehicles:positions', updates)
    }
  }, 4000)

  // Periodic system health broadcast every 30 seconds
  setInterval(() => {
    const onRoute = vehicleState.filter((v) => v.status === 'on_route').length
    const delayed  = vehicleState.filter((v) => v.status === 'delayed').length
    const stopped  = vehicleState.filter((v) => v.status === 'stopped').length

    io.emit('system:health', {
      vehicles: { onRoute, delayed, stopped, total: vehicleState.length },
      timestamp: new Date().toISOString(),
    })
  }, 30000)

  // Simulate a weather update every 2 minutes
  setInterval(() => {
    const districts = ['East Siang', 'Dibrugarh', 'Tawang']
    const district = districts[Math.floor(Math.random() * districts.length)]
    const rainfall = Math.round(60 + Math.random() * 40)

    io.emit('weather:update', {
      district,
      rainfall,
      landslideRisk: Math.round(rainfall * 0.9 + Math.random() * 10),
      timestamp: new Date().toISOString(),
    })
  }, 120000)
}
