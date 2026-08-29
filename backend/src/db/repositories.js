/**
 * NER Logistics — Unified Repositories
 * =====================================
 * CRUD operations transparently backed by PostgreSQL (when connected)
 * and in-memory persistent state (fallback).
 */
import { pool, isDbConnected } from './postgres.js'
import {
  roads as memoryRoads,
  weather as memoryWeather,
  vehicles as memoryVehicles,
  alerts as memoryAlerts,
  predictions as memoryPredictions,
} from '../data/validatedData.js'

let inMemoryVehicles = [...memoryVehicles]
let inMemoryAlerts = [...memoryAlerts]
let inMemoryIncidents = []
let inMemoryRoads = [...memoryRoads]
let inMemoryWeather = [...memoryWeather]

// ── 1. Vehicles Repository ───────────────────────────────────────────────────
export const vehicleRepository = {
  async getAll(filter = {}) {
    if (isDbConnected()) {
      try {
        let query = 'SELECT * FROM vehicles WHERE 1=1'
        const params = []
        if (filter.status) {
          params.push(filter.status)
          query += ` AND status = $${params.length}`
        }
        if (filter.priority) {
          params.push(filter.priority)
          query += ` AND priority = $${params.length}`
        }
        const res = await pool.query(query, params)
        return res.rows.map(mapVehicleFromDb)
      } catch (err) {
        console.warn('DB error, using fallback:', err.message)
      }
    }
    let result = [...inMemoryVehicles]
    if (filter.status)   result = result.filter((v) => v.status === filter.status)
    if (filter.priority) result = result.filter((v) => v.priority === filter.priority)
    return result
  },

  async getById(id) {
    if (isDbConnected()) {
      try {
        const res = await pool.query('SELECT * FROM vehicles WHERE id = $1', [id])
        if (res.rows.length > 0) return mapVehicleFromDb(res.rows[0])
      } catch (err) {
        console.warn('DB error, using fallback:', err.message)
      }
    }
    return inMemoryVehicles.find((v) => v.id === id) || null
  },

  async update(id, patch) {
    if (isDbConnected()) {
      try {
        const sets = []
        const params = [id]
        if (patch.status) { params.push(patch.status); sets.push(`status = $${params.length}`) }
        if (patch.speed !== undefined) { params.push(patch.speed); sets.push(`speed = $${params.length}`) }
        if (patch.currentLocation) { params.push(JSON.stringify(patch.currentLocation)); sets.push(`current_location = $${params.length}`) }
        if (patch.fuelLevel !== undefined) { params.push(patch.fuelLevel); sets.push(`fuel_level = $${params.length}`) }
        if (patch.progress !== undefined) { params.push(patch.progress); sets.push(`progress = $${params.length}`) }

        if (sets.length > 0) {
          sets.push(`last_update = CURRENT_TIMESTAMP`)
          const query = `UPDATE vehicles SET ${sets.join(', ')} WHERE id = $1 RETURNING *`
          const res = await pool.query(query, params)
          if (res.rows.length > 0) return mapVehicleFromDb(res.rows[0])
        }
      } catch (err) {
        console.warn('DB error, using fallback:', err.message)
      }
    }
    const idx = inMemoryVehicles.findIndex((v) => v.id === id)
    if (idx !== -1) {
      inMemoryVehicles[idx] = { ...inMemoryVehicles[idx], ...patch, lastUpdate: new Date().toISOString() }
      return inMemoryVehicles[idx]
    }
    return null
  },

  getState() {
    return inMemoryVehicles
  },
}

