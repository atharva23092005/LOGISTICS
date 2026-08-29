/**
 * DemoControl — Manual scenario buttons + Auto-Play chain
 *
 * Auto-Play fires the 10-step story:
 *   Weather → AI Prediction → Road Risk → Alert → Vehicles Affected
 *   → Alternate Routes → Reroute → Field Report → Offline Sync → Dashboard Update
 */
import { useState, useRef, useCallback } from 'react'
import {
  Play, ChevronDown, CloudRain, Mountain, AlertOctagon,
  Truck, Radio, Zap, RotateCcw, StepForward, Square,
  CheckCircle, Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { useEventBus }     from '@/stores/eventBus'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useRouteStore }   from '@/stores/routeStore'
import { useAppStore }     from '@/stores/appStore'
import { useAlertStore }   from '@/stores/alertStore'

// ── Chain steps ──────────────────────────────────────────────────────────────
interface ChainStep {
  id:    string
  label: string
  icon:  string
  delay: number   // ms after previous step
  fn:    () => void
}

const MANUAL_SCENARIOS = [
  { id: 'normal',                label: 'Reset to Normal',      icon: RotateCcw,     color: 'text-success',  desc: 'Reset all state to baseline' },
  { id: 'heavy_rain',            label: 'Trigger Heavy Rain',   icon: CloudRain,     color: 'text-info',     desc: 'East Siang 84mm/hr rainfall' },
  { id: 'landslide_prediction',  label: 'AI Predicts Landslide',icon: Mountain,      color: 'text-warning',  desc: 'NH-415 72% risk in 6 hours' },
  { id: 'road_blocked',          label: 'Block NH-415',         icon: AlertOctagon,  color: 'text-danger',   desc: 'Confirmed blockage — 3 vehicles stranded' },
  { id: 'vehicle_delayed',       label: 'Delay Vehicle',        icon: Truck,         color: 'text-warning',  desc: 'AS-14-EF-4567 route affected' },
  { id: 'field_report',          label: 'Field Report',         icon: Radio,         color: 'text-info',     desc: 'Officer submits offline incident' },
  { id: 'emergency',             label: 'Activate Emergency',   icon: Zap,           color: 'text-danger',   desc: 'Full priority dispatch mode' },
]

