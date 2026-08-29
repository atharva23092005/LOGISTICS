/**
 * NER Logistics — Mock Vehicle Fleet
 * Route points use the same OSRM-based polylines as mockRoads.
 * currentLocation is interpolated at progress% along the route.
 */
import type { Vehicle } from '@/types'
import { mockRoads } from './roads'

/* ── helpers ──────────────────────────────────────────────────────────────── */
type Pt = { lat: number; lng: number }

/** Interpolate a point at pct% (0–100) along a polyline */
export function along(pts: Pt[], pct: number): Pt {
  const t   = Math.min(1, Math.max(0, pct / 100))
  const seg = t * (pts.length - 1)
  const i   = Math.min(pts.length - 2, Math.floor(seg))
  const r   = seg - i
  return {
    lat: pts[i].lat + (pts[i + 1].lat - pts[i].lat) * r,
    lng: pts[i].lng + (pts[i + 1].lng - pts[i].lng) * r,
  }
}

/* ── route polyline references (from mockRoads) ────────────────────────────── */
function getRoute(id: string): Pt[] {
  const road = mockRoads.find(r => r.id === id)
  if (!road) throw new Error(`Road ${id} not found`)
  return road.coordinates as Pt[]
}

const NH27    = getRoute('nh27-seg1')
const NH37    = getRoute('nh37-seg1')
const NH715   = getRoute('nh715-seg1')
const NH415   = getRoute('nh415-seg1')
const SH15    = getRoute('sh15-seg1')
const NH13    = getRoute('nh13-seg1')
const NH13B   = getRoute('nh13b-seg1')
const NH6     = getRoute('nh6-seg1')
const NH6_REV = [...NH6].reverse()
const SH15_REV = [...SH15].reverse()

