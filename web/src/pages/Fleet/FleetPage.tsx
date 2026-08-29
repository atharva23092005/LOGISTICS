import { useState, useCallback } from 'react'
import {
  Search, Truck, RotateCcw, Phone, AlertTriangle, Compass, Copy, Navigation, Clock,
  HeartPulse, Fuel, X
} from 'lucide-react'
import { toast } from 'sonner'
import { MapEngine }          from '@/modules/map/MapEngine'
import { VehicleCard }        from '@/components/cards/VehicleCard'
import { TripReplayScrubber } from '@/modules/fleet/TripReplayScrubber'
import { Input }              from '@/components/ui/input'
import { Select }             from '@/components/ui/select'
import { Badge }              from '@/components/ui/badge'
import { Button }             from '@/components/ui/button'
import { Progress }           from '@/components/ui/progress'
import { Modal }              from '@/components/ui/modal'
import { DemoControl }        from '@/components/demo/DemoControl'
import { useVehicleStore }    from '@/stores/vehicleStore'
import { useMapStore }        from '@/stores/mapStore'
import { formatDuration, formatDistance, timeAgo } from '@/utils/format'
import type { Vehicle } from '@/types'

const selVehicles      = (s: ReturnType<typeof useVehicleStore.getState>) => s.vehicles
const selFilter        = (s: ReturnType<typeof useVehicleStore.getState>) => s.filter
const selSetFilter     = (s: ReturnType<typeof useVehicleStore.getState>) => s.setFilter
const selSelectedId    = (s: ReturnType<typeof useVehicleStore.getState>) => s.selectedVehicleId
const selSelectVehicle = (s: ReturnType<typeof useVehicleStore.getState>) => s.selectVehicle
const selFlyTo         = (s: ReturnType<typeof useMapStore.getState>)     => s.flyTo
const selVTotal    = (s: ReturnType<typeof useVehicleStore.getState>) => s.vehicles.length
const selVOnRoute  = (s: ReturnType<typeof useVehicleStore.getState>) => s.vehicles.filter(v => v.status === 'on_route').length
const selVDelayed  = (s: ReturnType<typeof useVehicleStore.getState>) => s.vehicles.filter(v => v.status === 'delayed').length
const selVStopped  = (s: ReturnType<typeof useVehicleStore.getState>) => s.vehicles.filter(v => v.status === 'stopped').length
const selVEmg      = (s: ReturnType<typeof useVehicleStore.getState>) => s.vehicles.filter(v => v.priority === 'emergency').length

const STATUS_OPTS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'on_route', label: 'On Route' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'stopped', label: 'Stopped' }
]
const PRIORITY_OPTS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
]