export function DemoControl() {
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [chainMode,  setChainMode]  = useState(false)
  const [chainStep,  setChainStep]  = useState(-1)   // -1 = idle
  const [playing,    setPlaying]    = useState(false)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const emit             = useEventBus(s => s.emit)
  const updateVehicle    = useVehicleStore(s => s.updateVehicle)
  const updateRoadStatus = useRouteStore(s => s.updateRoadStatus)
  const activateEmergency  = useAppStore(s => s.activateEmergency)
  const deactivateEmergency = useAppStore(s => s.deactivateEmergency)
  const setNetworkOnline = useAppStore(s => s.setNetworkOnline)
  const addAlert         = useAlertStore(s => s.addAlert)

  // ── Manual scenario handlers ────────────────────────────────────────────
  const triggerManual = useCallback((id: string) => {
    setMenuOpen(false)
    switch (id) {
      case 'normal':
        deactivateEmergency()
        updateRoadStatus('nh415-seg1', 'blocked', 87)
        updateVehicle('v3', { status: 'delayed' })
        setNetworkOnline(true)
        toast.success('Reset to normal operations')
        break
      case 'heavy_rain':
        emit('WEATHER_ALERT', { district: 'East Siang', rainfall: 84, riskScore: 78 })
        toast.warning('Heavy rainfall — East Siang', {
          description: '84mm/hr · Landslide and flood risk elevated.',
          duration: 5000,
        })
        break
      case 'landslide_prediction':
        emit('LANDSLIDE_PREDICTED', { roadId: 'nh415-seg1', roadName: 'NH-415', riskScore: 72 })
        toast.warning('AI: Landslide Risk 72% — NH-415', {
          description: 'High probability in next 6 hours. Consider rerouting.',
          duration: 6000,
        })
        break
      case 'road_blocked':
        emit('ROAD_BLOCKED', { roadId: 'nh415-seg1', roadName: 'NH-415', affectedVehicles: ['v4','v6','v9'] })
        updateRoadStatus('nh415-seg1', 'blocked', 95)
        updateVehicle('v4', { status: 'stopped', speed: 0 })
        updateVehicle('v6', { status: 'stopped', speed: 0 })
        updateVehicle('v9', { status: 'stopped', speed: 0 })
        toast.error('NH-415 BLOCKED', { description: '3 vehicles stranded. Rerouting required.', duration: 7000 })
        break
      case 'vehicle_delayed':
        updateVehicle('v3', { status: 'delayed', speed: 18 })
        emit('VEHICLE_DELAYED', { vehicleId: 'v3', reason: 'Road flooding' })
        toast.warning('AS-14-EF-4567 Delayed', { description: 'Speed 18km/h — NH-37 flooding.', duration: 5000 })
        break
      case 'field_report':
        emit('FIELD_INCIDENT_REPORTED', {
          location: { lat: 26.9000, lng: 93.9000 },
          type: 'road_damage', reportedBy: 'Field Officer Sunil Pegu',
        })
        toast.info('Field Report Received', {
          description: 'Bridge crack detected on SH-15 — awaiting verification.',
          duration: 5000,
        })
        break
      case 'emergency':
        activateEmergency('Critical multi-point road blockage — East Siang')
        emit('EMERGENCY_ACTIVATED', { reason: 'Critical blockage' })
        toast.error('EMERGENCY MODE ACTIVATED', {
          description: 'Priority: Medical → Food → Water. Safe corridors active.',
          duration: 8000,
        })
        break
    }
  }, [emit, updateVehicle, updateRoadStatus, activateEmergency, deactivateEmergency, setNetworkOnline])

  // ── Auto-play chain ─────────────────────────────────────────────────────
  const buildChain = useCallback((): ChainStep[] => [
    {
      id: 'step-1', label: 'Heavy Rainfall Detected', icon: 'rain', delay: 0,
      fn: () => {
        emit('WEATHER_ALERT', { district: 'East Siang', rainfall: 84, riskScore: 78 })
        toast.warning('Step 1/10: Heavy Rainfall — East Siang', { description: '84mm/hr · Risk escalating', duration: 4000 })
      },
    },
    {
      id: 'step-2', label: 'AI Predicts Landslide', icon: 'ai', delay: 3500,
      fn: () => {
        emit('LANDSLIDE_PREDICTED', { roadId: 'nh415-seg1', roadName: 'NH-415', riskScore: 72 })
        toast.warning('Step 2/10: AI Prediction: NH-415 Landslide 72%', { description: 'Confidence: 86% · Horizon: 6h', duration: 4000 })
      },
    },
    {
      id: 'step-3', label: 'Road Risk Escalates', icon: 'risk', delay: 3500,
      fn: () => {
        updateRoadStatus('nh415-seg1', 'blocked', 87)
        toast.error('Step 3/10: NH-415 Risk → 87% CRITICAL', { description: 'Road status changing to BLOCKED', duration: 4000 })
      },
    },
    {
      id: 'step-4', label: 'Critical Alert Generated', icon: 'alert', delay: 3500,
      fn: () => {
        emit('ROAD_BLOCKED', { roadId: 'nh415-seg1', roadName: 'NH-415', affectedVehicles: ['v4','v6','v9'] })
        toast.error('Step 4/10: ALERT: NH-415 Blocked — Landslide Confirmed', { description: '3 vehicles affected · 12 deliveries at risk', duration: 4000 })
      },
    },
    {
      id: 'step-5', label: 'Vehicles Stopped', icon: 'vehicle', delay: 3500,
      fn: () => {
        updateVehicle('v4', { status: 'stopped', speed: 0 })
        updateVehicle('v6', { status: 'stopped', speed: 0 })
        updateVehicle('v9', { status: 'stopped', speed: 0 })
        emit('VEHICLE_STOPPED', { vehicleId: 'v4' })
        emit('VEHICLE_STOPPED', { vehicleId: 'v6' })
        toast.warning('Step 5/10: 3 Vehicles Stopped — AR-01-GH-2345 (Emergency)', { description: 'Emergency medical convoy stranded on NH-415', duration: 4000 })
      },
    },
    {
      id: 'step-6', label: 'Alternate Routes Generated', icon: 'route', delay: 4000,
      fn: () => {
        toast.info('Step 6/10: AI Route Analysis Complete', {
          description: 'Route C via NH-6 & NH-13: Risk 28% · AI Recommended',
          duration: 5000,
        })
      },
    },
    {
      id: 'step-7', label: 'Reroute Confirmed', icon: 'reroute', delay: 4000,
      fn: () => {
        updateVehicle('v4', { routeId: 'route-3' })
        updateVehicle('v6', { routeId: 'route-3' })
        emit('VEHICLE_REROUTED', { vehicleId: 'v4', newRouteId: 'route-3' })
        toast.success('Step 7/10: Convoy Rerouted via NH-6', { description: 'Medical supplies via safe corridor · New ETA 5h 45m', duration: 5000 })
      },
    },
    {
      id: 'step-8', label: 'Field Officer Reports', icon: 'field', delay: 4000,
      fn: () => {
        setNetworkOnline(false)
        emit('FIELD_INCIDENT_REPORTED', { type: 'landslide', location: { lat: 27.75, lng: 95.2 }, reportedBy: 'Field Officer Karma Singh' })
        toast.info('Step 8/10: Field Report: Landslide Confirmed (OFFLINE)', { description: 'GPS captured · 2 photos · Saved locally · Pending sync', duration: 5000 })
      },
    },
    {
      id: 'step-9', label: 'Offline Sync', icon: 'sync', delay: 5000,
      fn: () => {
        setNetworkOnline(true)
        emit('OFFLINE_SYNC', { reportCount: 1, photosUploaded: 2 })
        toast.success('Step 9/10: Field Report Synced', { description: 'Report uploaded · GPS verified · Photos synced', duration: 5000 })
      },
    },
    {
      id: 'step-10', label: 'Command Center Updated', icon: 'command', delay: 3500,
      fn: () => {
        toast.success('Step 10/10: Command Center Updated', {
          description: 'Field incident confirmed · Road marked BLOCKED · All vehicles rerouted · Incident logged',
          duration: 6000,
        })
      },
    },
  ], [emit, updateVehicle, updateRoadStatus, setNetworkOnline])

  const playChain = useCallback(() => {
    // Clear any running chain
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setPlaying(true)
    setChainStep(0)

    const steps = buildChain()
    let cumDelay = 0

    steps.forEach((step, i) => {
      cumDelay += step.delay
      const t = setTimeout(() => {
        setChainStep(i)
        step.fn()
        if (i === steps.length - 1) {
          setTimeout(() => { setPlaying(false); setChainStep(-1) }, 4000)
        }
      }, cumDelay)
      timeoutsRef.current.push(t)
    })
  }, [buildChain])

  const stopChain = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
    setPlaying(false)
    setChainStep(-1)
    toast.info('Demo chain stopped')
  }, [])

  const chainSteps = buildChain()

  return (
    <div className="relative">
      {/* Main button group */}
      <div className="flex items-center gap-1">
        {/* Auto-play chain toggle */}
        <Button
          size="sm"
          variant={chainMode ? 'default' : 'secondary'}
          className="gap-1.5 border border-border text-xs"
          onClick={() => setChainMode(m => !m)}
        >
          <StepForward className="h-3.5 w-3.5 text-warning" />
          {chainMode ? 'Chain Mode' : 'Chain'}
        </Button>

        {/* Manual scenarios */}
        <Button
          size="sm"
          variant="secondary"
          className="gap-1.5 border border-border"
          onClick={() => setMenuOpen(o => !o)}
        >
          <Play className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs">Scenarios</span>
          <ChevronDown className={cn('h-3 w-3 text-text-muted transition-transform', menuOpen && 'rotate-180')} />
        </Button>
      </div>

      {/* Chain Mode Panel */}
      {chainMode && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="p-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-text flex items-center gap-1.5">
                  <StepForward className="h-3.5 w-3.5 text-warning" /> Demo Chain — Full Story
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">
                  10-step scenario: Weather → AI → Alert → Reroute → Field → Sync
                </div>
              </div>
              <Button size="icon-sm" variant="ghost" onClick={() => setChainMode(false)}>✕</Button>
            </div>
          </div>

          {/* Steps list */}
          <div className="p-2 max-h-72 overflow-y-auto space-y-1">
            {chainSteps.map((step, i) => {
              const isDone    = playing && chainStep > i
              const isActive  = playing && chainStep === i
              const isPending = !playing || chainStep < i
              return (
                <div key={step.id} className={cn(
                  'flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all',
                  isActive  ? 'bg-primary/10 border border-primary/30' :
                  isDone    ? 'bg-success/5 border border-success/20 opacity-70' :
                  'border border-transparent'
                )}>
                  <span className="text-base flex-shrink-0 w-5 text-center">
                    {isDone ? '✓' : isActive ? '▶' : step.icon}
                  </span>
                  <span className={cn(
                    'flex-1',
                    isDone   ? 'text-success line-through'  :
                    isActive ? 'text-primary font-semibold' :
                    'text-text-muted'
                  )}>
                    {i + 1}. {step.label}
                  </span>
                  {isActive && <Clock className="h-3 w-3 text-primary animate-pulse" />}
                  {isDone    && <CheckCircle className="h-3 w-3 text-success" />}
                </div>
              )
            })}
          </div>

          {/* Play / Stop */}
          <div className="p-3 border-t border-border">
            {!playing ? (
              <Button className="w-full" onClick={playChain}>
                <Play className="h-4 w-4" /> Play Full Demo Chain
              </Button>
            ) : (
              <Button className="w-full" variant="destructive" onClick={stopChain}>
                <Square className="h-4 w-4" /> Stop Chain
              </Button>
            )}
            {playing && (
              <div className="mt-2">
                <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${((chainStep + 1) / chainSteps.length) * 100}%` }}
                  />
                </div>
                <div className="text-[9px] text-text-muted text-center mt-1">
                  Step {chainStep + 1} of {chainSteps.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Manual scenarios dropdown */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-68 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
            <div className="px-3 py-2.5 border-b border-border">
              <div className="text-xs font-semibold text-text flex items-center gap-1.5">
                <Play className="h-3.5 w-3.5 text-warning" /> Manual Scenarios
              </div>
              <div className="text-[10px] text-text-muted mt-0.5">Trigger individual events</div>
            </div>
            <div className="p-2 space-y-1">
              {MANUAL_SCENARIOS.map(s => {
                const Icon = s.icon
                return (
                  <button key={s.id} onClick={() => triggerManual(s.id)}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-surface-2 text-left transition-all">
                    <Icon className={cn('h-4 w-4 flex-shrink-0 mt-0.5', s.color)} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-text">{s.label}</div>
                      <div className="text-[10px] text-text-muted">{s.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
