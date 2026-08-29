/**
 * MapEngine — Professional Minimalist Glassmorphic GPS Live Tracking & Inspection System
 *
 * Features:
 *  - Zero Marker Displacement on Hover: Uses isolated inner child containers for hover scaling so MapLibre translate3d is never overwritten.
 *  - Instant Reliable Clicks: Unified Inspector Card for Vehicles, Roads, and Alerts.
 *  - Zoom-Responsive LOD: Markers shrink to minimal status dots when zoomed out (< 7.0) and expand to navigation pucks when zoomed in (>= 7.0).
 *  - Static & Stable Selection: Telemetry stays fixed and readable in the Inspector Card with real-time live data updates without jumping.
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import maplibregl from 'maplibre-gl'
import {
  X, Navigation, Phone, Clock, Gauge, Fuel, AlertTriangle, Eye, Compass,
  ShieldCheck, ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { useMapStore, type MapLayer, type BasemapStyle } from '@/stores/mapStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useAlertStore }   from '@/stores/alertStore'
import { useRouteStore }   from '@/stores/routeStore'
import { formatDuration, formatDistance, timeAgo } from '@/utils/format'
import { TripReplayScrubber } from '@/modules/fleet/TripReplayScrubber'
import type { Vehicle, RoadSegment, LogisticsAlert } from '@/types'

// ── Selectors ─────────────────────────────────────────────────────────────────
const selActiveLayers   = (s: ReturnType<typeof useMapStore.getState>)     => s.activeLayers
const selBasemapStyle   = (s: ReturnType<typeof useMapStore.getState>)     => s.basemapStyle
const selFlyToTarget    = (s: ReturnType<typeof useMapStore.getState>)     => s.flyToTarget
const selFlyToZoom      = (s: ReturnType<typeof useMapStore.getState>)     => s.flyToZoom
const selVehicles       = (s: ReturnType<typeof useVehicleStore.getState>) => s.vehicles
const selAllAlerts      = (s: ReturnType<typeof useAlertStore.getState>)   => s.alerts
const selAckAlert       = (s: ReturnType<typeof useAlertStore.getState>)   => s.acknowledgeAlert
const selResolveAlert   = (s: ReturnType<typeof useAlertStore.getState>)   => s.resolveAlert
const selRoads          = (s: ReturnType<typeof useRouteStore.getState>)   => s.roads
const selRouteOptions   = (s: ReturnType<typeof useRouteStore.getState>)   => s.routeOptions
const selSelectedRoute  = (s: ReturnType<typeof useRouteStore.getState>)   => s.selectedRouteId

// ── Domain Colors (Soft, non-glaring) ─────────────────────────────────────────
const ROAD_COLOR: Record<string, string> = {
  open:    '#10B981', // Muted Emerald
  partial: '#F59E0B', // Muted Amber
  blocked: '#EF4444', // Clean Red
  unknown: '#64748B',
}

const VEHICLE_COLOR: Record<string, string> = {
  on_route:  '#10B981',
  delayed:   '#F59E0B',
  stopped:   '#EF4444',
  offline:   '#64748B',
  emergency: '#EF4444',
}

// ── Clean Watermark-Free Basemap Tile Sources ─────────────────────────────────
const TILE_SOURCES: Record<BasemapStyle, { tiles: string[]; maxzoom: number }> = {
  google_dark: {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    ],
    maxzoom: 18,
  },
  google_streets: {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    ],
    maxzoom: 19,
  },
  google_satellite: {
    tiles: [
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    ],
    maxzoom: 19,
  },
}

function getStyleSpec(styleKey: BasemapStyle): maplibregl.StyleSpecification {
  const provider = TILE_SOURCES[styleKey] || TILE_SOURCES.google_dark
  return {
    version: 8,
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    sources: {
      'clean-basemap': {
        type: 'raster',
        tiles: provider.tiles,
        tileSize: 256,
        attribution: '© Esri, OpenStreetMap contributors',
        maxzoom: provider.maxzoom,
      },
    },
    layers: [
      {
        id: 'clean-basemap-layer',
        type: 'raster',
        source: 'clean-basemap',
        minzoom: 0,
        maxzoom: 22,
        paint: {
          'raster-opacity': 1.0,
        },
      },
    ],
  }
}

function vehicleIconText(type: string): string {
  switch (type) {
    case 'ambulance': return '🚑'
    case 'tanker':    return '⛽'
    case 'van':       return '🚐'
    default:          return '🚛'
  }
}

type SelectedEntity =
  | { type: 'vehicle'; data: Vehicle }
  | { type: 'road'; data: RoadSegment }
  | { type: 'alert'; data: LogisticsAlert }
  | null

interface MapEngineProps {
  className?: string
  layers?: MapLayer[]
  onVehicleClick?: (v: Vehicle) => void
  onAlertClick?: (a: LogisticsAlert) => void
  onRoadClick?: (r: RoadSegment) => void
}

export function MapEngine({
  className,
  layers,
  onVehicleClick,
  onAlertClick,
  onRoadClick,
}: MapEngineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const vehicleMarkersRef = useRef<Map<string, { marker: maplibregl.Marker; rootEl: HTMLDivElement; innerEl: HTMLDivElement }>>(new Map())
  const loadedRef = useRef(false)

  // Zoom Level State for LOD (Level of Detail)
  const [currentZoom, setCurrentZoom] = useState(7.4)
  const isZoomedOut = currentZoom < 7.0

  // Single unified selected entity for the Inspector Drawer
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>(null)
  const [isFollowingVehicle, setIsFollowingVehicle] = useState(false)
  const [showReplay, setShowReplay] = useState(false)

  const navigate = useNavigate()
  const storeActiveLayers = useMapStore(selActiveLayers)
  const basemapStyle = useMapStore(selBasemapStyle)
  const flyToTarget = useMapStore(selFlyToTarget)
  const flyToZoom = useMapStore(selFlyToZoom)
  const vehicles = useVehicleStore(selVehicles)
  const allAlerts = useAlertStore(selAllAlerts)
  const acknowledgeAlert = useAlertStore(selAckAlert)
  const resolveAlert = useAlertStore(selResolveAlert)
  const roads = useRouteStore(selRoads)
  const routeOptions = useRouteStore(selRouteOptions)
  const selectedRouteId = useRouteStore(selSelectedRoute)

  const activeLayers = layers ?? storeActiveLayers
  const activeAlerts = allAlerts.filter((a) => a.status === 'active')

  // Keep selected vehicle or alert data live as simulator updates
  const activeSelectedVehicle =
    selectedEntity?.type === 'vehicle'
      ? vehicles.find((v) => v.id === selectedEntity.data.id) ?? selectedEntity.data
      : null

  const activeSelectedAlert =
    selectedEntity?.type === 'alert'
      ? allAlerts.find((a) => a.id === selectedEntity.data.id) ?? selectedEntity.data
      : null

  // ── 1. Map Initialization ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: getStyleSpec(basemapStyle),
      center: [93.6, 26.8], // Central Northeast India
      zoom: 7.4,
      minZoom: 4.8,
      maxZoom: 18,
      attributionControl: false,
      renderWorldCopies: false,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left')
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }),
      'top-right'
    )
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right')

    mapRef.current = map

    map.on('load', () => {
      loadedRef.current = true
      addRoadLayers(map)
      addRouteLayers(map)
    })

    map.on('zoom', () => {
      setCurrentZoom(map.getZoom())
    })

    map.on('styledata', () => {
      if (loadedRef.current) {
        addRoadLayers(map)
        addRouteLayers(map)
      }
    })

    // Click background to deselect and dismiss card cleanly
    map.on('click', (e) => {
      if ((e.originalEvent.target as HTMLElement)?.closest('.maplibre-marker-root')) return
      setSelectedEntity(null)
      setIsFollowingVehicle(false)
    })

    return () => {
      loadedRef.current = false
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      vehicleMarkersRef.current.clear()
      map.remove()
      mapRef.current = null
    }
  }, [])

  // ── 2. Handle Basemap Theme Changes ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    map.setStyle(getStyleSpec(basemapStyle))
  }, [basemapStyle])

  // ── 3. Clean Highway Overlays ──────────────────────────────────────────────
  const addRoadLayers = useCallback((map: maplibregl.Map) => {
    roads.forEach((road) => {
      const srcId = `ner-road-${road.id}`
      const lineId = `ner-road-line-${road.id}`
      const glowId = `ner-road-glow-${road.id}`
      const color = ROAD_COLOR[road.status] ?? '#64748B'
      const coords = road.coordinates.map((c) => [c.lng, c.lat] as [number, number])

      if (!map.getSource(srcId)) {
        map.addSource(srcId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: coords },
            properties: { status: road.status, name: road.name },
          },
        })
      }

      // Subtle underlay for contrast
      if (!map.getLayer(glowId)) {
        map.addLayer({
          id: glowId,
          type: 'line',
          source: srcId,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': color,
            'line-width': ['interpolate', ['linear'], ['zoom'], 5, 4, 8, 8, 12, 12],
            'line-opacity': 0.14,
            'line-blur': 2,
          },
        })
      }

      // Main Road Line (Clean and Sharp)
      if (!map.getLayer(lineId)) {
        map.addLayer({
          id: lineId,
          type: 'line',
          source: srcId,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': color,
            'line-width': ['interpolate', ['linear'], ['zoom'], 5, 2.2, 8, 3.5, 12, 5.5],
            'line-opacity': 0.9,
            'line-dasharray': road.status === 'blocked' ? [3, 2] : [1],
          },
        })

        // Road click opens unified inspector card
        map.on('click', lineId, (e) => {
          e.originalEvent.stopPropagation()
          setSelectedEntity({ type: 'road', data: road })
          setIsFollowingVehicle(false)
          onRoadClick?.(road)
        })
        map.on('mouseenter', lineId, () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', lineId, () => { map.getCanvas().style.cursor = '' })
      }
    })
  }, [roads, onRoadClick])

  // ── 4. AI Routes ───────────────────────────────────────────────────────────
  const addRouteLayers = useCallback((map: maplibregl.Map) => {
    routeOptions.forEach((route) => {
      const srcId = `ner-route-${route.id}`
      const lineId = `ner-route-line-${route.id}`
      const isSel = route.id === selectedRouteId
      const color = route.isAIRecommended ? '#10B981' : '#3B82F6'
      const coords = route.waypoints.map((c) => [c.lng, c.lat] as [number, number])

      if (!map.getSource(srcId)) {
        map.addSource(srcId, {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} },
        })
      }
      if (!map.getLayer(lineId)) {
        map.addLayer({
          id: lineId,
          type: 'line',
          source: srcId,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': color,
            'line-width': isSel ? 4 : 2,
            'line-opacity': isSel ? 0.95 : 0.35,
            'line-dasharray': [4, 2],
          },
        })
      }
    })
  }, [routeOptions, selectedRouteId])

  // ── 5. Layer Visibility ────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !loadedRef.current) return
    roads.forEach((r) => {
      const vis = activeLayers.includes('roads') ? 'visible' : 'none'
      if (map.getLayer(`ner-road-line-${r.id}`)) map.setLayoutProperty(`ner-road-line-${r.id}`, 'visibility', vis)
      if (map.getLayer(`ner-road-glow-${r.id}`)) map.setLayoutProperty(`ner-road-glow-${r.id}`, 'visibility', vis)
    })
    routeOptions.forEach((r) => {
      const vis = activeLayers.includes('routes') ? 'visible' : 'none'
      if (map.getLayer(`ner-route-line-${r.id}`)) map.setLayoutProperty(`ner-route-line-${r.id}`, 'visibility', vis)
    })
  }, [activeLayers, roads, routeOptions])

  // ── 6. Robust Vehicle Markers (Isolated Inner Scaling) ─────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const existing = vehicleMarkersRef.current
    const isVehiclesVisible = activeLayers.includes('vehicles')

    if (!isVehiclesVisible) {
      existing.forEach(({ marker }) => (marker.getElement().style.display = 'none'))
      return
    } else {
      existing.forEach(({ marker }) => (marker.getElement().style.display = ''))
    }

    const seenIds = new Set<string>()

    vehicles.forEach((v) => {
      seenIds.add(v.id)
      const color = VEHICLE_COLOR[v.status] ?? '#64748B'
      const isSelected = selectedEntity?.type === 'vehicle' && selectedEntity.data.id === v.id

      const existingRecord = existing.get(v.id)

      if (existingRecord) {
        // Move marker through MapLibre's setLngLat (never touching root element style.transform directly)
        existingRecord.marker.setLngLat([v.currentLocation.lng, v.currentLocation.lat])

        // Rotate directional arrow inside inner element
        const arrow = existingRecord.innerEl.querySelector('.marker-arrow') as HTMLElement | null
        if (arrow) {
          arrow.style.transform = `rotate(${v.heading}deg)`
        }

        // Apply Zoom LOD and selection styling to inner element
        if (isZoomedOut) {
          existingRecord.innerEl.style.width = '10px'
          existingRecord.innerEl.style.height = '10px'
          existingRecord.innerEl.style.borderWidth = '1.5px'
          const iconEl = existingRecord.innerEl.querySelector('.marker-icon') as HTMLElement | null
          if (iconEl) iconEl.style.display = 'none'
          if (arrow) arrow.style.display = 'none'
        } else {
          existingRecord.innerEl.style.width = isSelected ? '30px' : '24px'
          existingRecord.innerEl.style.height = isSelected ? '30px' : '24px'
          existingRecord.innerEl.style.borderWidth = isSelected ? '2.5px' : '1.5px'
          if (isSelected) {
            existingRecord.innerEl.style.boxShadow = `0 0 12px ${color}`
          } else {
            existingRecord.innerEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.5)'
          }
          const iconEl = existingRecord.innerEl.querySelector('.marker-icon') as HTMLElement | null
          if (iconEl) iconEl.style.display = ''
          if (arrow) arrow.style.display = ''
        }

        // Camera follow if active
        if (isFollowingVehicle && isSelected) {
          map.easeTo({
            center: [v.currentLocation.lng, v.currentLocation.lat],
            duration: 800,
          })
        }
      } else {
        // 1. Root Container (Used purely by MapLibre for translate3d)
        const rootEl = document.createElement('div')
        rootEl.className = 'maplibre-marker-root'
        rootEl.style.cssText = [
          'width: 32px',
          'height: 32px',
          'display: flex',
          'align-items: center',
          'justify-content: center',
          'cursor: pointer',
          'pointer-events: auto',
        ].join(';')

        // 2. Inner Puck (Safely transforms and scales without affecting MapLibre positioning)
        const innerEl = document.createElement('div')
        innerEl.className = 'vehicle-puck-inner'
        innerEl.style.cssText = [
          isZoomedOut ? 'width: 10px; height: 10px;' : 'width: 24px; height: 24px;',
          'border-radius: 50%',
          'background: rgba(13, 22, 38, 0.95)',
          'backdrop-filter: blur(8px)',
          `border: 1.5px solid ${color}`,
          'display: flex',
          'align-items: center',
          'justify-content: center',
          'position: relative',
          'box-shadow: 0 2px 6px rgba(0,0,0,0.5)',
          'transition: transform 0.15s ease-out, width 0.15s ease, height 0.15s ease',
          'user-select: none',
        ].join(';')

        // Directional Heading Arrow
        const arrow = document.createElement('div')
        arrow.className = 'marker-arrow'
        arrow.style.cssText = [
          'position: absolute',
          'inset: 0',
          'display: flex',
          'align-items: flex-start',
          'justify-content: center',
          `transform: rotate(${v.heading}deg)`,
          'transition: transform 0.3s ease-out',
          'pointer-events: none',
          isZoomedOut ? 'display: none;' : '',
        ].join(';')
        arrow.innerHTML = `
          <div style="
            width: 0;
            height: 0;
            border-left: 3px solid transparent;
            border-right: 3px solid transparent;
            border-bottom: 4px solid ${color};
            margin-top: -3.5px;
          "></div>
        `
        innerEl.appendChild(arrow)

        // Center Type Icon
        const icon = document.createElement('div')
        icon.className = 'marker-icon'
        icon.style.cssText = `font-size: 11px; line-height: 1; z-index: 2; pointer-events: none; ${isZoomedOut ? 'display: none;' : ''}`
        icon.textContent = vehicleIconText(v.type)
        innerEl.appendChild(icon)

        rootEl.appendChild(innerEl)

        // Hover scale applied exclusively to innerEl
        rootEl.addEventListener('mouseenter', () => {
          innerEl.style.transform = 'scale(1.25)'
          innerEl.style.boxShadow = `0 0 10px ${color}`
        })
        rootEl.addEventListener('mouseleave', () => {
          innerEl.style.transform = 'scale(1)'
          innerEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.5)'
        })

        // Click handler: reliable and robust
        rootEl.addEventListener('click', (e) => {
          e.stopPropagation()
          e.preventDefault()
          setSelectedEntity({ type: 'vehicle', data: v })
          onVehicleClick?.(v)
        })

        const marker = new maplibregl.Marker({ element: rootEl, anchor: 'center' })
          .setLngLat([v.currentLocation.lng, v.currentLocation.lat])
          .addTo(map)

        existing.set(v.id, { marker, rootEl, innerEl })
        markersRef.current.push(marker)
      }
    })

    existing.forEach(({ marker }, id) => {
      if (!seenIds.has(id)) {
        marker.remove()
        existing.delete(id)
        markersRef.current = markersRef.current.filter((m) => m !== marker)
      }
    })
  }, [vehicles, activeLayers, isZoomedOut, selectedEntity, isFollowingVehicle, onVehicleClick])

  // ── 7. Robust Incident Alert Markers (Isolated Inner Scaling) ──────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    markersRef.current.filter((m) => (m as any)._t === 'alert').forEach((m) => m.remove())
    markersRef.current = markersRef.current.filter((m) => (m as any)._t !== 'alert')

    if (!activeLayers.includes('alerts')) return

    activeAlerts.forEach((a) => {
      if (!a.location) return
      const color = a.severity === 'critical' ? '#EF4444' : a.severity === 'warning' ? '#F59E0B' : '#06B6D4'
      const isSelected = selectedEntity?.type === 'alert' && selectedEntity.data.id === a.id

      const rootEl = document.createElement('div')
      rootEl.className = 'maplibre-marker-root'
      rootEl.title = `${a.title} (${a.severity.toUpperCase()} — Click to inspect)`
      rootEl.style.cssText = [
        'width: 32px',
        'height: 32px',
        'display: flex',
        'align-items: center',
        'justify-content: center',
        'cursor: pointer',
        'pointer-events: auto',
      ].join(';')

      const innerEl = document.createElement('div')
      innerEl.style.cssText = [
        isZoomedOut ? (isSelected ? 'width: 14px; height: 14px;' : 'width: 10px; height: 10px;') : (isSelected ? 'width: 26px; height: 26px;' : 'width: 22px; height: 22px;'),
        'border-radius: 6px',
        'background: rgba(13, 22, 38, 0.95)',
        'backdrop-filter: blur(8px)',
        `border: ${isSelected ? '2.5px' : '1.5px'} solid ${color}`,
        isSelected ? `box-shadow: 0 0 14px ${color}` : 'box-shadow: 0 2px 6px rgba(0,0,0,0.5)',
        'display: flex',
        'align-items: center',
        'justify-content: center',
        isZoomedOut ? 'font-size: 0px;' : 'font-size: 11px; font-weight: bold;',
        `color: ${color};`,
        'transition: transform 0.15s ease-out, width 0.15s ease, height 0.15s ease',
        'user-select: none',
      ].join(';')
      innerEl.textContent = isZoomedOut ? '' : '!'

      rootEl.appendChild(innerEl)

      rootEl.addEventListener('mouseenter', () => {
        innerEl.style.transform = 'scale(1.25)'
        innerEl.style.boxShadow = `0 0 10px ${color}`
      })
      rootEl.addEventListener('mouseleave', () => {
        innerEl.style.transform = 'scale(1)'
        innerEl.style.boxShadow = isSelected ? `0 0 14px ${color}` : '0 2px 6px rgba(0,0,0,0.5)'
      })

      rootEl.addEventListener('click', (e) => {
        e.stopPropagation()
        e.preventDefault()
        setSelectedEntity({ type: 'alert', data: a })
        setIsFollowingVehicle(false)
        onAlertClick?.(a)
      })

      const marker = new maplibregl.Marker({ element: rootEl, anchor: 'center' })
        .setLngLat([a.location.lng, a.location.lat])
        .addTo(map)
      ;(marker as any)._t = 'alert'
      markersRef.current.push(marker)
    })
  }, [activeAlerts, activeLayers, isZoomedOut, selectedEntity, onAlertClick])

  // ── 8. FlyTo Target Coordinator ───────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !flyToTarget) return
    map.flyTo({
      center: [flyToTarget.lng, flyToTarget.lat],
      zoom: flyToZoom ?? 11,
      duration: 1600,
      essential: true,
    })
  }, [flyToTarget, flyToZoom])

  return (
    <div className={cn('w-full h-full relative overflow-hidden bg-[#0F172A]', className)}>
      <div ref={containerRef} className="w-full h-full" />

      {/* ── Single Unified Floating Glass Inspector Drawer (Zero Overlap) ── */}
      {selectedEntity && (
        <div className="absolute top-3 right-3 z-30 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] animate-scale-in">
          {/* ── VEHICLE CARD OR REPLAY SCRUBBER ── */}
          {selectedEntity.type === 'vehicle' && activeSelectedVehicle && (
            showReplay ? (
              <TripReplayScrubber
                vehicle={activeSelectedVehicle}
                onClose={() => setShowReplay(false)}
              />
            ) : (
              <div className="glass-panel rounded-2xl p-3.5 border border-white/10 shadow-2xl space-y-3 bg-[#0D1626]/90 backdrop-blur-xl text-text">
                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{vehicleIconText(activeSelectedVehicle.type)}</span>
                    <div>
                      <div className="font-mono font-bold text-xs text-white">
                        {activeSelectedVehicle.registrationNo}
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {activeSelectedVehicle.origin} → {activeSelectedVehicle.destination}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase"
                      style={{
                        background: `${VEHICLE_COLOR[activeSelectedVehicle.status]}20`,
                        color: VEHICLE_COLOR[activeSelectedVehicle.status],
                        border: `1px solid ${VEHICLE_COLOR[activeSelectedVehicle.status]}40`,
                      }}
                    >
                      {activeSelectedVehicle.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedEntity(null)
                        setIsFollowingVehicle(false)
                        setShowReplay(false)
                      }}
                      className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Real-time Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="text-[10px] text-text-muted flex items-center gap-1">
                      <Gauge className="h-3 w-3 text-primary" /> Live Speed
                    </div>
                    <div className="font-mono font-bold text-sm text-white mt-0.5">
                      {activeSelectedVehicle.speed} <span className="text-2xs font-normal text-text-dim">km/h</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="text-[10px] text-text-muted flex items-center gap-1">
                      <Fuel className="h-3 w-3 text-warning" /> Fuel Level
                    </div>
                    <div className="font-mono font-bold text-sm text-white mt-0.5">
                      {activeSelectedVehicle.fuelLevel}%
                    </div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="text-[10px] text-text-muted flex items-center gap-1">
                      <Clock className="h-3 w-3 text-success" /> Remaining ETA
                    </div>
                    <div className="font-semibold text-xs text-white mt-0.5">
                      {formatDuration(Math.max(0, Math.floor((new Date(activeSelectedVehicle.eta).getTime() - Date.now()) / 60000)))}
                    </div>
                  </div>
                  <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="text-[10px] text-text-muted flex items-center gap-1">
                      <Navigation className="h-3 w-3 text-info" /> Distance
                    </div>
                    <div className="font-semibold text-xs text-white mt-0.5">
                      {formatDistance(activeSelectedVehicle.distanceRemaining)}
                    </div>
                  </div>
                </div>

                {/* Driver & Cargo info */}
                <div className="text-2xs space-y-1 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Driver:</span>
                    <strong className="text-white">{activeSelectedVehicle.driver}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Cargo:</span>
                    <strong className="text-white">{activeSelectedVehicle.cargo}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">District:</span>
                    <strong className="text-white">{activeSelectedVehicle.district}</strong>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => setShowReplay(true)}
                    className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-xl text-2xs font-semibold bg-white/10 hover:bg-white/15 text-text hover:text-white border border-white/10 transition-all"
                  >
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>Replay</span>
                  </button>
                  <button
                    onClick={() => setIsFollowingVehicle(!isFollowingVehicle)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-2xs font-semibold transition-all',
                      isFollowingVehicle
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white/10 hover:bg-white/15 text-text hover:text-white border border-white/10'
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {isFollowingVehicle ? 'Tracking' : 'Follow'}
                  </button>
                  <a
                    href={`tel:${activeSelectedVehicle.driverPhone}`}
                    className="flex items-center justify-center p-2 rounded-xl bg-white/10 hover:bg-white/15 text-text hover:text-white border border-white/10"
                    title="Call Driver"
                  >
                    <Phone className="h-3.5 w-3.5 text-success" />
                  </a>
                </div>
              </div>
            )
          )}

          {/* ── ROAD CARD ── */}
          {selectedEntity.type === 'road' && (
            <div className="glass-panel rounded-2xl p-3.5 border border-white/10 shadow-2xl space-y-3 bg-[#0D1626]/90 backdrop-blur-xl text-text">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <div className="font-bold text-xs text-white">{selectedEntity.data.name}</div>
                  <div className="text-[10px] text-text-muted">District: {selectedEntity.data.district}</div>
                </div>
                <button
                  onClick={() => setSelectedEntity(null)}
                  className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <div className="text-[10px] text-text-muted">Status</div>
                  <div
                    className="font-bold uppercase text-xs mt-0.5"
                    style={{ color: ROAD_COLOR[selectedEntity.data.status] }}
                  >
                    {selectedEntity.data.status}
                  </div>
                </div>
                <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                  <div className="text-[10px] text-text-muted">Risk Score</div>
                  <div className="font-bold text-xs text-white mt-0.5">
                    {selectedEntity.data.riskScore}%
                  </div>
                </div>
              </div>
              {selectedEntity.data.reason && (
                <div className="bg-danger/10 border border-danger/20 p-2.5 rounded-xl text-2xs text-danger leading-relaxed">
                  ⚠️ {selectedEntity.data.reason}
                </div>
              )}
            </div>
          )}

          {/* ── ALERT CARD ── */}
          {selectedEntity.type === 'alert' && activeSelectedAlert && (
            <div className={cn(
              "glass-panel rounded-xl p-3 border shadow-2xl space-y-2 bg-[#0D1626]/95 backdrop-blur-xl text-text",
              activeSelectedAlert.severity === 'critical' ? 'border-danger/35 bg-danger/[0.04]' :
              activeSelectedAlert.severity === 'warning' ? 'border-warning/30 bg-warning/[0.04]' :
              'border-info/25 bg-info/[0.03]'
            )}>
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-1.5 gap-2">
                <div className="flex items-start gap-1.5 min-w-0">
                  <div className={cn(
                    'p-1 rounded-md border flex-shrink-0 mt-0.5',
                    activeSelectedAlert.severity === 'critical' ? 'bg-danger/20 border-danger/40 text-danger' :
                    activeSelectedAlert.severity === 'warning' ? 'bg-warning/20 border-warning/40 text-warning' :
                    'bg-info/20 border-info/40 text-info'
                  )}>
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white leading-tight truncate">
                      {activeSelectedAlert.title}
                    </div>
                    <div className="text-2xs text-text-muted mt-0.5 flex items-center gap-1.5 truncate">
                      <span className="truncate">{activeSelectedAlert.locationName ?? 'Arterial Corridor'}</span>
                      <span>•</span>
                      <span className="flex-shrink-0">{timeAgo(activeSelectedAlert.timestamp)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className={cn(
                    'text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border',
                    activeSelectedAlert.severity === 'critical' ? 'bg-danger/20 text-danger border-danger/30' :
                    activeSelectedAlert.severity === 'warning' ? 'bg-warning/20 text-warning border-warning/30' :
                    'bg-info/20 text-info border-info/30'
                  )}>
                    {activeSelectedAlert.severity}
                  </span>
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className="p-0.5 rounded text-text-muted hover:text-white hover:bg-white/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Description Body */}
              <p className="text-2xs text-text-muted leading-relaxed line-clamp-2">
                {activeSelectedAlert.description}
              </p>

              {/* 3-Tile Compact Metric Readout Grid */}
              <div className="grid grid-cols-3 gap-1 text-2xs text-center py-1 px-1.5 rounded-lg bg-surface-2 border border-white/5">
                <div>
                  <div className="text-text-dim text-[9px]">Hazard Risk</div>
                  <div className={cn('font-bold text-2xs mt-0.5', activeSelectedAlert.severity === 'critical' ? 'text-danger' : 'text-warning')}>
                    {activeSelectedAlert.aiRiskScore != null ? `${activeSelectedAlert.aiRiskScore}%` : 'High'}
                  </div>
                </div>
                <div>
                  <div className="text-text-dim text-[9px]">Impact</div>
                  <div className="font-bold text-2xs text-text mt-0.5">
                    {activeSelectedAlert.affectedVehicles && activeSelectedAlert.affectedVehicles.length > 0
                      ? `${activeSelectedAlert.affectedVehicles.length} Units`
                      : 'Corridor'}
                  </div>
                </div>
                <div>
                  <div className="text-text-dim text-[9px]">Source</div>
                  <div className="font-bold text-2xs text-text mt-0.5 truncate">
                    {activeSelectedAlert.source}
                  </div>
                </div>
              </div>

              {/* Compact GPS Coordinates Strip */}
              {activeSelectedAlert.location && (
                <div className="text-2xs text-text-muted px-2 py-0.5 rounded bg-surface-2 border border-white/5 flex items-center justify-between">
                  <span className="text-[10px]">GPS:</span>
                  <span className="text-text font-semibold text-2xs">
                    {activeSelectedAlert.location.lat.toFixed(3)}°N, {activeSelectedAlert.location.lng.toFixed(3)}°E
                  </span>
                </div>
              )}

              {/* Compact Action Buttons */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {activeSelectedAlert.status === 'active' && (
                  <>
                    <button
                      onClick={() => {
                        acknowledgeAlert(activeSelectedAlert.id)
                        toast.success('Incident Acknowledged')
                      }}
                      className="flex-1 h-6 px-2 rounded-lg text-2xs font-semibold bg-surface-2 hover:bg-surface-3 text-text hover:text-white border border-white/10 transition-all"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => {
                        acknowledgeAlert(activeSelectedAlert.id)
                        navigate('/routes')
                        toast.success('Route C Safe Bypass Loaded')
                      }}
                      className="flex-1 h-6 px-2 rounded-lg text-2xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm transition-all flex items-center justify-center gap-1"
                    >
                      <Navigation className="h-2.5 w-2.5" />
                      Auto-Reroute
                    </button>
                  </>
                )}
                {activeSelectedAlert.status !== 'resolved' && (
                  <button
                    onClick={() => {
                      resolveAlert(activeSelectedAlert.id)
                      toast.success('Incident Resolved')
                    }}
                    className="h-6 px-2 rounded-lg text-2xs font-semibold text-text-muted hover:text-success hover:bg-success/10 border border-white/10 transition-all"
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Subtle Glassmorphic Region HUD ──────────────────────────────── */}
      <div className="absolute bottom-3 left-4 z-10 pointer-events-none hidden sm:flex items-center gap-3">
        <div className="glass-panel px-3 py-1.5 rounded-lg text-[10px] font-mono text-text-muted border border-white/10 shadow-lg flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="status-dot status-dot-green" />
            <strong className="text-text font-semibold">NER Logistics Grid</strong>
          </span>
          <span>Zoom: <strong className="text-white">{currentZoom.toFixed(1)}x</strong></span>
          <span>Vehicles: <strong className="text-primary">{vehicles.length}</strong></span>
        </div>
      </div>
    </div>
  )
}
