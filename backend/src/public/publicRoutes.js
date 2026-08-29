/**
 * NER Logistics — Public Citizen Portal API (Anonymous & Read-Only)
 * Implements: Cross-Cutting Rule 6 ("Default to minimum necessary data")
 * Strictly isolates operational telemetry — Zero vehicle tracking, zero driver PII.
 */
import { Router } from 'express'

const router = Router()

const PUBLIC_HIGHWAY_STATUS = [
  {
    id: 'nh415-p',
    name: 'NH-415 (Dibrugarh – Pasighat / Itanagar)',
    district: 'East Siang & Papum Pare',
    status: 'blocked',
    condition: 'Major landslide at Km 42 (Jeypore Pass). Debris clearance in progress.',
    alternate: 'Use SH-15 North Bank Safe Corridor via Tezpur / North Lakhimpur.',
    rainfall: '84 mm/h (Heavy Monsoonal Rain)',
    lastInspected: '15 mins ago',
  },
  {
    id: 'sh15-p',
    name: 'SH-15 (North Lakhimpur – Pasighat Bypass)',
    district: 'East Siang & Dhemaji',
    status: 'open',
    condition: 'Optimal flow. High-clearance and standard vehicles passable.',
    alternate: 'None needed. Designated safe bypass corridor.',
    rainfall: '18 mm/h (Light Rain)',
    lastInspected: '30 mins ago',
  },
  {
    id: 'nh27-p',
    name: 'NH-27 (Guwahati – Nagaon – Jorhat Expressway)',
    district: 'Kamrup & Nagaon',
    status: 'open',
    condition: 'Normal 4-lane expressway transit. Pavement wet.',
    alternate: 'None.',
    rainfall: '22 mm/h (Moderate Rain)',
    lastInspected: '10 mins ago',
  },
  {
    id: 'nh37-p',
    name: 'NH-37 (Guwahati – Kaziranga Lowland)',
    district: 'Nagaon & Golaghat',
    status: 'partial',
    condition: 'Single-lane restriction due to Kaziranga floodplain waterlogging.',
    alternate: 'Proceed with cautionary hill speed (<40 km/h).',
    rainfall: '34 mm/h (Moderate Rain)',
    lastInspected: '45 mins ago',
  },
  {
    id: 'nh13-p',
    name: 'NH-13 Trans-Arunachal Highway (Itanagar – Along)',
    district: 'Papum Pare & West Siang',
    status: 'partial',
    condition: 'Single-lane clearing underway at Km 88 rockfall zone.',
    alternate: 'Heavy freight >25T restricted.',
    rainfall: '42 mm/h (Heavy Rain)',
    lastInspected: '1 hour ago',
  },
]

const EMERGENCY_HELPLINES = [
  { service: 'State Disaster Emergency Operation Center (SEOC)', phone: '1070', available: '24x7 Toll-Free' },
  { service: 'Police & Highway Emergency Response', phone: '112', available: '24x7 Toll-Free' },
  { service: 'National Highway Emergency Assistance (NHAI)', phone: '1033', available: '24x7 Toll-Free' },
  { service: 'District Hospital & Medical Relief Helpline', phone: '108', available: '24x7 Toll-Free' },
]

router.get('/road-status', (_req, res) => {
  res.json({
    status: 'ok',
    updatedAt: new Date().toISOString(),
    highways: PUBLIC_HIGHWAY_STATUS,
    helplines: EMERGENCY_HELPLINES,
  })
})

export default router
