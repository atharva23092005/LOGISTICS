import { create } from 'zustand'
import type { Coordinates } from '@/types'

export type MapMode = 'dashboard' | 'fleet' | 'routing' | 'emergency' | 'analytics'
export type MapLayer = 'roads' | 'vehicles' | 'alerts' | 'weather' | 'routes' | 'districts' | 'safeCorridors' | 'traffic'
export type BasemapStyle = 'google_streets' | 'google_dark' | 'google_satellite'

interface MapState {
  center: Coordinates
  zoom: number
  mode: MapMode
  activeLayers: MapLayer[]
  basemapStyle: BasemapStyle
  selectedVehicleId: string | null
  selectedAlertId: string | null
  selectedRoadId: string | null
  followVehicleId: string | null
  isFullscreen: boolean
  showWeatherOverlay: boolean
  trafficEnabled: boolean
  simulationSpeed: number // 1x, 2x, 5x

  // Actions
  setCenter: (c: Coordinates) => void
  setZoom: (z: number) => void
  setMode: (m: MapMode) => void
  setBasemapStyle: (style: BasemapStyle) => void
  toggleLayer: (l: MapLayer) => void
  setActiveLayers: (layers: MapLayer[]) => void
  selectVehicle: (id: string | null) => void
  selectAlert: (id: string | null) => void
  selectRoad: (id: string | null) => void
  setFollowVehicle: (id: string | null) => void
  setFullscreen: (v: boolean) => void
  toggleWeatherOverlay: () => void
  toggleTraffic: () => void
  setSimulationSpeed: (speed: number) => void
  flyTo: (coords: Coordinates, zoom?: number) => void
  flyToTarget: Coordinates | null
  flyToZoom: number
}

// NER center — roughly Central Assam/Arunachal boundary
const NER_CENTER: Coordinates = { lat: 26.8, lng: 93.4 }

export const useMapStore = create<MapState>((set) => ({
  center: NER_CENTER,
  zoom: 6.8,
  mode: 'dashboard',
  activeLayers: ['roads', 'vehicles', 'alerts', 'weather', 'traffic'],
  basemapStyle: 'google_streets',
  selectedVehicleId: null,
  selectedAlertId: null,
  selectedRoadId: null,
  followVehicleId: null,
  isFullscreen: false,
  showWeatherOverlay: true,
  trafficEnabled: true,
  simulationSpeed: 1,
  flyToTarget: null,
  flyToZoom: 10,

  setCenter: (c) => set({ center: c }),
  setZoom: (z) => set({ zoom: z }),
  setMode: (m) => set({ mode: m }),
  setBasemapStyle: (basemapStyle) => set({ basemapStyle }),
  toggleLayer: (l) =>
    set((s) => ({
      activeLayers: s.activeLayers.includes(l)
        ? s.activeLayers.filter((x) => x !== l)
        : [...s.activeLayers, l],
    })),
  setActiveLayers: (layers) => set({ activeLayers: layers }),
  selectVehicle: (id) => set({ selectedVehicleId: id }),
  selectAlert: (id) => set({ selectedAlertId: id }),
  selectRoad: (id) => set({ selectedRoadId: id }),
  setFollowVehicle: (id) => set({ followVehicleId: id }),
  setFullscreen: (v) => set({ isFullscreen: v }),
  toggleWeatherOverlay: () => set((s) => ({ showWeatherOverlay: !s.showWeatherOverlay })),
  toggleTraffic: () => set((s) => ({ trafficEnabled: !s.trafficEnabled })),
  setSimulationSpeed: (simulationSpeed) => set({ simulationSpeed }),
  flyTo: (coords, zoom = 10) => set({ flyToTarget: coords, flyToZoom: zoom }),
}))
