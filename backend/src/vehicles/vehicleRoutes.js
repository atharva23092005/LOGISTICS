import { Router } from 'express'
import { vehicleRepository } from '../db/repositories.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { status, priority, district } = req.query
    const vehicles = await vehicleRepository.getAll({ status, priority, district })
    res.json({ data: vehicles, total: vehicles.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const v = await vehicleRepository.getById(req.params.id)
    if (!v) return res.status(404).json({ error: 'Vehicle not found' })
    res.json(v)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const updated = await vehicleRepository.update(req.params.id, req.body)
    if (!updated) return res.status(404).json({ error: 'Vehicle not found' })
    req.io?.emit('vehicle:updated', updated)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id/location', async (req, res) => {
  try {
    const v = await vehicleRepository.getById(req.params.id)
    if (!v) return res.status(404).json({ error: 'Not found' })
    res.json({ id: v.id, location: v.currentLocation, speed: v.speed, heading: v.heading ?? 0, timestamp: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
export const vehicleState = vehicleRepository.getState()
