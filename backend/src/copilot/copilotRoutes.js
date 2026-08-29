import { Router } from 'express'
import {
  vehicleRepository,
  alertRepository,
  roadRepository,
  weatherRepository,
  incidentRepository,
} from '../db/repositories.js'

const router = Router()

router.post('/chat', async (req, res) => {
  const { message, context = {}, role = 'operator' } = req.body
  const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

  try {
    // 1. Fetch live repository state
    const [vehicles, alerts, roads, weatherList, incidents] = await Promise.all([
      vehicleRepository.getAll(),
      alertRepository.getAll(),
      roadRepository.getAll(),
      weatherRepository.getAll(),
      incidentRepository.getAll(),
    ])

    const stoppedVehicles = vehicles.filter(v => v.status === 'stopped')
    const delayedVehicles = vehicles.filter(v => v.status === 'delayed')
    const onRouteVehicles = vehicles.filter(v => v.status === 'on_route')
    const activeAlerts    = alerts.filter(a => a.status === 'active')
    const criticalAlerts  = alerts.filter(a => a.severity === 'critical' && a.status === 'active')
    const blockedRoads    = roads.filter(r => r.status === 'blocked')

    // 2. Build enriched live context
    const enrichedContext = {
      ...context,
      fleetSummary: {
        total: vehicles.length,
        onRoute: onRouteVehicles.length,
        delayed: delayedVehicles.length,
        stopped: stoppedVehicles.length,
        stoppedList: stoppedVehicles.map(v => ({
          id: v.id,
          reg: v.registrationNo,
          driver: v.driver,
          phone: v.driverPhone,
          cargo: v.cargo,
          location: v.currentLocation,
        })),
      },
      hazardSummary: {
        totalActive: activeAlerts.length,
        criticalCount: criticalAlerts.length,
        blockedRoads: blockedRoads.map(r => ({ id: r.id, name: r.name, reason: r.reason, risk: r.riskScore })),
      },
      roadNetwork: roads.map(r => ({
        id: r.id,
        name: r.name,
        highway: r.highway,
        status: r.status,
        risk: r.riskScore,
        slope: r.slope,
        elevation: r.elevation,
      })),
      weatherTelemetry: weatherList.map(w => ({
        district: w.district,
        rainfall: w.rainfall,
        landslideRisk: w.landslideRisk,
        condition: w.condition,
      })),
      incidentsCount: incidents.length,
    }

    // 3. Request reasoning from Python NLP Microservice
    const response = await fetch(`${pythonServiceUrl}/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context: enrichedContext,
        role,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return res.json(data)
    }
  } catch (err) {
    console.warn('Python service unreachable for Copilot, using database-grounded local reasoning:', err.message)
  }

  // Database-grounded live fallback
  const allVehicles = await vehicleRepository.getAll()
  const allAlerts = await alertRepository.getAll()
  const allRoads = await roadRepository.getAll()
  const stopped = allVehicles.filter(v => v.status === 'stopped')

  return res.json({
    intent: 'live_situation_telemetry',
    text: `### NER Logistics Command Center — Live Intelligence

**Active Telemetry Overview:**
- Fleet Size: **${allVehicles.length} Convoys** (${allVehicles.filter(v => v.status === 'on_route').length} on route, ${allVehicles.filter(v => v.status === 'delayed').length} delayed, **${stopped.length} stopped**)
- Active Disruptions: **${allAlerts.filter(a => a.status === 'active').length} Alerts** (${allAlerts.filter(a => a.severity === 'critical').length} critical)
- Blocked Passages: **${allRoads.filter(r => r.status === 'blocked').length} Corridors** (NH-415 Km 42 Landslide)

**Life-Critical Protocol:**
${stopped.map(v => `- **${v.registrationNo}** (${v.cargo}) — Driver: ${v.driver} (${v.driverPhone})`).join('\n') || 'All vehicles currently moving.'}

**Recommended Action:**
Execute pre-departure or mid-trip reroutes via **SH-15 North Bank Safe Corridor** (Risk: 18%).`,
    cards: [
      {
        type: 'kpi_grid',
        items: [
          { label: 'Active Convoys', value: allVehicles.length, color: 'success' },
          { label: 'Stopped', value: stopped.length, color: 'danger' },
          { label: 'Critical Alerts', value: allAlerts.filter(a => a.severity === 'critical').length, color: 'danger' },
          { label: 'Safe Corridors', value: allRoads.filter(r => r.status === 'open').length, color: 'success' },
        ],
      },
    ],
    actions: [
      { label: 'Fly to NH-415 Blockage', action: 'flyToRoad', target: 'nh415-seg1' },
      { label: 'Compare All 3 Corridors', action: 'navigate', target: '/routes' },
    ],
    suggestions: [
      "What's happening right now?",
      "Why is NH-415 blocked?",
      "Show all stopped vehicles",
      "Analyze route elevation",
    ],
    severity: 'warning',
  })
})

export default router
