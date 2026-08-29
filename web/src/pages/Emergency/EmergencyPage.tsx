import { useState, useCallback } from 'react'
import {
  AlertOctagon, Shield, Truck, Navigation, Phone, Radio, CheckCircle,
  Zap, Send, Copy, AlertTriangle, ExternalLink, RefreshCw, Layers, Compass,
  Building2, ShieldAlert, Plane, HeartPulse
} from 'lucide-react'
import { toast } from 'sonner'
import { MapEngine } from '@/modules/map/MapEngine'
import { VehicleCard } from '@/components/cards/VehicleCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { Tabs } from '@/components/ui/tabs'
import { DemoControl } from '@/components/demo/DemoControl'
import { useAppStore } from '@/stores/appStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useAlertStore } from '@/stores/alertStore'
import { useMapStore } from '@/stores/mapStore'
import { formatDateTime } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { Vehicle } from '@/types'

interface SafeCorridor {
  id: string
  name: string
  route: string
  status: 'active' | 'blocked'
  risk: number
  vehicles: number
  coords: { lat: number; lng: number }
  color: string
}

const PRIORITY_CONFIG = [
  {
    category: 'medical',
    label: 'Medical Supplies',
    icon: '🏥',
    color: 'border-danger/40 bg-danger/5 hover:border-danger/60',
    badge: 'danger' as const,
    order: 1,
    target: 'District Hospital Pasighat & Relief Camps',
    readyVehicles: 3,
    preferredCorridor: 'NH-6 Corridor',
  },
  {
    category: 'food',
    label: 'Food & Rations',
    icon: '🌾',
    color: 'border-warning/40 bg-warning/5 hover:border-warning/60',
    badge: 'warning' as const,
    order: 2,
    target: 'Shelter Hubs 1 & 2 (East Siang)',
    readyVehicles: 5,
    preferredCorridor: 'SH-15 Corridor',
  },
  {
    category: 'water',
    label: 'Water & Sanitation',
    icon: '💧',
    color: 'border-info/40 bg-info/5 hover:border-info/60',
    badge: 'info' as const,
    order: 3,
    target: 'Purification Plants & Water Tankers',
    readyVehicles: 4,
    preferredCorridor: 'NH-27 Corridor',
  },
  {
    category: 'other',
    label: 'Rescue & Heavy Gear',
    icon: '📦',
    color: 'border-border bg-surface-2/50 hover:border-primary/40',
    badge: 'muted' as const,
    order: 4,
    target: 'NDRF Base Station & Helipad Alpha',
    readyVehicles: 2,
    preferredCorridor: 'NH-6 Corridor',
  },
]

const SAFE_CORRIDORS: SafeCorridor[] = [
  {
    id: 'c1',
    name: 'NH-6 Corridor',
    route: 'Guwahati ↔ Shillong ↔ Silchar',
    status: 'active',
    risk: 22,
    vehicles: 4,
    coords: { lat: 25.5788, lng: 91.8933 },
    color: 'text-success',
  },
  {
    id: 'c2',
    name: 'SH-15 Corridor',
    route: 'Jorhat ↔ Pasighat',
    status: 'active',
    risk: 38,
    vehicles: 2,
    coords: { lat: 26.8500, lng: 94.6000 },
    color: 'text-success',
  },
  {
    id: 'c3',
    name: 'NH-27 Corridor',
    route: 'Guwahati ↔ Nagaon ↔ Dibrugarh',
    status: 'active',
    risk: 18,
    vehicles: 6,
    coords: { lat: 26.2006, lng: 92.9376 },
    color: 'text-success',
  },
  {
    id: 'c4',
    name: 'NH-415 Corridor',
    route: 'Itanagar ↔ Banderdewa (Blocked)',
    status: 'blocked',
    risk: 87,
    vehicles: 0,
    coords: { lat: 27.0844, lng: 93.6053 },
    color: 'text-danger',
  },
]