function mapVehicleFromDb(row) {
  return {
    id: row.id,
    registrationNo: row.registration_no,
    type: row.type,
    driver: row.driver,
    driverPhone: row.driver_phone,
    status: row.status,
    priority: row.priority,
    cargoCategory: row.cargo_category,
    cargo: row.cargo,
    origin: row.origin,
    destination: row.destination,
    speed: parseFloat(row.speed) || 0,
    progress: parseFloat(row.progress) || 0,
    eta: row.eta,
    distanceRemaining: parseFloat(row.distance_remaining) || 0,
    heading: parseFloat(row.heading) || 0,
    fuelLevel: parseFloat(row.fuel_level) || 100,
    district: row.district,
    routeId: row.route_id,
    affectedByRoadId: row.affected_by_road_id,
    currentLocation: typeof row.current_location === 'string' ? JSON.parse(row.current_location) : row.current_location,
    routePoints: typeof row.route_points === 'string' ? JSON.parse(row.route_points) : row.route_points,
    lastUpdate: row.last_update,
  }
}

// ── 2. Alerts Repository ──────────────────────────────────────────────────────
export const alertRepository = {
  async getAll() {
    if (isDbConnected()) {
      try {
        const res = await pool.query('SELECT * FROM alerts ORDER BY timestamp DESC')
        return res.rows.map(mapAlertFromDb)
      } catch (err) {
        console.warn('DB error, using fallback:', err.message)
      }
    }
    return inMemoryAlerts
  },

  async create(alert) {
    if (isDbConnected()) {
      try {
        await pool.query(
          `INSERT INTO alerts (id, type, title, description, severity, status, source, location, location_name, road_id, affected_vehicles, affected_routes, ai_risk_score, data_confidence)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            alert.id,
            alert.type,
            alert.title,
            alert.description || null,
            alert.severity,
            alert.status,
            alert.source,
            JSON.stringify(alert.location || null),
            alert.locationName || null,
            alert.roadId || null,
            JSON.stringify(alert.affectedVehicles || []),
            JSON.stringify(alert.affectedRoutes || []),
            alert.aiRiskScore || null,
            alert.dataConfidence || 85,
          ]
        )
      } catch (err) {
        console.warn('DB error on alert insert:', err.message)
      }
    }
    inMemoryAlerts.unshift(alert)
    return alert
  },

  async updateStatus(id, status) {
    if (isDbConnected()) {
      try {
        await pool.query('UPDATE alerts SET status = $1 WHERE id = $2', [status, id])
      } catch (err) {
        console.warn('DB error on alert status update:', err.message)
      }
    }
    const idx = inMemoryAlerts.findIndex((a) => a.id === id)
    if (idx !== -1) {
      inMemoryAlerts[idx].status = status
      return inMemoryAlerts[idx]
    }
    return null
  },
}

function mapAlertFromDb(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    severity: row.severity,
    status: row.status,
    source: row.source,
    location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
    locationName: row.location_name,
    roadId: row.road_id,
    affectedVehicles: typeof row.affected_vehicles === 'string' ? JSON.parse(row.affected_vehicles) : row.affected_vehicles,
    affectedRoutes: typeof row.affected_routes === 'string' ? JSON.parse(row.affected_routes) : row.affected_routes,
    aiRiskScore: parseFloat(row.ai_risk_score) || undefined,
    dataConfidence: parseFloat(row.data_confidence) || undefined,
    timestamp: row.timestamp,
  }
}

// ── 3. Incidents Repository ──────────────────────────────────────────────────
export const incidentRepository = {
  async getAll() {
    if (isDbConnected()) {
      try {
        const res = await pool.query('SELECT * FROM incidents ORDER BY reported_at DESC')
        return res.rows.map(mapIncidentFromDb)
      } catch (err) {
        console.warn('DB error, using fallback:', err.message)
      }
    }
    return inMemoryIncidents
  },

  async create(incident) {
    if (isDbConnected()) {
      try {
        await pool.query(
          `INSERT INTO incidents (id, type, title, description, severity, status, location, location_name, reported_by, photos, road_id, sync_status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [
            incident.id,
            incident.type,
            incident.title,
            incident.description || null,
            incident.severity || 'warning',
            incident.status || 'reported',
            JSON.stringify(incident.location),
            incident.locationName || null,
            incident.reportedBy || 'Field Officer',
            JSON.stringify(incident.photos || []),
            incident.roadId || null,
            incident.syncStatus || 'synced',
          ]
        )
      } catch (err) {
        console.warn('DB error on incident create:', err.message)
      }
    }
    inMemoryIncidents.unshift(incident)
    return incident
  },

  async updateStatus(id, status) {
    if (isDbConnected()) {
      try {
        await pool.query('UPDATE incidents SET status = $1 WHERE id = $2', [status, id])
      } catch (err) {
        console.warn('DB error on incident update:', err.message)
      }
    }
    const inc = inMemoryIncidents.find((i) => i.id === id)
    if (inc) {
      inc.status = status
      return inc
    }
    return null
  },
}

function mapIncidentFromDb(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    severity: row.severity,
    status: row.status,
    location: typeof row.location === 'string' ? JSON.parse(row.location) : row.location,
    locationName: row.location_name,
    reportedBy: row.reported_by,
    reportedAt: row.reported_at,
    photos: typeof row.photos === 'string' ? JSON.parse(row.photos) : row.photos,
    roadId: row.road_id,
    syncStatus: row.sync_status,
  }
}

