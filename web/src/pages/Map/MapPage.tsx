import { useState, useCallback } from 'react'
import { Maximize2, Minimize2, Map, Layers, ChevronUp, ChevronDown, Bell, Truck, X } from 'lucide-react'
import { MapEngine }   from '@/modules/map/MapEngine'
import { LayerControl } from '@/modules/map/controls/LayerControl'
import { AlertCard }   from '@/components/cards/AlertCard'
import { VehicleCard } from '@/components/cards/VehicleCard'
import { Button }      from '@/components/ui/button'
import { Badge }       from '@/components/ui/badge'
import { Tabs }        from '@/components/ui/tabs'
import { DemoControl } from '@/components/demo/DemoControl'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useAlertStore }   from '@/stores/alertStore'
import { useMapStore }     from '@/stores/mapStore'
import type { Vehicle, LogisticsAlert } from '@/types'

const selVehicles  = (s: ReturnType<typeof useVehicleStore.getState>) => s.vehicles
const selAllAlerts = (s: ReturnType<typeof useAlertStore.getState>)   => s.alerts
const selAck       = (s: ReturnType<typeof useAlertStore.getState>)   => s.acknowledgeAlert
const selFlyTo     = (s: ReturnType<typeof useMapStore.getState>)     => s.flyTo
const selOnRoute   = (s: ReturnType<typeof useVehicleStore.getState>) => s.vehicles.filter(v => v.status === 'on_route').length
const selDelayed   = (s: ReturnType<typeof useVehicleStore.getState>) => s.vehicles.filter(v => v.status === 'delayed').length
const selTotal     = (s: ReturnType<typeof useVehicleStore.getState>) => s.vehicles.length
const selCritical  = (s: ReturnType<typeof useAlertStore.getState>)   => s.alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length
const selActAlerts = (s: ReturnType<typeof useAlertStore.getState>)   => s.alerts.filter(a => a.status === 'active').length

export function MapPage() {
  const vehicles     = useVehicleStore(selVehicles)
  const allAlerts    = useAlertStore(selAllAlerts)
  const acknowledge  = useAlertStore(selAck)
  const flyTo        = useMapStore(selFlyTo)
  const statsOnRoute = useVehicleStore(selOnRoute)
  const statsDelayed = useVehicleStore(selDelayed)
  const statsTotal   = useVehicleStore(selTotal)
  const alertCrit    = useAlertStore(selCritical)
  const alertActive  = useAlertStore(selActAlerts)

  const [fullscreen,      setFullscreen]      = useState(false)
  const [mobileDrawer,    setMobileDrawer]    = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedAlert,   setSelectedAlert]   = useState<LogisticsAlert | null>(null)
  const [panelTab,        setPanelTab]        = useState('alerts')

  const activeAlerts = allAlerts.filter(a => a.status === 'active')

  const handleVehicleClick = useCallback((v: Vehicle) => {
    setSelectedVehicle(v)
    setSelectedAlert(null)
    setMobileDrawer(false)
    flyTo(v.currentLocation, 13)
  }, [flyTo])

  const handleAlertClick = useCallback((a: LogisticsAlert) => {
    setSelectedAlert(a)
    setSelectedVehicle(null)
    setMobileDrawer(false)
    if (a.location) flyTo(a.location, 12)
  }, [flyTo])

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50' : 'h-full'} flex flex-col bg-background`}>
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 md:px-5 py-2.5 border-b border-border flex-shrink-0 bg-surface">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
            <Map className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-text">Live NER Tactical Map</h1>
              {alertCrit > 0 && <span className="badge-critical text-2xs">{alertCrit} Critical</span>}
            </div>
            <div className="hidden sm:flex items-center gap-3 text-2xs text-text-muted">
              <span className="flex items-center gap-1 text-success"><span className="status-dot status-dot-green" />{statsOnRoute} on route</span>
              <span className="flex items-center gap-1 text-warning"><span className="status-dot status-dot-amber" />{statsDelayed} delayed</span>
              <span>{statsTotal} total vehicles</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Drawer Trigger */}
          <Button
            variant="secondary"
            size="sm"
            className="md:hidden h-8 text-xs font-semibold"
            onClick={() => setMobileDrawer(!mobileDrawer)}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>{mobileDrawer ? 'Hide Feed' : 'Feed'}</span>
          </Button>

          <DemoControl />

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setFullscreen(!fullscreen)}
            title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* ── MAIN MAP WORKSPACE ─────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <MapEngine
            onVehicleClick={handleVehicleClick}
            onAlertClick={handleAlertClick}
          />
          <LayerControl />
        </div>

        {/* Desktop Side Panel */}
        <div className="hidden md:flex w-72 lg:w-80 flex-shrink-0 border-l border-border flex-col overflow-hidden bg-surface">
          <div className="p-2 border-b border-border bg-surface flex-shrink-0">
            <Tabs
              tabs={[
                { id: 'alerts',   label: 'Alerts',   badge: alertActive  },
                { id: 'vehicles', label: 'Vehicles', badge: statsTotal },
              ]}
              active={panelTab}
              onChange={setPanelTab}
              variant="pill"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {panelTab === 'alerts' && (
              activeAlerts.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-8">No active alerts</p>
              ) : (
                activeAlerts.map(a => (
                  <AlertCard
                    key={a.id}
                    alert={a}
                    compact
                    selected={selectedAlert?.id === a.id}
                    onSelect={handleAlertClick}
                    onAcknowledge={acknowledge}
                    onViewMap={handleAlertClick}
                  />
                ))
              )
            )}
            {panelTab === 'vehicles' && vehicles.map(v => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                compact
                selected={selectedVehicle?.id === v.id}
                onSelect={handleVehicleClick}
              />
            ))}
          </div>
        </div>

        {/* Mobile Slide-Up Drawer */}
        {mobileDrawer && (
          <div className="md:hidden absolute inset-x-0 bottom-0 max-h-[65%] bg-surface border-t border-border z-30 flex flex-col shadow-2xl rounded-t-2xl animate-fade-in">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <div className="w-12 h-1 bg-surface-4 rounded-full mx-auto" />
              <Button size="icon-sm" variant="ghost" onClick={() => setMobileDrawer(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-2 border-b border-border bg-surface flex-shrink-0">
              <Tabs
                tabs={[
                  { id: 'alerts',   label: 'Alerts',   badge: alertActive  },
                  { id: 'vehicles', label: 'Vehicles', badge: statsTotal },
                ]}
                active={panelTab}
                onChange={setPanelTab}
                variant="pill"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {panelTab === 'alerts' && activeAlerts.map(a => (
                <AlertCard
                  key={a.id}
                  alert={a}
                  compact
                  selected={selectedAlert?.id === a.id}
                  onSelect={handleAlertClick}
                  onAcknowledge={acknowledge}
                  onViewMap={handleAlertClick}
                />
              ))}
              {panelTab === 'vehicles' && vehicles.map(v => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  compact
                  selected={selectedVehicle?.id === v.id}
                  onSelect={handleVehicleClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
