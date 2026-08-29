import { Router } from 'express'

const router = Router()
let emergencyState = {
  active: false,
  level: 'normal',
  affectedDistricts: [],
  priorityOrder: ['medical', 'food', 'water', 'other'],
  safeCorridors: [],
}

router.get('/status', (req, res) => {
  res.json(emergencyState)
})

router.post('/activate', (req, res) => {
  const { reason, affectedDistricts = ['East Siang', 'Dibrugarh'] } = req.body
  emergencyState = {
    active: true,
    level: 'emergency',
    activatedAt: new Date().toISOString(),
    activatedBy: req.user?.id ?? 'system',
    reason,
    affectedDistricts,
    priorityOrder: ['medical', 'food', 'water', 'other'],
    safeCorridors: ['nh6-seg1', 'sh15-seg1', 'nh27-seg1'],
  }
  req.io?.emit('emergency:activated', emergencyState)
  res.json(emergencyState)
})

router.post('/deactivate', (req, res) => {
  emergencyState = {
    active: false,
    level: 'normal',
    deactivatedAt: new Date().toISOString(),
    affectedDistricts: [],
    priorityOrder: ['medical', 'food', 'water', 'other'],
    safeCorridors: [],
  }
  req.io?.emit('emergency:deactivated', emergencyState)
  res.json(emergencyState)
})

router.post('/dispatch', (req, res) => {
  const { category, corridor, vehicles } = req.body
  const dispatch = {
    id: `dispatch-${Date.now()}`,
    category,
    corridor,
    vehicles,
    dispatchedAt: new Date().toISOString(),
    estimatedArrival: new Date(Date.now() + 4.5 * 3600000).toISOString(),
  }
  req.io?.emit('dispatch:confirmed', dispatch)
  res.status(201).json(dispatch)
})

export default router
