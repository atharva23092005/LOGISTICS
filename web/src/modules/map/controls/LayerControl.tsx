import { useState, useRef, useEffect } from 'react'
import {
  Map as MapIcon, Truck, Bell, Cloud, Route,
  Layers, Sun, Moon, Globe, ChevronDown, ChevronUp, Compass
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useMapStore, type MapLayer, type BasemapStyle } from '@/stores/mapStore'

const LAYER_CONFIG: { id: MapLayer; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'roads',     label: 'Highway Corridors', icon: MapIcon, color: '#10B981' },
  { id: 'vehicles',  label: 'Live Fleet Tracking',icon: Truck,   color: '#3B82F6' },
  { id: 'alerts',    label: 'Incident Stream',   icon: Bell,    color: '#EF4444' },
  { id: 'weather',   label: 'Weather Radar',     icon: Cloud,   color: '#06B6D4' },
  { id: 'routes',    label: 'AI Safe Corridors', icon: Route,   color: '#8B5CF6' },
]

const BASEMAP_STYLES: { id: BasemapStyle; label: string; icon: React.ElementType }[] = [
  { id: 'google_dark',      label: 'Dark Canvas',   icon: Moon },
  { id: 'google_streets',   label: 'Clean Streets', icon: Sun },
  { id: 'google_satellite', label: 'Satellite',     icon: Globe },
]

export function LayerControl() {
  const activeLayers    = useMapStore((s) => s.activeLayers)
  const toggleLayer     = useMapStore((s) => s.toggleLayer)
  const basemapStyle    = useMapStore((s) => s.basemapStyle)
  const setBasemapStyle = useMapStore((s) => s.setBasemapStyle)
  const flyTo           = useMapStore((s) => s.flyTo)

  // Collapsed by default for maximum clean UI
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={menuRef} className="absolute top-3.5 left-4 z-20">
      {/* ── Collapsed Sleek Glass Pill Trigger ───────────────────────────── */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-all duration-200 border',
          'bg-[#0D1626]/85 backdrop-blur-md border-white/10 hover:border-white/20 text-text hover:text-white',
          open && 'ring-2 ring-primary/40 border-primary/50'
        )}
      >
        <Layers className="h-3.5 w-3.5 text-primary" />
        <span className="text-2xs font-medium">Layers & Themes</span>
        {open ? <ChevronUp className="h-3 w-3 text-text-muted" /> : <ChevronDown className="h-3 w-3 text-text-muted" />}
      </button>

      {/* ── Dropdown Glass Menu (Only visible when toggled) ───────────────── */}
      {open && (
        <div className="absolute top-10 left-0 w-56 rounded-2xl bg-[#0D1626]/90 backdrop-blur-xl border border-white/10 p-3 shadow-2xl space-y-2.5 animate-scale-in">
          {/* Basemap Styles */}
          <div>
            <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1 px-1">
              Basemap Style
            </div>
            <div className="grid grid-cols-3 gap-1">
              {BASEMAP_STYLES.map((b) => {
                const Icon = b.icon
                const isSelected = basemapStyle === b.id
                return (
                  <button
                    key={b.id}
                    onClick={() => setBasemapStyle(b.id)}
                    className={cn(
                      'flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[10px] font-medium transition-all text-center gap-1',
                      isSelected
                        ? 'bg-primary/20 text-primary border border-primary/40 font-semibold'
                        : 'text-text-muted hover:text-text hover:bg-white/5'
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="truncate w-full leading-tight">{b.label.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Layer Toggles */}
          <div className="pt-2 border-t border-white/10 space-y-0.5">
            <div className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1 px-1">
              Active Layers
            </div>
            {LAYER_CONFIG.map((l) => {
              const Icon = l.icon
              const active = activeLayers.includes(l.id)
              return (
                <button
                  key={l.id}
                  onClick={() => toggleLayer(l.id)}
                  className={cn(
                    'flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-xs transition-all',
                    active ? 'bg-white/5 text-text font-medium' : 'text-text-dim hover:text-text-muted hover:bg-white/5'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{
                        background: active ? l.color : '#475569',
                        opacity: active ? 1 : 0.35,
                      }}
                    />
                    <Icon className="h-3 w-3 flex-shrink-0 opacity-80" />
                    <span className="text-2xs">{l.label}</span>
                  </div>
                  <span className={cn('text-[8px] font-mono font-bold', active ? 'text-primary' : 'text-text-subtle')}>
                    {active ? 'ON' : 'OFF'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Recenter Button */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                flyTo({ lat: 26.8, lng: 93.6 }, 7.4)
                setOpen(false)
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-text text-2xs font-medium border border-white/5 transition-colors"
            >
              <Compass className="h-3 w-3 text-primary" /> Recenter NER View
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