export function FleetPage() {
  const vehicles          = useVehicleStore(selVehicles)
  const filter            = useVehicleStore(selFilter)
  const setFilter         = useVehicleStore(selSetFilter)
  const selectedVehicleId = useVehicleStore(selSelectedId)
  const selectVehicle     = useVehicleStore(selSelectVehicle)
  const flyTo             = useMapStore(selFlyTo)
  const vTotal  = useVehicleStore(selVTotal)
  const vOnRoute= useVehicleStore(selVOnRoute)
  const vDelayed= useVehicleStore(selVDelayed)
  const vStopped= useVehicleStore(selVStopped)
  const vEmg    = useVehicleStore(selVEmg)

  const [mobileTab,    setMobileTab]    = useState<'list' | 'map'>('list')
  const [rerouteModal, setRerouteModal] = useState<Vehicle | null>(null)
  const [showReplay,   setShowReplay]   = useState(false)

  const filtered = vehicles.filter(v => {
    if (filter.status !== 'all' && v.status !== filter.status) return false
    if (filter.priority !== 'all' && v.priority !== filter.priority) return false
    if (filter.search) {
      const q = filter.search.toLowerCase()
      if (!v.registrationNo.toLowerCase().includes(q) && !v.driver.toLowerCase().includes(q) && !v.cargo.toLowerCase().includes(q)) return false
    }
    return true
  })

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) ?? null

  const handleSelect = useCallback((v: Vehicle) => {
    selectVehicle(v.id)
    setMobileTab('map')
    flyTo(v.currentLocation, 13)
  }, [selectVehicle, flyTo])

  const handleReroute = useCallback((v: Vehicle) => setRerouteModal(v), [])

  const confirmReroute = useCallback(() => {
    if (!rerouteModal) return
    toast.success(`Rerouting ${rerouteModal.registrationNo}`, {
      description: 'New safe route via NH-27 corridor dispatched to driver.'
    })
    setRerouteModal(null)
  }, [rerouteModal])

  const handleCallDriver = (v: Vehicle) => {
    navigator.clipboard.writeText(v.driverPhone)
    toast.info(`Calling ${v.driver}: ${v.driverPhone}`, {
      description: 'Phone number copied to clipboard.'
    })
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3 md:px-5 py-2.5 border-b border-border/80 flex-shrink-0 bg-surface gap-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center flex-shrink-0 border border-primary/30">
            <Truck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-text truncate">Fleet Management & GPS Telemetry</h1>
              <span className="badge-neutral text-2xs hidden sm:inline-flex">{vTotal} Total</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-2xs">
              <span className="badge-success text-2xs">{vOnRoute} On Route</span>
              <span className="badge-warning text-2xs">{vDelayed} Delayed</span>
              <span className="badge-critical text-2xs">{vStopped} Stopped</span>
              {vEmg > 0 && <span className="badge-critical text-2xs">{vEmg} Emergency</span>}
            </div>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex md:hidden items-center justify-between gap-1 bg-surface-3 p-1 rounded-xl border border-border">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-1 px-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              mobileTab === 'list' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            <Truck className="h-3 w-3" /> Fleet ({filtered.length})
          </button>
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 py-1 px-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              mobileTab === 'map' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'
            }`}
          >
            <Compass className="h-3 w-3" /> GPS Map
          </button>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <DemoControl />
        </div>
      </div>

      {/* ── WORKSPACE ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── LEFT (Vehicle Directory & Filters) ────────────────────────────── */}
        <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-border bg-surface flex-col overflow-hidden ${
          mobileTab === 'list' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Search & Filter Bar */}
          <div className="p-3 border-b border-border/80 space-y-2 bg-surface-2/40">
            <Input
              placeholder="Search registration, driver, cargo…"
              value={filter.search}
              onChange={e => setFilter({ search: e.target.value })}
              icon={<Search className="h-3.5 w-3.5 text-text-muted" />}
              className="h-8 text-xs bg-surface-3"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select
                options={STATUS_OPTS}
                value={filter.status}
                onChange={e => setFilter({ status: e.target.value as any })}
                className="h-8 text-xs bg-surface-3"
              />
              <Select
                options={PRIORITY_OPTS}
                value={filter.priority}
                onChange={e => setFilter({ priority: e.target.value as any })}
                className="h-8 text-xs bg-surface-3"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-text-muted text-xs">
                <Truck className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No vehicles match the selected filters.
              </div>
            ) : (
              filtered.map(v => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  selected={selectedVehicleId === v.id}
                  onSelect={() => handleSelect(v)}
                  onReroute={() => handleReroute(v)}
                  onContact={() => handleCallDriver(v)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT (Live GPS Tracking Map) ─────────────────────────────────── */}
        <div className={`flex-1 relative overflow-hidden min-w-0 bg-background ${
          mobileTab === 'map' ? 'flex' : 'hidden md:flex'
        }`}>
          <MapEngine
            layers={['roads', 'vehicles', 'alerts']}
            onVehicleClick={handleSelect}
          />
        </div>
      </div>

      {/* ── REROUTE MODAL ─────────────────────────────────────────────────── */}
      <Modal
        open={!!rerouteModal}
        onClose={() => setRerouteModal(null)}
        title="Vehicle AI Reroute"
        description={rerouteModal ? `${rerouteModal.registrationNo} — ${rerouteModal.cargo}` : ''}
        size="sm"
      >
        {rerouteModal && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-warning/10 border border-warning/25 text-xs text-text-muted">
              AI recommends rerouting via <strong className="text-success">NH-27 Safe Corridor</strong> (Risk 18% vs current 87%).
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Recommended Route', val: 'Via NH-27 & SH-15 Safe Bypass', cls: 'text-text font-semibold' },
                { label: 'Distance Variance', val: '+35 km (+40 min)', cls: 'text-warning font-medium' },
                { label: 'Landslide Risk Score', val: '18% Safe (was 87% Critical)', cls: 'text-success font-bold' },
              ].map(r => (
                <div key={r.label} className="flex justify-between px-3 py-2 rounded-lg bg-surface-2 border border-border/40">
                  <span className="text-text-muted">{r.label}</span>
                  <span className={r.cls}>{r.val}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 text-xs" onClick={() => setRerouteModal(null)}>Cancel</Button>
              <Button variant="default" className="flex-1 text-xs" onClick={confirmReroute}>
                <Navigation className="h-3.5 w-3.5" /> Confirm Safe Reroute
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
