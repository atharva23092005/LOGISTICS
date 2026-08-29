/**
 * NER Logistics — PostgreSQL Database Layer
 * ==========================================
 * Manages connection pooling, table schema auto-migrations, and auto-seeding.
 * Grounded in validated real datasets from validatedData.js.
 */
import pg from 'pg'
import {
  roads as initialRoads,
  weather as initialWeather,
  vehicles as initialVehicles,
  alerts as initialAlerts,
  predictions as initialPredictions,
} from '../data/validatedData.js'

const { Pool } = pg

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/ner_logistics'

export const pool = new Pool({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 3000,
  idleTimeoutMillis: 10000,
  max: 10,
})

let isPostgresConnected = false

/**
 * Initializes tables in PostgreSQL if connected, otherwise enables in-memory/file fallback.
 */
export async function initDatabase() {
  try {
    const client = await pool.connect()
    isPostgresConnected = true
    console.log('✅ PostgreSQL connected successfully to:', DATABASE_URL)

    // 1. Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        email VARCHAR(128) UNIQUE NOT NULL,
        role VARCHAR(32) NOT NULL,
        district VARCHAR(64),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS roads (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        highway VARCHAR(32) NOT NULL,
        district VARCHAR(128),
        state VARCHAR(64),
        status VARCHAR(32) NOT NULL,
        risk VARCHAR(32) NOT NULL,
        risk_score NUMERIC NOT NULL,
        slope NUMERIC,
        elevation NUMERIC,
        bridge_condition VARCHAR(32),
        weather_impact NUMERIC,
        traffic_load NUMERIC,
        reason TEXT,
        coordinates JSONB NOT NULL,
        affected_vehicles JSONB,
        last_inspection TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS weather_telemetry (
        district VARCHAR(64) PRIMARY KEY,
        state VARCHAR(64),
        condition VARCHAR(32),
        temperature NUMERIC,
        rainfall NUMERIC,
        humidity NUMERIC,
        wind_speed NUMERIC,
        visibility NUMERIC,
        flood_risk NUMERIC,
        landslide_risk NUMERIC,
        coordinates JSONB NOT NULL,
        forecast JSONB,
        last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vehicles (
        id VARCHAR(64) PRIMARY KEY,
        registration_no VARCHAR(32) UNIQUE NOT NULL,
        type VARCHAR(32) NOT NULL,
        driver VARCHAR(128) NOT NULL,
        driver_phone VARCHAR(32),
        status VARCHAR(32) NOT NULL,
        priority VARCHAR(32) NOT NULL,
        cargo_category VARCHAR(32),
        cargo VARCHAR(256),
        origin VARCHAR(128),
        destination VARCHAR(128),
        speed NUMERIC DEFAULT 0,
        progress NUMERIC DEFAULT 0,
        eta VARCHAR(64),
        distance_remaining NUMERIC,
        heading NUMERIC DEFAULT 0,
        fuel_level NUMERIC DEFAULT 100,
        district VARCHAR(64),
        route_id VARCHAR(64),
        affected_by_road_id VARCHAR(64),
        current_location JSONB NOT NULL,
        route_points JSONB NOT NULL,
        last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(64) NOT NULL,
        title VARCHAR(256) NOT NULL,
        description TEXT,
        severity VARCHAR(32) NOT NULL,
        status VARCHAR(32) NOT NULL,
        source VARCHAR(32) NOT NULL,
        location JSONB,
        location_name VARCHAR(128),
        road_id VARCHAR(64),
        affected_vehicles JSONB,
        affected_routes JSONB,
        ai_risk_score NUMERIC,
        data_confidence NUMERIC,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS incidents (
        id VARCHAR(64) PRIMARY KEY,
        type VARCHAR(64) NOT NULL,
        title VARCHAR(256) NOT NULL,
        description TEXT,
        severity VARCHAR(32) NOT NULL,
        status VARCHAR(32) NOT NULL,
        location JSONB NOT NULL,
        location_name VARCHAR(128),
        reported_by VARCHAR(128),
        reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        photos JSONB,
        road_id VARCHAR(64),
        sync_status VARCHAR(32) DEFAULT 'synced'
      );

      CREATE TABLE IF NOT EXISTS routes_history (
        id SERIAL PRIMARY KEY,
        origin VARCHAR(128) NOT NULL,
        destination VARCHAR(128) NOT NULL,
        recommended_route_id VARCHAR(64),
        blocked_segments JSONB,
        route_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // 2. Auto-Seed Initial Real Data if Empty
    const roadCountRes = await client.query('SELECT count(*) FROM roads')
    if (parseInt(roadCountRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding PostgreSQL with validated real data...')
      for (const r of initialRoads) {
        await client.query(
          `INSERT INTO roads (id, name, highway, district, state, status, risk, risk_score, slope, elevation, bridge_condition, weather_impact, traffic_load, reason, coordinates, affected_vehicles)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
           ON CONFLICT (id) DO NOTHING`,
          [
            r.id,
            r.name,
            r.highway,
            r.district,
            r.state,
            r.status,
            r.risk,
            r.riskScore,
            r.slope,
            r.elevation,
            r.bridgeCondition,
            r.weatherImpact,
            r.trafficLoad,
            r.reason || null,
            JSON.stringify(r.coordinates),
            JSON.stringify(r.affectedVehicles || []),
          ]
        )
      }

      for (const w of initialWeather) {
        await client.query(
          `INSERT INTO weather_telemetry (district, state, condition, temperature, rainfall, humidity, wind_speed, visibility, flood_risk, landslide_risk, coordinates, forecast)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           ON CONFLICT (district) DO NOTHING`,
          [
            w.district,
            w.state,
            w.condition,
            w.temperature,
            w.rainfall,
            w.humidity,
            w.windSpeed,
            w.visibility,
            w.floodRisk,
            w.landslideRisk,
            JSON.stringify(w.coordinates),
            JSON.stringify(w.forecast || []),
          ]
        )
      }

      for (const v of initialVehicles) {
        await client.query(
          `INSERT INTO vehicles (id, registration_no, type, driver, driver_phone, status, priority, cargo_category, cargo, origin, destination, speed, progress, eta, distance_remaining, heading, fuel_level, district, route_id, affected_by_road_id, current_location, route_points)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
           ON CONFLICT (id) DO NOTHING`,
          [
            v.id,
            v.registrationNo,
            v.type,
            v.driver,
            v.driverPhone,
            v.status,
            v.priority,
            v.cargoCategory,
            v.cargo,
            v.origin,
            v.destination,
            v.speed,
            v.progress,
            v.eta,
            v.distanceRemaining,
            v.heading,
            v.fuelLevel,
            v.district,
            v.routeId,
            v.affectedByRoadId || null,
            JSON.stringify(v.currentLocation),
            JSON.stringify(v.routePoints),
          ]
        )
      }

      for (const a of initialAlerts) {
        await client.query(
          `INSERT INTO alerts (id, type, title, description, severity, status, source, location, location_name, road_id, affected_vehicles, affected_routes, ai_risk_score, data_confidence)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
           ON CONFLICT (id) DO NOTHING`,
          [
            a.id,
            a.type,
            a.title,
            a.description,
            a.severity,
            a.status,
            a.source,
            JSON.stringify(a.location || null),
            a.locationName,
            a.roadId,
            JSON.stringify(a.affectedVehicles || []),
            JSON.stringify(a.affectedRoutes || []),
            a.aiRiskScore,
            a.dataConfidence,
          ]
        )
      }
      console.log('✅ PostgreSQL seeding complete!')
    }

    client.release()
  } catch (err) {
    isPostgresConnected = false
    console.warn(
      '⚠️ PostgreSQL connection not available (or timed out). Operating in resilient in-memory mode:',
      err.message
    )
  }
}

export function isDbConnected() {
  return isPostgresConnected
}
