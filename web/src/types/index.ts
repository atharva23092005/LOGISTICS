// ─── Coordinates ─────────────────────────────────────────────────────────────
export interface Coordinates {
  lat: number
  lng: number
}

// ─── User / Auth ──────────────────────────────────────────────────────────────
export type UserRole =
  | 'admin'
  | 'dispatcher'
  | 'district_admin'
  | 'senior_official'
  | 'field_officer'
  | 'driver'
  | 'citizen'
  | 'operator'
  | 'analyst'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  district: string
  avatar?: string
  lastSeen?: string
  assignedVehicleId?: string
}

// ─── Vehicle ──────────────────────────────────────────────────────────────────
export type VehicleStatus = 'on_route' | 'delayed' | 'stopped' | 'offline' | 'emergency'
export type VehicleType = 'truck' | 'van' | 'ambulance' | 'tanker' | 'rescue'
export type CargoPriority = 'emergency' | 'high' | 'medium' | 'low'
export type CargoCategory = 'medical' | 'food' | 'water' | 'other'

export interface Vehicle {
  id: string
  registrationNo: string
  type: VehicleType
  driver: string
  driverPhone: string
  status: VehicleStatus
  priority: CargoPriority
  cargoCategory: CargoCategory
  cargo: string
  origin: string
  destination: string
  currentLocation: Coordinates
  routePoints: Coordinates[]   // full polyline for interpolation
  routeId: string
  speed: number
  progress: number             // 0–100
  eta: string
  distanceRemaining: number
  lastUpdate: string
  heading: number
  fuelLevel: number
  district: string
  affectedByRoadId?: string    // set when a road blockage affects this vehicle
}

// ─── Road / Segment ───────────────────────────────────────────────────────────
export type RoadStatus = 'open' | 'partial' | 'blocked' | 'unknown'
export type RoadRisk   = 'low' | 'medium' | 'high' | 'critical'

export interface RoadSegment {
  id: string
  name: string
  highway: string
  status: RoadStatus
  risk: RoadRisk
  riskScore: number
  district: string
  coordinates: Coordinates[]
  blockedSince?: string
  reason?: string
  affectedVehicles: string[]
  weatherImpact: number
  lastInspection: string       // ISO — for freshness indicator
  slope: number                // degrees — for AI factor display
  bridgeCondition?: 'good' | 'caution' | 'poor'
  trafficLoad: number          // 0–100
}

// ─── Route ────────────────────────────────────────────────────────────────────
export type RouteType = 'fastest' | 'shortest' | 'safest' | 'recommended'

export interface ElevationPoint {
  distanceKm: number
  elevationMeters: number
  locationName: string
  slope: number // degrees gradient
  hazardWarning?: string
}

export interface RouteOption {
  id: string
  label: string
  type: RouteType
  distance: number
  duration: number
  riskScore: number
  segments: string[]
  waypoints: Coordinates[]
  isAIRecommended: boolean
  avoidedHazards: string[]
  via: string[]
  whyReasons: string[]         // human-readable explanation for WHY panel
  elevationProfile?: ElevationPoint[]
}

// ─── Alert / Event ────────────────────────────────────────────────────────────
export type AlertSeverity = 'info' | 'warning' | 'critical'
export type AlertStatus   = 'active' | 'acknowledged' | 'resolved'
export type AlertSource   = 'AI' | 'FIELD' | 'GPS' | 'WEATHER' | 'SYSTEM'

export type EventType =
  | 'ROAD_BLOCKED'
  | 'LANDSLIDE_PREDICTED'
  | 'FLOOD_WARNING'
  | 'VEHICLE_DELAYED'
  | 'VEHICLE_STOPPED'
  | 'ROUTE_RISK_CHANGED'
  | 'FIELD_INCIDENT_REPORTED'
  | 'ROUTE_RECALCULATED'
  | 'EMERGENCY_ACTIVATED'
  | 'WEATHER_ALERT'
  | 'ROAD_REOPENED'
  | 'VEHICLE_REROUTED'
  | 'OFFLINE_SYNC'
  | 'REROUTE_CONFIRMED'
  | 'REROUTE_OVERRIDDEN'

export interface LogisticsAlert {
  id: string
  type: EventType
  title: string
  description: string
  severity: AlertSeverity
  status: AlertStatus
  source: AlertSource
  timestamp: string
  location?: Coordinates
  locationName?: string
  affectedVehicles?: string[]
  affectedRoutes?: string[]
  roadId?: string
  actionsTaken?: string[]
  aiRiskScore?: number
  dataConfidence?: number      // 0–100
}