const EMERGENCY_CONTACTS = [
  { name: 'District Collector HQ', number: '0374-2320420', dept: 'Command & Admin', icon: Building2 },
  { name: 'NDRF Team Alpha (Rescue)', number: '1078', dept: 'Search & Extraction', icon: ShieldAlert },
  { name: 'Army Rescue Unit Eastern', number: '1800-180-1253', dept: 'Airlift & Heavy Ops', icon: Plane },
  { name: 'State Disaster Response (SDRF)', number: '0361-2237221', dept: 'State Emergency Cell', icon: Shield },
  { name: 'Medical Trauma Helpline', number: '108', dept: 'Ambulance & Hospital Desk', icon: HeartPulse },
  { name: 'NER Logistics Ops 24/7', number: '+91-361-2237000', dept: 'Fleet Control Center', icon: Truck },
]

const INITIAL_COMMS = [
  { time: '23:48', msg: 'Medical Convoy MC-01 safely passed Jorhat checkpoint via SH-15', type: 'success' },
  { time: '23:42', msg: 'NH-415 blocked — major landslide confirmed near Km 42. Reroute enforced.', type: 'critical' },
  { time: '23:38', msg: 'Ambulance AR-01-GH-2345 stopped near Banderdewa, awaiting safe bypass', type: 'warning' },
  { time: '23:35', msg: 'Heavy rainfall alert East Siang: 82mm/hr. Safe corridors operational.', type: 'info' },
  { time: '23:28', msg: 'NDRF Team Alpha deployed with 4 rescue vehicles to Pasighat sector', type: 'success' },
  { time: '23:15', msg: 'NH-6 Corridor telemetry confirmed fully clear and monitored', type: 'success' },
]

const PRESET_INCIDENTS = [
  'Critical road blockages across East Siang district due to landslides',
  'Flash flood warning along NH-415 and Brahmaputra basin',
  'Severe cyclonic storm impact on arterial highway network',
  'Bridge structural inspection required near Pasighat crossing',
]

