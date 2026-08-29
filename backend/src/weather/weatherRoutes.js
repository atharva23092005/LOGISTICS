import { Router } from 'express'
import { weatherRepository } from '../db/repositories.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const data = await weatherRepository.getAll()
    res.json({ data, updatedAt: new Date().toISOString() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:district', async (req, res) => {
  try {
    const w = await weatherRepository.getByDistrict(req.params.district)
    if (!w) return res.status(404).json({ error: 'District not found' })
    res.json(w)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