// ─── Incident (Field Report) ──────────────────────────────────────────────────
export type IncidentType   = 'landslide' | 'flood' | 'road_damage' | 'accident' | 'heavy_rain' | 'bridge_damage' | 'other'
export type IncidentStatus = 'reported' | 'verified' | 'in_progress' | 'resolved'
export type SyncStatus     = 'synced' | 'pending' | 'failed'

export interface Incident {
  id: string
  type: IncidentType
  title: string
  description: string
  severity: AlertSeverity
  status: IncidentStatus
  location: Coordinates
  locationName: string
  reportedBy: string
  reportedAt: string
  photos: string[]
  roadId?: string
  syncStatus: SyncStatus
}

// ─── Weather ──────────────────────────────────────────────────────────────────
export type WeatherCondition = 'clear' | 'cloudy' | 'rain' | 'heavy_rain' | 'storm' | 'fog'

export interface WeatherData {
  district: string
  condition: WeatherCondition
  temperature: number
  rainfall: number
  humidity: number
  windSpeed: number
  visibility: number
  floodRisk: number
  landslideRisk: number
  lastUpdate: string
  coordinates: Coordinates
  forecast: WeatherForecast[]
}

export interface WeatherForecast {
  hour: number
  condition: WeatherCondition
  rainfall: number
  risk: number
}

// ─── District ─────────────────────────────────────────────────────────────────
export interface DistrictHealthScore {
  roads: number      // 0–100
  weather: number
  fleet: number
  incidents: number
  overall: number
}

export interface District {
  id: string
  name: string
  state: string
  coordinates: Coordinates
  bounds: [Coordinates, Coordinates]
  activeVehicles: number
  blockedRoads: number
  activeAlerts: number
  riskLevel: RoadRisk
  healthScore: DistrictHealthScore
}

// ─── AI Prediction ────────────────────────────────────────────────────────────
export interface RiskFactor {
  name: string
  value: number
  weight: number
}

export interface RiskTimelinePoint {
  label: string   // e.g. "12:00", "14:00"
  risk: number    // 0–100
}

export interface AIPrediction {
  id: string
  roadId: string
  roadName: string
  riskScore: number
  riskLevel: RoadRisk
  predictionHorizon: number
  confidence: number
  factors: RiskFactor[]
  recommendation: string
  generatedAt: string
  riskTimeline: RiskTimelinePoint[]   // time-series for risk chart
  dataConfidence: number              // freshness / source confidence
  dataLastUpdated: string
}

// ─── AI Copilot Recommendation ────────────────────────────────────────────────
export interface CopilotRecommendation {
  id: string
  priority: 'critical' | 'high' | 'medium'
  title: string
  description: string
  action: string
  actionLabel: string
  icon: string
  relatedVehicleIds?: string[]
  relatedRoadId?: string
}

// ─── Emergency ────────────────────────────────────────────────────────────────
export type EmergencyLevel = 'normal' | 'elevated' | 'emergency' | 'crisis'
export type CargoCategoryPriority = 'medical' | 'food' | 'water' | 'other'

export interface EmergencyState {
  active: boolean
  level: EmergencyLevel
  activatedAt?: string
  activatedBy?: string
  reason?: string
  affectedDistricts: string[]
  priorityOrder: CargoCategoryPriority[]
  safeCorridors: string[]
}

// ─── What-If Simulation ───────────────────────────────────────────────────────
export interface WhatIfScenario {
  roadId: string
  roadName: string
  severityLabel: string
  rainfall: number
  durationHours: number
}

export interface WhatIfResult {
  scenario: WhatIfScenario
  before: {
    onTimePct: number
    avgDelayMin: number
    affectedVehicles: number
    cargoAtRiskLakh: number
  }
  after: {
    onTimePct: number
    avgDelayMin: number
    affectedVehicles: number
    cargoAtRiskLakh: number
  }
  withRerouting: {
    onTimePct: number
    avgDelayMin: number
    vehiclesRecovered: number
    cargoProtectedLakh: number
  }
  dispatchPriority: Array<{ category: CargoCategoryPriority; count: number }>
}

// ─── Demo Scenario ────────────────────────────────────────────────────────────
export type DemoScenario =
  | 'normal'
  | 'heavy_rain'
  | 'landslide_prediction'
  | 'road_blocked'
  | 'vehicle_delayed'
  | 'field_report'
  | 'emergency'

// ─── Analytics ────────────────────────────────────────────────────────────────
export interface DisruptionTrend {
  date: string
  landslides: number
  floods: number
  accidents: number
  total: number
}

export interface DistrictPerformance {
  district: string
  onTime: number
  delayed: number
  blocked: number
  avgDelay: number
}

export interface BottleneckData {
  roadId: string
  roadName: string
  incidents: number
  avgDelay: number
  coordinates: Coordinates
}