export function EmergencyPage() {
  const emergency = useAppStore((s) => s.emergency)
  const activateEmergency = useAppStore((s) => s.activateEmergency)
  const deactivateEmergency = useAppStore((s) => s.deactivateEmergency)
  const vehicles = useVehicleStore((s) => s.vehicles)
  const selectVehicle = useVehicleStore((s) => s.selectVehicle)
  const allAlerts = useAlertStore((s) => s.alerts)
  const flyTo = useMapStore((s) => s.flyTo)

  // State
  const [mobileTab, setMobileTab] = useState<'map' | 'operations' | 'corridors'>('map')
  const [leftTab, setLeftTab] = useState<'dispatch' | 'stranded' | 'emergency'>('dispatch')
  const [rightTab, setRightTab] = useState<'corridors' | 'comms' | 'contacts'>('corridors')
  const [activateModal, setActivateModal] = useState(false)
  const [customReason, setCustomReason] = useState(PRESET_INCIDENTS[0])
  const [deactivateModal, setDeactivateModal] = useState(false)
  const [dispatchModal, setDispatchModal] = useState<typeof PRIORITY_CONFIG[0] | null>(null)
  const [dispatchVehiclesCount, setDispatchVehiclesCount] = useState('2')
  const [selectedV, setSelectedV] = useState<Vehicle | null>(null)
  const [commsLog, setCommsLog] = useState(INITIAL_COMMS)
  const [newBroadcast, setNewBroadcast] = useState('')

  const alertCriticalCount = allAlerts.filter((a) => a.severity === 'critical' && a.status !== 'resolved').length
  const alertActiveCount = allAlerts.filter((a) => a.status === 'active').length
  const emergencyVehicles = vehicles.filter((v) => v.priority === 'emergency' || v.priority === 'high')
  const strandedVehicles = vehicles.filter((v) => v.status === 'stopped')
  const activeCorridors = SAFE_CORRIDORS.filter(c => c.status === 'active')

  const handleActivate = () => {
    activateEmergency(customReason || 'Critical emergency active across network')
    setActivateModal(false)
    toast.error('🚨 Emergency Mode Activated', {
      description: 'Priority: Medical → Food → Water. All safe corridors active.',
      duration: 8000,
    })
  }

  const handleDeactivate = () => {
    deactivateEmergency()
    setDeactivateModal(false)
    toast.success('Emergency mode deactivated', {
      description: 'Standard routing and fleet operations restored.',
    })
  }

  const handleDispatch = () => {
    if (!dispatchModal) return
    const category = dispatchModal.label
    const corridor = dispatchModal.preferredCorridor
    const count = dispatchVehiclesCount
    setDispatchModal(null)

    // Add entry to comms
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setCommsLog(prev => [
      { time: timeStr, msg: `Dispatched ${count}x ${category} convoys via ${corridor}. GPS tracking live.`, type: 'success' },
      ...prev
    ])

    toast.success(`✅ ${category} Convoy Dispatched!`, {
      description: `${count} vehicles routed via ${corridor} with priority clearance.`,
    })
  }

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBroadcast.trim()) return
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setCommsLog(prev => [
      { time: timeStr, msg: `[BROADCAST] ${newBroadcast.trim()}`, type: 'warning' },
      ...prev
    ])
    toast.info('📡 Emergency broadcast transmitted to all fleet units')
    setNewBroadcast('')
  }

  const handleCorridorClick = (corridor: SafeCorridor) => {
    flyTo(corridor.coords, 11)
    toast.info(`Focused on ${corridor.name}`, {
      description: `${corridor.route} • Risk Level: ${corridor.risk}%`,
    })
  }

  const handleVehicleSelect = useCallback((v: Vehicle) => {
    setSelectedV(v)
    selectVehicle(v.id)
    flyTo(v.currentLocation, 13)
  }, [selectVehicle, flyTo])

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Copied ${label}: ${text}`)
  }

  const LEFT_TABS_CONFIG = [
    { id: 'dispatch', label: 'Dispatch', icon: <Shield className="h-3.5 w-3.5" /> },
    { id: 'stranded', label: 'Stranded', icon: <AlertTriangle className="h-3.5 w-3.5 text-danger" />, badge: strandedVehicles.length },
    { id: 'emergency', label: 'Convoys', icon: <Truck className="h-3.5 w-3.5 text-warning" />, badge: emergencyVehicles.length },
  ]

  const RIGHT_TABS_CONFIG = [
    { id: 'corridors', label: 'Corridors', icon: <Navigation className="h-3.5 w-3.5 text-success" /> },
    { id: 'comms', label: 'Comms', icon: <Radio className="h-3.5 w-3.5" />, badge: commsLog.length },
    { id: 'contacts', label: 'Hotlines', icon: <Phone className="h-3.5 w-3.5" /> },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* ── TOP HEADER ──────────────────────────────────────────────────────── */}
      <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3 md:px-5 py-2.5 border-b flex-shrink-0 gap-2.5 transition-colors duration-300 ${
        emergency.active
          ? 'bg-danger/10 border-danger/40 shadow-inner-top'
          : 'bg-surface border-border'
      }`}>
        {/* Title & Status */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            emergency.active ? 'bg-danger/20 text-danger border border-danger/40' : 'bg-primary/15 text-primary border border-primary/30'
          }`}>
            <AlertOctagon className={`h-5 w-5 ${emergency.active ? 'animate-bounce-sm' : ''}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className={`text-sm md:text-base font-bold truncate ${emergency.active ? 'text-danger' : 'text-text'}`}>
                Emergency Command & Safe Corridors
              </h1>
              {emergency.active ? (
                <span className="badge-critical text-2xs font-bold animate-pulse flex-shrink-0">
                  ACTIVE PROTOCOL
                </span>
              ) : (
                <span className="badge-muted text-2xs font-semibold flex-shrink-0">
                  STANDBY READY
                </span>
              )}
            </div>
            <p className="text-2xs text-text-muted truncate">
              {emergency.active
                ? `Active since ${emergency.activatedAt ? formatDateTime(emergency.activatedAt) : 'now'} • ${emergency.reason}`
                : 'Real-time safe routing, convoy dispatch, and disaster response'
              }
            </p>
          </div>
        </div>

        {/* Header Nav Pill Switcher (Mobile & Tablet) */}
        <div className="flex lg:hidden items-center justify-between gap-1 bg-surface-2 p-1 rounded-xl border border-border">
          {[
            { id: 'operations', label: 'Operations', icon: <Shield className="h-3 w-3" /> },
            { id: 'map',        label: 'Live Map',   icon: <Compass className="h-3 w-3" /> },
            { id: 'corridors',  label: 'Corridors',  icon: <Navigation className="h-3 w-3" /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setMobileTab(t.id as any)}
              className={cn(
                'flex-1 py-1 px-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5',
                mobileTab === t.id ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'
              )}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <DemoControl />
          {emergency.active ? (
            <Button
              variant="outline"
              size="sm"
              className="border-danger/60 text-danger hover:bg-danger/15 font-semibold text-xs h-8"
              onClick={() => setDeactivateModal(true)}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Deactivate
            </Button>
          ) : (
            <Button
              variant="emergency"
              size="sm"
              className="font-semibold text-xs h-8"
              onClick={() => setActivateModal(true)}
            >
              <Zap className="h-3.5 w-3.5" /> Activate Emergency
            </Button>
          )}
        </div>
      </div>

      {/* ── SITUATION KPI STRIP ──────────────────────────────────────────────── */}
      <div className="bg-surface-2 border-b border-border/80 px-3 md:px-5 py-2 flex items-center justify-between gap-2 overflow-x-auto hide-scrollbar flex-shrink-0 text-xs">
        <div className="flex items-center gap-2 md:gap-6 min-w-max">
          <div
            onClick={() => { setLeftTab('stranded'); setMobileTab('operations') }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className={`status-dot ${strandedVehicles.length > 0 ? 'status-dot-red animate-status-pulse' : 'status-dot-green'}`} />
            <span className="text-text-muted text-2xs uppercase tracking-wider font-semibold">Stranded Vehicles:</span>
            <span className={`font-bold tabular-nums ${strandedVehicles.length > 0 ? 'text-danger' : 'text-text'}`}>
              {strandedVehicles.length}
            </span>
          </div>

          <div className="h-3.5 w-px bg-border flex-shrink-0" />

          <div className="flex items-center gap-2 min-w-max">
            <span className={`status-dot ${alertCriticalCount > 0 ? 'status-dot-red animate-status-pulse' : 'status-dot-green'}`} />
            <span className="text-text-muted text-2xs uppercase tracking-wider font-semibold">Critical Alerts:</span>
            <span className={`font-bold tabular-nums ${alertCriticalCount > 0 ? 'text-danger' : 'text-text'}`}>
              {alertCriticalCount}
            </span>
          </div>

          <div className="h-3.5 w-px bg-border flex-shrink-0" />

          <div
            onClick={() => { setRightTab('corridors'); setMobileTab('corridors') }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-max"
          >
            <span className="status-dot status-dot-green" />
            <span className="text-text-muted text-2xs uppercase tracking-wider font-semibold">Safe Corridors:</span>
            <span className="font-bold tabular-nums text-success">
              {activeCorridors.length} / {SAFE_CORRIDORS.length} Active
            </span>
          </div>

          <div className="h-3.5 w-px bg-border flex-shrink-0" />

          <div
            onClick={() => { setLeftTab('emergency'); setMobileTab('operations') }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-max"
          >
            <span className="status-dot status-dot-amber" />
            <span className="text-text-muted text-2xs uppercase tracking-wider font-semibold">Priority Convoys:</span>
            <span className="font-bold tabular-nums text-warning">
              {emergencyVehicles.length} on Route
            </span>
          </div>
        </div>

        {/* Status Tag */}
        <div className="hidden md:flex items-center gap-1.5 text-2xs text-text-subtle">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span>NER Grid Telemetry Live</span>
        </div>
      </div>

      {/* ── MAIN 3-COLUMN WORKSPACE ─────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── LEFT PANEL (Operations & Dispatch) ───────────────────────────── */}
        <div className={`w-full lg:w-80 xl:w-96 flex-shrink-0 border-r border-border bg-surface flex-col overflow-hidden ${
          mobileTab === 'operations' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Header Navigation Pills */}
          <div className="p-2.5 border-b border-border bg-surface flex-shrink-0">
            <Tabs
              tabs={LEFT_TABS_CONFIG}
              active={leftTab}
              onChange={(id) => setLeftTab(id as any)}
              variant="pill"
            />
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* 1. Priority Dispatch */}
            {leftTab === 'dispatch' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-2xs font-semibold text-text-muted uppercase tracking-wider">
                    Emergency Dispatch Channels
                  </span>
                  <span className="text-2xs text-primary font-medium">Ranked by Protocol</span>
                </div>

                {PRIORITY_CONFIG.map((p) => (
                  <div
                    key={p.category}
                    className={`app-card p-3 border transition-all duration-200 ${p.color}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl p-1 rounded-lg bg-surface-2">{p.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-text">{p.label}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Badge variant={p.badge} className="text-2xs py-0 px-1.5 font-bold">
                              Priority {p.order}
                            </Badge>
                            <span className="text-2xs text-text-dim">• {p.readyVehicles} Ready</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={p.order === 1 ? 'destructive' : p.order === 2 ? 'warning' : 'secondary'}
                        className="text-xs h-7 px-2.5 font-semibold"
                        onClick={() => setDispatchModal(p)}
                      >
                        <Send className="h-3 w-3" /> Dispatch
                      </Button>
                    </div>

                    <div className="text-2xs text-text-muted bg-surface-2/70 rounded-md p-2 border border-border/40">
                      <div className="text-text font-medium truncate">🎯 {p.target}</div>
                      <div className="text-text-subtle mt-0.5 flex items-center justify-between">
                        <span>Safe Route: <strong className="text-success">{p.preferredCorridor}</strong></span>
                        <span className="text-primary cursor-pointer hover:underline" onClick={() => setDispatchModal(p)}>Configure Convoy →</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Quick Notice */}
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20 text-2xs text-text-muted space-y-1">
                  <div className="font-semibold text-primary flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Auto-Escort Enabled
                  </div>
                  <p>All priority convoys receive instant right-of-way telemetry and landslide bypass routing.</p>
                </div>
              </div>
            )}

            {/* 2. Stranded Fleet */}
            {leftTab === 'stranded' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-2xs font-semibold text-text-muted uppercase tracking-wider">
                    Stranded Vehicles ({strandedVehicles.length})
                  </span>
                  {strandedVehicles.length > 0 && (
                    <span className="badge-critical text-2xs">Requires Rescue</span>
                  )}
                </div>

                {strandedVehicles.length === 0 ? (
                  <div className="text-center py-10 app-card p-6">
                    <CheckCircle className="h-8 w-8 text-success mx-auto mb-2 opacity-80" />
                    <div className="text-xs font-semibold text-text">No Stranded Vehicles</div>
                    <p className="text-2xs text-text-muted mt-1">All active vehicles are currently in transit or safe hubs.</p>
                  </div>
                ) : (
                  strandedVehicles.map((v) => (
                    <div key={v.id} className="relative group">
                      <VehicleCard
                        vehicle={v}
                        compact
                        onSelect={handleVehicleSelect}
                        onReroute={() => {
                          toast.success(`Safe corridor bypass calculated for ${v.registrationNo}`, {
                            description: 'Routing via SH-15 corridor avoiding NH-415 landslide.'
                          })
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. Active Emergency Convoys */}
            {leftTab === 'emergency' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-2xs font-semibold text-text-muted uppercase tracking-wider">
                    High Priority Fleet ({emergencyVehicles.length})
                  </span>
                  <span className="badge-warning text-2xs">Emergency Flagged</span>
                </div>

                {emergencyVehicles.length === 0 ? (
                  <div className="text-center py-10 app-card p-6">
                    <Truck className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-60" />
                    <div className="text-xs font-semibold text-text">No Active Priority Convoys</div>
                    <p className="text-2xs text-text-muted mt-1">Dispatch medical or ration units from the Priority tab.</p>
                  </div>
                ) : (
                  emergencyVehicles.map((v) => (
                    <VehicleCard
                      key={v.id}
                      vehicle={v}
                      compact
                      onSelect={handleVehicleSelect}
                      onReroute={() => toast.info(`Re-evaluating live risk for ${v.registrationNo}...`)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER PANEL (Interactive Command Map) ────────────────────────── */}
        <div className={`flex-1 relative overflow-hidden min-w-0 bg-background ${
          mobileTab === 'map' ? 'flex' : 'hidden lg:flex'
        }`}>
          <MapEngine
            layers={['roads', 'vehicles', 'alerts', 'safeCorridors']}
            onVehicleClick={handleVehicleSelect}
            onAlertClick={(a) => { if (a.location) flyTo(a.location, 12) }}
          />

          {/* Floating Emergency Header Overlay */}
          {emergency.active && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 max-w-[90%] pointer-events-none">
              <div className="flex items-center gap-2 px-3.5 py-1.5 bg-danger text-white rounded-full shadow-lg backdrop-blur border border-danger/60 text-xs font-bold pointer-events-auto">
                <span className="h-2 w-2 bg-white rounded-full animate-ping" />
                <span>EMERGENCY PROTOCOL ACTIVE — SAFE CORRIDORS ENFORCED</span>
              </div>
            </div>
          )}

          {/* Quick Map Controls Overlay */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              className="glass text-2xs font-semibold shadow-card hover:bg-surface-2"
              onClick={() => {
                if (strandedVehicles.length > 0) {
                  flyTo(strandedVehicles[0].currentLocation, 12)
                  setSelectedV(strandedVehicles[0])
                } else {
                  flyTo({ lat: 26.5, lng: 93.5 }, 8)
                }
              }}
            >
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Focus Zone</span>
            </Button>
          </div>

          {/* Selected Vehicle Float Card */}
          {selectedV && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-sm px-3 z-20 animate-scale-in">
              <div className="surface-elevated rounded-xl p-3 border border-border shadow-modal flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-surface-2 flex items-center justify-center text-lg flex-shrink-0">
                    {selectedV.type === 'ambulance' ? '🚑' : selectedV.type === 'tanker' ? '⛽' : '🚛'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-text font-mono truncate">{selectedV.registrationNo}</div>
                    <div className="text-2xs text-text-muted truncate">{selectedV.cargo} • {selectedV.driver}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge variant={selectedV.status === 'stopped' ? 'critical' : selectedV.status === 'on_route' ? 'success' : 'warning'}>
                    {selectedV.status.toUpperCase()}
                  </Badge>
                  <Button size="icon-sm" variant="ghost" onClick={() => setSelectedV(null)}>✕</Button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Live Safe Corridor Status Bar */}
          <div className="absolute bottom-0 left-0 right-0 py-2 px-4 glass border-t border-border/50 flex items-center justify-between text-2xs z-10 pointer-events-none">
            <div className="flex items-center gap-4 text-text-muted">
              <span className="flex items-center gap-1 text-success"><span className="status-dot status-dot-green" />NH-6 (Risk 22%)</span>
              <span className="hidden sm:flex items-center gap-1 text-success"><span className="status-dot status-dot-green" />NH-27 (Risk 18%)</span>
              <span className="hidden sm:flex items-center gap-1 text-success"><span className="status-dot status-dot-green" />SH-15 (Risk 38%)</span>
              <span className="flex items-center gap-1 text-danger"><span className="status-dot status-dot-red animate-pulse" />NH-415 Blocked</span>
            </div>
            <div className="text-text-subtle font-medium">
              Live Safe Corridor Matrix
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (Corridor Intelligence & Comms) ───────────────────── */}
        <div className={`w-full lg:w-72 xl:w-80 flex-shrink-0 border-l border-border bg-surface flex-col overflow-hidden ${
          mobileTab === 'corridors' ? 'flex' : 'hidden lg:flex'
        }`}>
          {/* Header Navigation Pills */}
          <div className="p-2.5 border-b border-border bg-surface flex-shrink-0">
            <Tabs
              tabs={RIGHT_TABS_CONFIG}
              active={rightTab}
              onChange={(id) => setRightTab(id as any)}
              variant="pill"
            />
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* 1. Safe Corridors List */}
            {rightTab === 'corridors' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-2xs font-semibold text-text-muted uppercase tracking-wider">
                    Corridor Status & Risk
                  </span>
                  <span className="text-2xs text-success font-semibold">
                    {activeCorridors.length} Operational
                  </span>
                </div>

                {SAFE_CORRIDORS.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleCorridorClick(c)}
                    className={`app-card p-3 border cursor-pointer hover:border-primary/50 transition-all ${
                      c.status === 'active'
                        ? 'border-success/25 bg-success/5 hover:bg-success/10'
                        : 'border-danger/30 bg-danger/5 hover:bg-danger/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <div>
                        <div className="text-xs font-bold text-text flex items-center gap-1.5">
                          {c.name}
                          <ExternalLink className="h-3 w-3 text-text-subtle opacity-60" />
                        </div>
                        <div className="text-2xs text-text-muted truncate">{c.route}</div>
                      </div>
                      <span className={`text-2xs font-bold px-1.5 py-0.5 rounded-full ${
                        c.status === 'active' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                      }`}>
                        {c.status === 'active' ? '✓ OPEN' : '✗ BLOCKED'}
                      </span>
                    </div>

                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between text-2xs text-text-muted">
                        <span>Risk Index: <strong className={c.risk >= 70 ? 'text-danger' : c.risk >= 35 ? 'text-warning' : 'text-success'}>{c.risk}%</strong></span>
                        <span>{c.vehicles} Convoys Active</span>
                      </div>
                      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            c.risk >= 70 ? 'bg-danger' : c.risk >= 35 ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(10, c.status === 'active' ? 100 - c.risk : 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Real-time Comms Feed */}
            {rightTab === 'comms' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-2xs font-semibold text-text-muted uppercase tracking-wider">
                    Emergency Dispatch Radio
                  </span>
                  <span className="status-dot status-dot-green animate-status-pulse" />
                </div>

                {/* Broadcast Form */}
                <form onSubmit={handleSendBroadcast} className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Broadcast alert to fleet..."
                    value={newBroadcast}
                    onChange={(e) => setNewBroadcast(e.target.value)}
                    className="flex-1 bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 text-xs text-text placeholder:text-text-subtle focus:outline-none focus:border-primary"
                  />
                  <Button type="submit" size="sm" variant="default" className="h-8 px-2.5">
                    <Send className="h-3 w-3" />
                  </Button>
                </form>

                {/* Comms Feed List */}
                <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                  {commsLog.map((l, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-surface-2/60 border border-border/40 space-y-0.5 text-2xs"
                    >
                      <div className="flex items-center justify-between text-text-subtle font-mono">
                        <span>{l.time}</span>
                        <span className={`font-bold uppercase text-[9px] ${
                          l.type === 'critical' ? 'text-danger' :
                          l.type === 'warning' ? 'text-warning' :
                          l.type === 'success' ? 'text-success' : 'text-primary'
                        }`}>
                          {l.type}
                        </span>
                      </div>
                      <p className={`leading-relaxed ${
                        l.type === 'critical' ? 'text-danger font-medium' :
                        l.type === 'warning' ? 'text-warning' :
                        l.type === 'success' ? 'text-success' : 'text-text-muted'
                      }`}>
                        {l.msg}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Emergency Contacts */}
            {rightTab === 'contacts' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-2xs font-semibold text-text-muted uppercase tracking-wider">
                    Emergency Hotlines
                  </span>
                  <span className="text-2xs text-text-muted">Instant Connect</span>
                </div>

                {EMERGENCY_CONTACTS.map((c) => {
                  const Icon = c.icon
                  return (
                    <div
                      key={c.name}
                      className="app-card p-2.5 border border-border/60 hover:border-primary/40 flex items-center justify-between gap-2.5 bg-surface"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-surface-2 border border-white/5 flex items-center justify-center text-primary flex-shrink-0">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-text truncate">{c.name}</div>
                          <div className="text-2xs text-text-muted truncate">{c.dept}</div>
                          <div className="text-xs text-primary font-semibold mt-0.5">{c.number}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="icon-sm"
                          variant="secondary"
                          title="Copy Number"
                          onClick={() => copyToClipboard(c.number, c.name)}
                          className="h-7 w-7"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="default"
                          title="Call Hotline"
                          onClick={() => toast.info(`Calling ${c.name}: ${c.number}...`)}
                          className="h-7 w-7"
                        >
                          <Phone className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────────────────── */}

      {/* Activate Modal */}
      <Modal open={activateModal} onClose={() => setActivateModal(false)} title="Activate Emergency Mode" size="sm">
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-danger/15 border border-danger/30 text-xs text-danger font-medium flex items-start gap-2">
            <AlertOctagon className="h-4 w-4 flex-shrink-0 mt-0.5 text-danger" />
            <div>
              <strong>Emergency Mode Activation</strong>
              <p className="mt-0.5 text-danger/80">This will enforce high-priority safe corridor rerouting and alert all NDRF/District command units.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider">Incident Scenario</label>
            <select
              className="w-full bg-surface-2 border border-border rounded-lg p-2 text-xs text-text focus:outline-none focus:border-primary"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            >
              {PRESET_INCIDENTS.map((inc) => (
                <option key={inc} value={inc}>{inc}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 text-xs text-text-muted bg-surface-2/60 p-2.5 rounded-lg border border-border/40">
            <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-success" /> Priority dispatch: Medical → Food → Water</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-success" /> Safe corridors dynamically activated</div>
            <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-success" /> Live landslide avoidance enforced</div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 text-xs" onClick={() => setActivateModal(false)}>Cancel</Button>
            <Button variant="emergency" className="flex-1 text-xs" onClick={handleActivate}>
              <Zap className="h-3.5 w-3.5" /> Activate Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deactivate Modal */}
      <Modal open={deactivateModal} onClose={() => setDeactivateModal(false)} title="Deactivate Emergency Mode" size="sm">
        <div className="space-y-4">
          <p className="text-xs text-text-muted">
            Are you sure the crisis is resolved? Normal network traffic and speed restrictions will be restored.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 text-xs" onClick={() => setDeactivateModal(false)}>Cancel</Button>
            <Button variant="success" className="flex-1 text-xs" onClick={handleDeactivate}>
              Confirm Deactivate
            </Button>
          </div>
        </div>
      </Modal>

      {/* Dispatch Convoy Modal */}
      <Modal
        open={!!dispatchModal}
        onClose={() => setDispatchModal(null)}
        title={`Dispatch ${dispatchModal?.label ?? 'Convoy'}`}
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-surface-2 border border-border space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Target Destination:</span>
              <span className="text-text font-semibold text-right max-w-[200px] truncate">{dispatchModal?.target}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Recommended Corridor:</span>
              <span className="text-success font-semibold">{dispatchModal?.preferredCorridor}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Convoy Escort:</span>
              <span className="text-primary font-semibold">NDRF / Police Pilot</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider">Number of Vehicles in Convoy</label>
            <select
              className="w-full bg-surface-2 border border-border rounded-lg p-2 text-xs text-text focus:outline-none focus:border-primary"
              value={dispatchVehiclesCount}
              onChange={(e) => setDispatchVehiclesCount(e.target.value)}
            >
              <option value="1">1 Priority Vehicle</option>
              <option value="2">2 Vehicles (Convoy Alpha)</option>
              <option value="4">4 Vehicles (Convoy Heavy)</option>
              <option value="6">6 Vehicles (Full Taskforce)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 text-xs" onClick={() => setDispatchModal(null)}>Cancel</Button>
            <Button variant="default" className="flex-1 text-xs" onClick={handleDispatch}>
              <Navigation className="h-3.5 w-3.5" /> Confirm Dispatch
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
