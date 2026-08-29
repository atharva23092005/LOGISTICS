import { Router } from 'express'
import { incidentRepository } from '../db/repositories.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const incidents = await incidentRepository.getAll()
    res.json({ data: incidents, total: incidents.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const incident = {
      id: `inc${Date.now()}`,
      reportedAt: new Date().toISOString(),
      status: 'reported',
      syncStatus: 'synced',
      ...req.body,
    }
    const created = await incidentRepository.create(incident)
    req.io?.emit('incident:new', created)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/verify', async (req, res) => {
  try {
    const updated = await incidentRepository.updateStatus(req.params.id, 'verified')
    if (!updated) return res.status(404).json({ error: 'Not found' })
    req.io?.emit('incident:updated', updated)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/resolve', async (req, res) => {
  try {
    const updated = await incidentRepository.updateStatus(req.params.id, 'resolved')
    if (!updated) return res.status(404).json({ error: 'Not found' })
    req.io?.emit('incident:updated', updated)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
