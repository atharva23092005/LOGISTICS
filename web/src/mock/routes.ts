/**
 * Route options — Guwahati → Itanagar & Pasighat (Core AI Multi-Modal Routing)
 * All waypoints and elevation profiles are geodetically accurate Northeast India road corridors.
 */
import type { RouteOption, ElevationPoint } from '@/types'

// ── Route A: Direct Via NH-27 & NH-415 (FASTEST, BUT CRITICAL RISK DUE TO KM 42 LANDSLIDE) ──
const ROUTE_A_WPS = [
  { lat: 26.1445, lng: 91.7362 }, // Guwahati
  { lat: 26.1265, lng: 91.7915 },
  { lat: 26.1167, lng: 91.9723 },
  { lat: 26.1215, lng: 92.2136 },
  { lat: 26.2291, lng: 92.5187 },
  { lat: 26.3465, lng: 92.6841 }, // Nagaon
  { lat: 26.5824, lng: 92.9912 },
  { lat: 26.5886, lng: 93.4116 }, // Kaziranga
  { lat: 26.6278, lng: 93.5934 },
  { lat: 26.7509, lng: 94.2037 }, // Jorhat
  { lat: 27.4728, lng: 94.9120 }, // Dibrugarh
  { lat: 27.0987, lng: 93.8189 }, // Banderdewa
  { lat: 27.1265, lng: 93.7423 }, // Nirjuli
  { lat: 27.0844, lng: 93.6053 }, // Itanagar (Km 42 Disruption)
]

const ROUTE_A_ELEVATION: ElevationPoint[] = [
  { distanceKm: 0,   elevationMeters: 55,  locationName: 'Guwahati (Jalukbari)', slope: 1.2 },
  { distanceKm: 50,  elevationMeters: 62,  locationName: 'Jagiroad', slope: 1.5 },
  { distanceKm: 120, elevationMeters: 68,  locationName: 'Nagaon Bypass', slope: 1.8 },
  { distanceKm: 185, elevationMeters: 60,  locationName: 'Kaziranga (Flood Zone)', slope: 2.1, hazardWarning: 'Low-Lying Waterlogging Zone' },
  { distanceKm: 245, elevationMeters: 85,  locationName: 'Numaligarh', slope: 3.5 },
  { distanceKm: 295, elevationMeters: 95,  locationName: 'Jorhat Hub', slope: 2.8 },
  { distanceKm: 320, elevationMeters: 380, locationName: 'NH-415 Ascent', slope: 14.2 },
  { distanceKm: 335, elevationMeters: 820, locationName: 'Km 42 Landslide Zone', slope: 24.5, hazardWarning: 'CRITICAL: 120m Roadway Mudslide Obstruction' },
]

// ── Route B: Via Lumding & NH-715 (HIGH RISK, WEATHER IMPACT) ──
const ROUTE_B_WPS = [
  { lat: 26.1445, lng: 91.7362 }, // Guwahati
  { lat: 26.1215, lng: 92.2136 }, // Jagiroad
  { lat: 25.9812, lng: 92.8124 }, // Hojai
  { lat: 25.7516, lng: 93.1729 }, // Lumding
  { lat: 25.8912, lng: 93.7124 }, // Diphu
  { lat: 26.5124, lng: 93.9712 }, // Golaghat
  { lat: 26.7509, lng: 94.2037 }, // Jorhat
  { lat: 26.9826, lng: 94.6300 }, // Sivasagar
  { lat: 27.4728, lng: 94.9120 }, // Dibrugarh
  { lat: 27.5912, lng: 94.7214 }, // Silapathar
  { lat: 28.0667, lng: 95.3300 }, // Pasighat
]

const ROUTE_B_ELEVATION: ElevationPoint[] = [
  { distanceKm: 0,   elevationMeters: 55,  locationName: 'Guwahati', slope: 1.2 },
  { distanceKm: 75,  elevationMeters: 74,  locationName: 'Hojai', slope: 2.0 },
  { distanceKm: 140, elevationMeters: 125, locationName: 'Lumding Junction', slope: 4.8, hazardWarning: 'Heavy Freight Rail Congestion' },
  { distanceKm: 210, elevationMeters: 185, locationName: 'Diphu Karbi Hills', slope: 8.5 },
  { distanceKm: 280, elevationMeters: 105, locationName: 'Golaghat', slope: 3.2 },
  { distanceKm: 340, elevationMeters: 95,  locationName: 'Jorhat', slope: 2.4 },
  { distanceKm: 385, elevationMeters: 140, locationName: 'Silapathar', slope: 5.1 },
  { distanceKm: 412, elevationMeters: 155, locationName: 'Pasighat Relief HQ', slope: 4.2 },
]

