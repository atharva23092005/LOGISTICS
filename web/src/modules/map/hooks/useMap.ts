import { useRef, useEffect, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { useMapStore } from '@/stores/mapStore'

export function useMap(containerId: string) {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const { center, zoom, flyToTarget, flyToZoom } = useMapStore()

  const initMap = useCallback((container: HTMLDivElement) => {
    if (mapRef.current) return

    const map = new maplibregl.Map({
      container,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-base',
            type: 'raster',
            source: 'osm-tiles',
            paint: {
              'raster-opacity': 0.5,
              'raster-brightness-min': 0,
              'raster-brightness-max': 0.25,
              'raster-saturation': -0.8,
              'raster-contrast': 0.1,
            },
          },
        ],
      },
      center: [center.lng, center.lat],
      zoom,
      attributionControl: false,
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-right')

    mapRef.current = map
    return map
  }, [])

  // Fly to when store changes
  useEffect(() => {
    if (flyToTarget && mapRef.current) {
      mapRef.current.flyTo({
        center: [flyToTarget.lng, flyToTarget.lat],
        zoom: flyToZoom,
        duration: 1200,
        essential: true,
      })
    }
  }, [flyToTarget, flyToZoom])

  const flyTo = useCallback((lat: number, lng: number, z = 11) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: z, duration: 1000 })
  }, [])

  const cleanup = useCallback(() => {
    mapRef.current?.remove()
    mapRef.current = null
  }, [])

  return { mapRef, initMap, flyTo, cleanup }
}