// ── 4. Roads Repository ──────────────────────────────────────────────────────
export const roadRepository = {
  async getAll() {
    if (isDbConnected()) {
      try {
        const res = await pool.query('SELECT * FROM roads ORDER BY id ASC')
        if (res.rows.length > 0) return res.rows.map(mapRoadFromDb)
      } catch (err) {
        console.warn('DB error on road fetch:', err.message)
      }
    }
    return inMemoryRoads
  },
}

function mapRoadFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    highway: row.highway,
    district: row.district,
    state: row.state,
    status: row.status,
    risk: row.risk,
    riskScore: parseFloat(row.risk_score) || 0,
    slope: parseFloat(row.slope) || 0,
    elevation: parseFloat(row.elevation) || 0,
    bridgeCondition: row.bridge_condition,
    weatherImpact: parseFloat(row.weather_impact) || 0,
    trafficLoad: parseFloat(row.traffic_load) || 0,
    reason: row.reason,
    coordinates: typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates,
    affectedVehicles: typeof row.affected_vehicles === 'string' ? JSON.parse(row.affected_vehicles) : row.affected_vehicles,
    lastInspection: row.last_inspection,
  }
}

// ── 5. Weather Repository ────────────────────────────────────────────────────
export const weatherRepository = {
  async getAll() {
    if (isDbConnected()) {
      try {
        const res = await pool.query('SELECT * FROM weather_telemetry')
        if (res.rows.length > 0) return res.rows.map(mapWeatherFromDb)
      } catch (err) {
        console.warn('DB error on weather fetch:', err.message)
      }
    }
    return inMemoryWeather
  },

  async getByDistrict(district) {
    if (isDbConnected()) {
      try {
        const res = await pool.query('SELECT * FROM weather_telemetry WHERE LOWER(district) = LOWER($1)', [district])
        if (res.rows.length > 0) return mapWeatherFromDb(res.rows[0])
      } catch (err) {
        console.warn('DB error on weather by district:', err.message)
      }
    }
    return inMemoryWeather.find((w) => w.district.toLowerCase() === district.toLowerCase()) || null
  },
}

function mapWeatherFromDb(row) {
  return {
    district: row.district,
    state: row.state,
    condition: row.condition,
    temperature: parseFloat(row.temperature) || 0,
    rainfall: parseFloat(row.rainfall) || 0,
    humidity: parseFloat(row.humidity) || 0,
    windSpeed: parseFloat(row.wind_speed) || 0,
    visibility: parseFloat(row.visibility) || 0,
    floodRisk: parseFloat(row.flood_risk) || 0,
    landslideRisk: parseFloat(row.landslide_risk) || 0,
    coordinates: typeof row.coordinates === 'string' ? JSON.parse(row.coordinates) : row.coordinates,
    forecast: typeof row.forecast === 'string' ? JSON.parse(row.forecast) : row.forecast,
    lastUpdate: row.last_update,
  }
}