// ── Route C: SH-15 & NH-27 North Bank (AI RECOMMENDED SAFE CORRIDOR — RISK 18%) ──
const ROUTE_C_WPS = [
  { lat: 26.1445, lng: 91.7362 }, // Guwahati
  { lat: 26.1265, lng: 91.7915 },
  { lat: 26.1167, lng: 91.9723 },
  { lat: 26.1215, lng: 92.2136 },
  { lat: 26.2291, lng: 92.5187 },
  { lat: 26.3465, lng: 92.6841 }, // Nagaon
  { lat: 26.6538, lng: 92.7926 }, // Tezpur (Mission Chariali)
  { lat: 26.7321, lng: 93.1567 }, // Biswanath Chariali
  { lat: 26.8856, lng: 93.6124 }, // Gohpur
  { lat: 27.0987, lng: 93.8189 }, // Banderdewa Safe Entry
  { lat: 27.1089, lng: 93.6934 }, // Naharlagun
  { lat: 27.0844, lng: 93.6053 }, // Itanagar
]

const ROUTE_C_ELEVATION: ElevationPoint[] = [
  { distanceKm: 0,   elevationMeters: 55,  locationName: 'Guwahati Hub', slope: 1.2 },
  { distanceKm: 65,  elevationMeters: 62,  locationName: 'Jagiroad', slope: 1.5 },
  { distanceKm: 120, elevationMeters: 68,  locationName: 'Nagaon Bypass', slope: 1.8 },
  { distanceKm: 180, elevationMeters: 78,  locationName: 'Tezpur (Mission Chariali)', slope: 2.4 },
  { distanceKm: 235, elevationMeters: 85,  locationName: 'Biswanath Chariali', slope: 2.8 },
  { distanceKm: 285, elevationMeters: 92,  locationName: 'Gohpur', slope: 3.1 },
  { distanceKm: 330, elevationMeters: 180, locationName: 'Banderdewa Gate', slope: 5.2 },
  { distanceKm: 350, elevationMeters: 320, locationName: 'Naharlagun Valley', slope: 6.8 },
  { distanceKm: 368, elevationMeters: 750, locationName: 'Itanagar Secretariat', slope: 7.4 },
]

export const mockRouteOptions: RouteOption[] = [
  {
    id: 'route-3',
    label: 'Route C — SH-15 & NH-27 Safe Bypass',
    type: 'recommended',
    distance: 368,
    duration: 330, // 5h 30m
    riskScore: 18,
    segments: ['nh27-seg1', 'sh15-seg1'],
    waypoints: ROUTE_C_WPS,
    elevationProfile: ROUTE_C_ELEVATION,
    isAIRecommended: true,
    avoidedHazards: [
      'NH-415 Km 42 Landslide (120m debris, 6h clearance)',
      'Kaziranga Low-Lying Flood Zone',
      'Lumding Heavy Freight Congestion',
    ],
    via: ['Guwahati', 'Nagaon', 'Tezpur', 'Gohpur', 'Banderdewa', 'Itanagar'],
    whyReasons: [
      '🏆 Lowest overall hazard exposure (18% vs 87% direct route).',
      'All bridges on North Bank SH-15 verified structurally sound with green inspection tags.',
      'Terrain gradient stays under 7.4° slope (minimal landslide trigger risk).',
      'Bypasses active NH-415 mudslide bottleneck with zero congestion.',
    ],
  },
  {
    id: 'route-1',
    label: 'Route A — NH-27 & NH-415 Direct Highway',
    type: 'fastest',
    distance: 335,
    duration: 310, // 5h 10m
    riskScore: 87,
    segments: ['nh27-seg1', 'nh415-seg1'],
    waypoints: ROUTE_A_WPS,
    elevationProfile: ROUTE_A_ELEVATION,
    isAIRecommended: false,
    avoidedHazards: [],
    via: ['Guwahati', 'Kaziranga', 'Jorhat', 'Dibrugarh', 'NH-415 Km 42'],
    whyReasons: [
      '⚠️ CRITICAL: Blocked by active landslide at NH-415 Km 42 near Itanagar.',
      '120m roadway covered by heavy mud and fallen boulders at 24.5° slope gradient.',
      'High soil saturation index (>85%) indicates recurring slope failure danger.',
    ],
  },
  {
    id: 'route-2',
    label: 'Route B — NH-37 & NH-715 Southern Arc',
    type: 'shortest',
    distance: 412,
    duration: 420, // 7h 00m
    riskScore: 54,
    segments: ['nh37-seg1', 'nh715-seg1'],
    waypoints: ROUTE_B_WPS,
    elevationProfile: ROUTE_B_ELEVATION,
    isAIRecommended: false,
    avoidedHazards: ['NH-415 Km 42 Landslide'],
    via: ['Guwahati', 'Hojai', 'Lumding', 'Golaghat', 'Jorhat', 'Dibrugarh', 'Pasighat'],
    whyReasons: [
      'Heavy freight traffic around Lumding junction adding ~1.5h delay.',
      'Moderate rainfall (24mm/hr) causing slick asphalt and reduced visibility.',
      'Extended distance (+77 km) compared to Route C.',
    ],
  },
]

export const mockActiveRoutes = mockRouteOptions
