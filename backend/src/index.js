import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import authRoutes      from './auth/authRoutes.js'
import vehicleRoutes   from './vehicles/vehicleRoutes.js'
import alertRoutes     from './alerts/alertRoutes.js'
import routeRoutes     from './routes/routeRoutes.js'
import incidentRoutes  from './incidents/incidentRoutes.js'
import weatherRoutes   from './weather/weatherRoutes.js'
import emergencyRoutes from './emergency/emergencyRoutes.js'
import analyticsRoutes from './analytics/analyticsRoutes.js'
import publicRoutes    from './public/publicRoutes.js'
import copilotRoutes   from './copilot/copilotRoutes.js'
import { startSimulator } from './websocket/simulator.js'
import { initDatabase } from './db/postgres.js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
})

// Initialize PostgreSQL database & auto-seed
initDatabase().catch((err) => console.error('Database initialization error:', err))

// ── Middleware ────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(morgan('dev'))

// Inject io into every request
app.use((req, _res, next) => { req.io = io; next() })

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/vehicles',  vehicleRoutes)
app.use('/api/alerts',    alertRoutes)
app.use('/api/routes',    routeRoutes)
app.use('/api/incidents', incidentRoutes)
app.use('/api/weather',   weatherRoutes)
app.use('/api/emergency', emergencyRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/public',    publicRoutes)
app.use('/api/copilot',   copilotRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() })
})

// ── WebSocket ─────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)

  socket.on('subscribe:vehicles', () => socket.join('vehicles'))
  socket.on('subscribe:alerts',   () => socket.join('alerts'))
  socket.on('subscribe:district', (d) => socket.join(`district:${d}`))

  socket.on('event:emit', (data) => {
    // Broadcast events from frontend demo control
    io.emit(`event:${data.type?.toLowerCase()}`, data)
  })

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`)
  })
})

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT ?? 3001
httpServer.listen(PORT, () => {
  console.log(`\n🚀 NER Logistics Backend running on port ${PORT}`)
  console.log(`   API:       http://localhost:${PORT}/api`)
  console.log(`   WebSocket: ws://localhost:${PORT}`)
  console.log(`   Frontend:  ${process.env.FRONTEND_URL}\n`)
  startSimulator(io)
})

// ── Error handler ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})
