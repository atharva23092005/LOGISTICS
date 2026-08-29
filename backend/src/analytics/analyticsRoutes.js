import { Router } from 'express'

const router = Router()

const disruptions = [
  { date: 'Aug 20', landslides: 1, floods: 0, accidents: 2, total: 3 },
  { date: 'Aug 21', landslides: 2, floods: 1, accidents: 1, total: 4 },
  { date: 'Aug 22', landslides: 1, floods: 2, accidents: 3, total: 6 },
  { date: 'Aug 23', landslides: 3, floods: 1, accidents: 1, total: 5 },
  { date: 'Aug 24', landslides: 2, floods: 3, accidents: 2, total: 7 },
  { date: 'Aug 25', landslides: 4, floods: 2, accidents: 1, total: 7 },
  { date: 'Aug 26', landslides: 3, floods: 4, accidents: 2, total: 9 },
  { date: 'Aug 27', landslides: 1, floods: 2, accidents: 1, total: 4 },
]

const districtPerformance = [
  { district: 'Guwahati',   onTime: 82, delayed: 14, blocked: 4,  avgDelay: 1.2 },
  { district: 'Jorhat',     onTime: 88, delayed: 10, blocked: 2,  avgDelay: 0.8 },
  { district: 'Dibrugarh',  onTime: 64, delayed: 28, blocked: 8,  avgDelay: 2.4 },
  { district: 'East Siang', onTime: 41, delayed: 32, blocked: 27, avgDelay: 4.8 },
  { district: 'Itanagar',   onTime: 71, delayed: 22, blocked: 7,  avgDelay: 1.8 },
  { district: 'Tawang',     onTime: 58, delayed: 30, blocked: 12, avgDelay: 3.1 },
  { district: 'Shillong',   onTime: 91, delayed: 7,  blocked: 2,  avgDelay: 0.6 },
]

router.get('/disruptions', (_req, res) => {
  res.json({ data: disruptions })
})

router.get('/districts', (_req, res) => {
  res.json({ data: districtPerformance })
})

router.get('/summary', (_req, res) => {
  res.json({
    totalDisruptions: disruptions.reduce((a, d) => a + d.total, 0),
    avgOnTimeRate:    Math.round(districtPerformance.reduce((a, d) => a + d.onTime, 0) / districtPerformance.length),
    avgDelay:         (districtPerformance.reduce((a, d) => a + d.avgDelay, 0) / districtPerformance.length).toFixed(1),
    generatedAt:      new Date().toISOString(),
  })
})

// Machine Learning Model Telemetry, Feature Weights & Data Provenance
router.get('/ml-telemetry', async (_req, res) => {
  const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

  try {
    const [featRes, metaRes] = await Promise.all([
      fetch(`${pythonServiceUrl}/ml/feature-importance`),
      fetch(`${pythonServiceUrl}/ml/model-metadata`),
    ])

    if (featRes.ok && metaRes.ok) {
      const featData = await featRes.json()
      const metaData = await metaRes.json()

      return res.json({
        status: 'ok',
        modelVersion: featData.model_version,
        modelType: featData.model_type,
        featureRadar: featData.feature_radar,
        featureProvenance: featData.feature_provenance,
        trainingMetadata: metaData.training_metadata,
        threshold: metaData.threshold,
        dataConfidenceScore: 86.4,
        confidenceLadder: [
          { tier: 'REAL_OFFICIAL', source: 'IMD Pune / Copernicus DEM / JRC Surface Water', weight: 100 },
          { tier: 'REAL_OPEN', source: 'OpenStreetMap / ESA WorldCover', weight: 85 },
          { tier: 'REAL_ACADEMIC', source: 'NASA Global Landslide Catalog / HydroRIVERS', weight: 75 },
          { tier: 'DERIVED', source: 'Slope / TRI / Anomaly / Multi-Day Windows', weight: 60 },
          { tier: 'SIMULATED', source: 'Vehicle GPS / Convoy Telemetry / Driver Roster', weight: 30 },
        ],
        lastAudited: '2026-08-29',
      })
    }
  } catch (err) {
    console.warn('Python service unreachable for ML telemetry:', err.message)
  }

  // Fallback telemetry
  res.json({
    status: 'fallback',
    modelVersion: 'NERA-Risk-XGB-v2.0',
    modelType: 'calibrated_xgboost',
    featureRadar: [
      { feature: 'Antecedent Rainfall (3-Day)', weight: 35.0, category: 'Meteorological' },
      { feature: 'DEM Slope Gradient', weight: 30.0, category: 'Topographical' },
      { feature: 'Subsoil Saturation Index', weight: 20.0, category: 'Hydrological' },
      { feature: 'Historical Landslide Catalog', weight: 15.0, category: 'Geological' },
    ],
    dataConfidenceScore: 86.4,
    threshold: 0.70,
  })
})

export default router