/* ── fleet ────────────────────────────────────────────────────────────────── */
export const mockVehicles: Vehicle[] = [

  // ── V1 — Emergency medical truck, Guwahati → Jorhat via NH-27 ──────────
  {
    id: 'v1',
    registrationNo: 'AS-01-AB-1234',
    type: 'truck',
    driver: 'Rajan Bora',
    driverPhone: '+91-9876543210',
    status: 'on_route',
    priority: 'high',
    cargoCategory: 'medical',
    cargo: 'Essential Medicines & Vaccines',
    origin: 'Guwahati',
    destination: 'Jorhat',
    routePoints: NH27,
    currentLocation: along(NH27, 35),
    routeId: 'route-nh27',
    speed: 52,
    progress: 35,
    eta: new Date(Date.now() + 8100000).toISOString(),
    distanceRemaining: 168,
    lastUpdate: new Date(Date.now() - 90000).toISOString(),
    heading: 72,
    fuelLevel: 68,
    district: 'Nagaon',
  },

  // ── V2 — Food van, N.Lakhimpur → Itanagar via SH-15 ──────────────────
  {
    id: 'v2',
    registrationNo: 'AS-05-CD-7890',
    type: 'van',
    driver: 'Priya Das',
    driverPhone: '+91-9876543211',
    status: 'on_route',
    priority: 'medium',
    cargoCategory: 'food',
    cargo: 'Rice & Pulses',
    origin: 'North Lakhimpur',
    destination: 'Itanagar',
    routePoints: SH15,
    currentLocation: along(SH15, 55),
    routeId: 'route-sh15',
    speed: 45,
    progress: 55,
    eta: new Date(Date.now() + 5400000).toISOString(),
    distanceRemaining: 78,
    lastUpdate: new Date(Date.now() - 180000).toISOString(),
    heading: 255,
    fuelLevel: 82,
    district: 'Papum Pare',
  },

  // ── V3 — Construction truck, Guwahati → Lumding via NH-37, delayed ─────
  {
    id: 'v3',
    registrationNo: 'AS-14-EF-4567',
    type: 'truck',
    driver: 'Mahesh Gogoi',
    driverPhone: '+91-9876543212',
    status: 'delayed',
    priority: 'high',
    cargoCategory: 'other',
    cargo: 'Construction Materials',
    origin: 'Guwahati',
    destination: 'Lumding',
    routePoints: NH37,
    currentLocation: along(NH37, 42),
    routeId: 'route-nh37',
    speed: 28,
    progress: 42,
    eta: new Date(Date.now() + 14400000).toISOString(),
    distanceRemaining: 92,
    lastUpdate: new Date(Date.now() - 300000).toISOString(),
    heading: 155,
    fuelLevel: 55,
    district: 'Hojai',
    affectedByRoadId: 'nh37-seg1',
  },

  // ── V4 — Ambulance, Dibrugarh → Pasighat  (STOPPED — NH-415 blocked) ───
  {
    id: 'v4',
    registrationNo: 'AR-01-GH-2345',
    type: 'ambulance',
    driver: 'Sanjay Taye',
    driverPhone: '+91-9876543213',
    status: 'stopped',
    priority: 'emergency',
    cargoCategory: 'medical',
    cargo: 'Emergency Surgical Equipment',
    origin: 'Dibrugarh',
    destination: 'Pasighat',
    routePoints: NH415,
    currentLocation: along(NH415, 25),
    routeId: 'route-nh415',
    speed: 0,
    progress: 25,
    eta: new Date(Date.now() + 21600000).toISOString(),
    distanceRemaining: 87,
    lastUpdate: new Date(Date.now() - 600000).toISOString(),
    heading: 12,
    fuelLevel: 71,
    district: 'Tinsukia',
    affectedByRoadId: 'nh415-seg1',
  },

  // ── V5 — Food truck, Itanagar → Along via NH-13, delayed ───────────────
  {
    id: 'v5',
    registrationNo: 'AR-03-IJ-5678',
    type: 'truck',
    driver: 'Karma Wangdi',
    driverPhone: '+91-9876543214',
    status: 'delayed',
    priority: 'medium',
    cargoCategory: 'food',
    cargo: 'Food Rations',
    origin: 'Itanagar',
    destination: 'Along',
    routePoints: NH13,
    currentLocation: along(NH13, 40),
    routeId: 'route-nh13',
    speed: 22,
    progress: 40,
    eta: new Date(Date.now() + 18000000).toISOString(),
    distanceRemaining: 94,
    lastUpdate: new Date(Date.now() - 240000).toISOString(),
    heading: 30,
    fuelLevel: 44,
    district: 'Lower Subansiri',
  },

  // ── V6 — Fuel tanker, Dibrugarh → Pasighat (STOPPED — NH-415 blocked) ─
  {
    id: 'v6',
    registrationNo: 'AR-05-KL-3456',
    type: 'tanker',
    driver: 'Bikash Mech',
    driverPhone: '+91-9876543215',
    status: 'stopped',
    priority: 'high',
    cargoCategory: 'other',
    cargo: 'Diesel Fuel',
    origin: 'Dibrugarh',
    destination: 'Pasighat',
    routePoints: NH415,
    currentLocation: along(NH415, 15),
    routeId: 'route-nh415',
    speed: 0,
    progress: 15,
    eta: new Date(Date.now() + 28800000).toISOString(),
    distanceRemaining: 102,
    lastUpdate: new Date(Date.now() - 900000).toISOString(),
    heading: 12,
    fuelLevel: 90,
    district: 'Tinsukia',
    affectedByRoadId: 'nh415-seg1',
  },

  // ── V7 — Textiles truck, Guwahati → Lumding via NH-37, delayed ─────────
  {
    id: 'v7',
    registrationNo: 'AS-22-MN-6789',
    type: 'truck',
    driver: 'Dulal Hazarika',
    driverPhone: '+91-9876543216',
    status: 'delayed',
    priority: 'medium',
    cargoCategory: 'other',
    cargo: 'Textiles',
    origin: 'Guwahati',
    destination: 'Lumding',
    routePoints: NH37,
    currentLocation: along(NH37, 60),
    routeId: 'route-nh37',
    speed: 35,
    progress: 60,
    eta: new Date(Date.now() + 9000000).toISOString(),
    distanceRemaining: 68,
    lastUpdate: new Date(Date.now() - 150000).toISOString(),
    heading: 150,
    fuelLevel: 62,
    district: 'Hojai',
  },

  // ── V8 — Electronics van, Shillong → Guwahati via NH-6 (reversed) ──────
  {
    id: 'v8',
    registrationNo: 'ML-01-OP-9012',
    type: 'van',
    driver: 'Suresh Khongwir',
    driverPhone: '+91-9876543217',
    status: 'on_route',
    priority: 'low',
    cargoCategory: 'other',
    cargo: 'Electronics',
    origin: 'Shillong',
    destination: 'Guwahati',
    routePoints: NH6_REV,
    currentLocation: along(NH6_REV, 72),
    routeId: 'route-nh6-rev',
    speed: 58,
    progress: 72,
    eta: new Date(Date.now() + 3600000).toISOString(),
    distanceRemaining: 22,
    lastUpdate: new Date(Date.now() - 90000).toISOString(),
    heading: 348,
    fuelLevel: 77,
    district: 'Kamrup Metro',
  },

  // ── V9 — Water tanker, Dibrugarh → Pasighat (STOPPED — NH-415 blocked) ─
  {
    id: 'v9',
    registrationNo: 'AR-07-QR-1234',
    type: 'tanker',
    driver: 'Tapa Gao',
    driverPhone: '+91-9876543218',
    status: 'stopped',
    priority: 'emergency',
    cargoCategory: 'water',
    cargo: 'Potable Water',
    origin: 'Dibrugarh',
    destination: 'Pasighat',
    routePoints: NH415,
    currentLocation: along(NH415, 8),
    routeId: 'route-nh415',
    speed: 0,
    progress: 8,
    eta: new Date(Date.now() + 36000000).toISOString(),
    distanceRemaining: 115,
    lastUpdate: new Date(Date.now() - 1200000).toISOString(),
    heading: 12,
    fuelLevel: 85,
    district: 'Tinsukia',
    affectedByRoadId: 'nh415-seg1',
  },

  // ── V10 — Agricultural inputs, Lumding → Dibrugarh via NH-715 ──────────
  {
    id: 'v10',
    registrationNo: 'AS-09-ST-3456',
    type: 'truck',
    driver: 'Ajoy Kalita',
    driverPhone: '+91-9876543219',
    status: 'on_route',
    priority: 'medium',
    cargoCategory: 'food',
    cargo: 'Agricultural Inputs & Seeds',
    origin: 'Lumding',
    destination: 'Dibrugarh',
    routePoints: NH715,
    currentLocation: along(NH715, 30),
    routeId: 'route-nh715',
    speed: 48,
    progress: 30,
    eta: new Date(Date.now() + 14400000).toISOString(),
    distanceRemaining: 210,
    lastUpdate: new Date(Date.now() - 60000).toISOString(),
    heading: 55,
    fuelLevel: 91,
    district: 'Karbi Anglong',
  },

  // ── V11 — Rescue vehicle, Tezpur → Tawang via NH-13B ──────────────────
  {
    id: 'v11',
    registrationNo: 'AR-09-UV-5678',
    type: 'rescue',
    driver: 'Dorje Tashi',
    driverPhone: '+91-9876543220',
    status: 'on_route',
    priority: 'emergency',
    cargoCategory: 'medical',
    cargo: 'Rescue Equipment & First Aid',
    origin: 'Tezpur',
    destination: 'Tawang',
    routePoints: NH13B,
    currentLocation: along(NH13B, 45),
    routeId: 'route-nh13b',
    speed: 38,
    progress: 45,
    eta: new Date(Date.now() + 12600000).toISOString(),
    distanceRemaining: 142,
    lastUpdate: new Date(Date.now() - 120000).toISOString(),
    heading: 320,
    fuelLevel: 60,
    district: 'West Kameng',
  },

  // ── V12 — Medical van, Itanagar → N.Lakhimpur via SH-15 (reversed) ─────
  {
    id: 'v12',
    registrationNo: 'AS-25-WX-9012',
    type: 'van',
    driver: 'Biju Moran',
    driverPhone: '+91-9876543221',
    status: 'on_route',
    priority: 'high',
    cargoCategory: 'medical',
    cargo: 'Dialysis Supplies',
    origin: 'Itanagar',
    destination: 'North Lakhimpur',
    routePoints: SH15_REV,
    currentLocation: along(SH15_REV, 20),
    routeId: 'route-sh15-rev',
    speed: 55,
    progress: 20,
    eta: new Date(Date.now() + 7200000).toISOString(),
    distanceRemaining: 45,
    lastUpdate: new Date(Date.now() - 60000).toISOString(),
    heading: 285,
    fuelLevel: 74,
    district: 'Papum Pare',
  },
]
