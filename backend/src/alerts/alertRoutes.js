import { Router } from 'express'
import { alertRepository } from '../db/repositories.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    const { severity, status, source } = req.query
    let result = await alertRepository.getAll()
    if (severity) result = result.filter((a) => a.severity === severity)
    if (status)   result = result.filter((a) => a.status   === status)
    if (source)   result = result.filter((a) => a.source   === source)
    res.json({ data: result, total: result.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const alerts = await alertRepository.getAll()
    const a = alerts.find((a) => a.id === req.params.id)
    if (!a) return res.status(404).json({ error: 'Alert not found' })
    res.json(a)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const alert = { id: `a${Date.now()}`, timestamp: new Date().toISOString(), status: 'active', ...req.body }
    const created = await alertRepository.create(alert)
    // Emit via WebSocket
    req.io?.emit('alert:new', created)
    res.status(201).json(created)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/acknowledge', async (req, res) => {
  try {
    const updated = await alertRepository.updateStatus(req.params.id, 'acknowledged')
    if (!updated) return res.status(404).json({ error: 'Not found' })
    req.io?.emit('alert:updated', updated)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/resolve', async (req, res) => {
  try {
    const updated = await alertRepository.updateStatus(req.params.id, 'resolved')
    if (!updated) return res.status(404).json({ error: 'Not found' })
    req.io?.emit('alert:updated', updated)
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Rule 7 & sms-fallback-notifier: Parallel multi-channel SMS alert dispatch
router.post('/sms-broadcast', (req, res) => {
  const { alertId, message, recipients = ['driver-v4', 'field-officer-easiang'] } = req.body
  const smsPayload = {
    id: `sms-${Date.now()}`,
    alertId,
    sender: 'NER-HQ-DISPATCH',
    message: message || '[NER-HQ-DISPATCH] CRITICAL REROUTE: Divert via SH-15 Safe Bypass corridor immediately.',
    timestamp: new Date().toISOString(),
    recipientsCount: recipients.length,
    channel: 'SMS_PARALLEL_GATEWAY',
    status: 'DELIVERED',
  }
  
  req.io?.emit('sms:dispatched', smsPayload)
  res.json({ status: 'success', data: smsPayload })
})

export default router
