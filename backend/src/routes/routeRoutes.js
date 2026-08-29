import { Router } from 'express'
import { roadRepository } from '../db/repositories.js'
import { pool, isDbConnected } from '../db/postgres.js'
import { predictions } from '../data/mockData.js'

const router = Router()

router.post('/calculate', async (req, res) => {
  const {
    origin = 'Guwahati',
    destination = 'Pasighat',
    blockedSegments = [],
    currentGps = null,
    priority = 'emergency_medical',
  } = req.body

  try {
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'
    const response = await fetch(`${pythonServiceUrl}/ml/optimize-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        blocked_segments: blockedSegments,
        current_gps: currentGps,
        vehicle_priority: priority,
      }),
    })

    if (response.ok) {
      const mlData = await response.json()

      // Persist to routes_history in PostgreSQL if connected
      if (isDbConnected()) {
        try {
          await pool.query(
            `INSERT INTO routes_history (origin, destination, recommended_route_id, blocked_segments, route_data)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              origin,
              destination,
              mlData.recommended_route_id,
              JSON.stringify(blockedSegments),
              JSON.stringify(mlData.options),
            ]
          )
        } catch (dbErr) {
          console.warn('Could not persist route history to PostgreSQL:', dbErr.message)
        }
      }

      return res.json({
        routes: mlData.options,
        recommendedRouteId: mlData.recommended_route_id,
        isMidTripReroute: mlData.is_mid_trip_reroute,
        midTripSummary: mlData.mid_trip_summary,
        calculatedAt: new Date().toISOString(),
        solver: mlData.solver,
      })
    }
  } catch (err) {
    console.warn('Python service unreachable for routing, using local solver:', err.message)
  }

  // Fallback candidate routes
  const fallbackRoutes = [
    { id: 'route-1', label: 'Route 1 — Via NH-37 & NH-415', type: 'fastest', distance: 245, duration: 270, riskScore: 72, isAIRecommended: false, via: ['NH-37', 'NH-415'] },
    { id: 'route-2', label: 'Route 2 — Via NH-27 & SH-15', type: 'shortest', distance: 210, duration: 315, riskScore: 85, isAIRecommended: false, via: ['NH-27', 'SH-15'] },
    { id: 'route-3', label: 'Route 3 — Via SH-15 & NH-27 Safe Bypass', type: 'safest', distance: 280, duration: 345, riskScore: 18, isAIRecommended: true, via: ['SH-15', 'NH-27'], avoidedHazards: ['NH-415 Landslide Km 42'] },
  ]
  res.json({ routes: fallbackRoutes, calculatedAt: new Date().toISOString() })
})

// Daily forecast inference & automated alert trigger
router.get('/forecast', async (req, res) => {
  const rainfallMultiplier = parseFloat(req.query.rainfall_multiplier || '1.0')
  const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

  try {
    const response = await fetch(`${pythonServiceUrl}/ml/daily-forecast?rainfall_multiplier=${rainfallMultiplier}`)
    if (response.ok) {
      const data = await response.json()

      // If any automated alert was triggered by the ML model, broadcast via Socket.io
      if (data.alerts && data.alerts.length > 0) {
        data.alerts.forEach((alert) => {
          req.io?.emit('alert:new', {
            id: alert.alert_id,
            type: 'landslide',
            severity: alert.severity || 'critical',
            location: alert.location,
            district: alert.district,
            highway: alert.highway,
            riskScore: Math.round(alert.risk_score * 100),
            message: alert.message,
            timestamp: new Date().toISOString(),
            status: 'active',
            source: 'NERA_XGBOOST_MODEL',
          })
        })
      }

      return res.json(data)
    }
  } catch (err) {
    console.warn('Python service unreachable for daily forecast:', err.message)
  }

  const allRoads = await roadRepository.getAll()
  res.json({
    pipeline_run: 'daily_inference_fallback',
    model_version: 'NERA-Risk-XGB-v2.0',
    total_segments_evaluated: allRoads.length,
    alerts_triggered_count: 1,
    alerts: [
      {
        alert_id: 'alert-nh415-fallback',
        highway: 'NH-415',
        location: 'NH-415 Km 42',
        risk_score: 0.87,
        severity: 'critical',
        message: 'Automated Risk Alert: Landslide hazard exceeds 0.70 threshold.',
      },
    ],
    segments: allRoads,
  })
})

// Single-segment real-time risk prediction
router.post('/predict-segment', async (req, res) => {
  const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

  try {
    const response = await fetch(`${pythonServiceUrl}/ml/predict-segment-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    })

    if (response.ok) {
      const data = await response.json()
      return res.json(data)
    }
  } catch (err) {
    console.warn('Python service unreachable for segment prediction:', err.message)
  }

  res.json({
    segment_id: req.body.segment_id || 'custom-seg',
    risk_score: 0.55,
    risk_percent: 55,
    risk_category: 'MODERATE',
    severity: 'warning',
    status: 'Moderate Terrain Hazard (Local Fallback)',
    alert_triggered: false,
    model_version: 'heuristic-v2.1',
  })
})

router.get('/roads', async (_req, res) => {
  try {
    const roads = await roadRepository.getAll()
    res.json({ data: roads })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/roads/:id', async (req, res) => {
  const roads = await roadRepository.getAll()
  const r = roads.find((r) => r.id === req.params.id)
  if (!r) return res.status(404).json({ error: 'Road not found' })
  Object.assign(r, req.body)
  req.io?.emit('road:updated', r)
  res.json(r)
})

router.get('/predictions', (_req, res) => {
  res.json({ data: predictions })
})

export default router
