import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Truck, Navigation, AlertTriangle, CheckCircle2, Clock,
  Radio, Phone, Shield, ArrowRight, MessageSquare,
  Volume2, VolumeX, RefreshCw, Layers, Compass,
  MapPin, Check, Zap, AlertOctagon, HeartPulse,
  Gauge, Fuel, Thermometer, ShieldAlert, ArrowUpRight,
  RotateCcw, Sliders, Info, Eye, FileText, ChevronRight,
  Sparkles, ExternalLink, Activity, Battery, Signal,
  ShieldCheck, ArrowDownRight, CornerUpRight
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { MapEngine } from '@/modules/map/MapEngine'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useAppStore } from '@/stores/appStore'
import { useEventBus } from '@/stores/eventBus'
import { cn } from '@/utils/cn'

export function DriverPage() {
  const user = useAppStore(s => s.user)
  const networkOnline = useAppStore(s => s.networkOnline)
  const vehicles = useVehicleStore(s => s.vehicles)
  const updateVehicle = useVehicleStore(s => s.updateVehicle)
  const emit = useEventBus(s => s.emit)

  // Driver assigned convoy: default to AR-01-GH-2345 (Emergency Medical Supplies)
  const vehicle = vehicles.find(v => v.id === 'v4') ?? vehicles[0]

  // Android Navigation Tabs
  const [activeTab, setActiveTab] = useState<'nav' | 'telemetry' | 'status' | 'sms' | 'manifest'>('nav')
  const [driverStatus, setDriverStatus] = useState<'picked_up' | 'on_route' | 'delayed' | 'delivered'>('on_route')
  const [rerouteAlert, setRerouteAlert] = useState(true)
  const [activeRouteName, setActiveRouteName] = useState('Route C — SH-15 & NH-27 Safe Bypass')
  const [speed, setSpeed] = useState(44)
  const [fuel, setFuel] = useState(74)
  const [voiceGuidance, setVoiceGuidance] = useState(true)
  const [sosCountdown, setSosCountdown] = useState<number | null>(null)
  const [sosModal, setSosModal] = useState(false)

  // Turn-by-turn instruction
  const [nextManeuver, setNextManeuver] = useState({
    distance: '1.4 km',
    instruction: 'Bear Left onto SH-15 North Bank Safe Corridor',
    subText: 'Avoids NH-415 Km 42 landslide zone • Gradient 3.2°',
    speedLimit: 50,
  })

  // Simulated SMS feed for dead-zone redundancy
  const [smsMessages, setSmsMessages] = useState([
    {
      id: 'sms-1',
      time: '12m ago',
      sender: 'NER-HQ-DISPATCH',
      text: 'CRITICAL REROUTE: NH-415 blocked at Km 42 (Landslide). Divert to SH-15 Safe Corridor. New ETA: 5h 45m.',
      priority: 'urgent' as const,
    },
    {
      id: 'sms-2',
      time: '45m ago',
      sender: 'NER-HQ-DISPATCH',
      text: 'WEATHER ADVISORY: Heavy rainfall (84mm/hr) in East Siang sector. Keep convoy speed below 45km/h.',
      priority: 'warning' as const,
    },
    {
      id: 'sms-3',
      time: '2h ago',
      sender: 'NER-HQ-DISPATCH',
      text: 'DISPATCH ORDER: Convoy AR-01-GH-2345 cleared with Medical Supplies priority payload.',
      priority: 'normal' as const,
    },
  ])

  // Live speed oscillation simulation for realistic in-cab HUD
  useEffect(() => {
    const interval = setInterval(() => {
      if (driverStatus === 'on_route') {
        setSpeed(prev => Math.max(38, Math.min(52, prev + Math.floor((Math.random() - 0.48) * 4))))
      } else if (driverStatus === 'delayed') {
        setSpeed(prev => Math.max(12, Math.min(22, prev + Math.floor((Math.random() - 0.5) * 3))))
      } else {
        setSpeed(0)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [driverStatus])

  // SOS Countdown timer
  useEffect(() => {
    if (sosCountdown === null) return
    if (sosCountdown <= 0) {
      toast.error('🚨 SOS DISTRESS BEACON BROADCASTED', {
        description: 'State Police and Central Command dispatched to your GPS coordinates.',
        duration: 10000,
      })
      emit('EMERGENCY_ACTIVATED', { reason: `Driver Emergency SOS triggered from ${vehicle.registrationNo}` })
      setSosCountdown(null)
      setSosModal(false)
      return
    }
    const t = setTimeout(() => setSosCountdown(c => (c !== null ? c - 1 : null)), 1000)
    return () => clearTimeout(t)
  }, [sosCountdown, emit, vehicle.registrationNo])

  const handleStatusChange = (newStatus: 'picked_up' | 'on_route' | 'delayed' | 'delivered') => {
    setDriverStatus(newStatus)
    const backendStatus = newStatus === 'delivered' ? 'stopped' : newStatus === 'delayed' ? 'delayed' : 'on_route'
    updateVehicle(vehicle.id, { status: backendStatus })
    
    const labels = {
      picked_up: '1. Cargo Picked Up (Depot)',
      on_route: '2. In Transit (Safe Speed Locked)',
      delayed: '3. Hazard Slowdown Reported',
      delivered: '4. Delivery Complete at Pasighat Hub',
    }
    toast.success(`Status: ${labels[newStatus]}`, {
      description: 'Updated to Command HQ telemetry stream.',
    })
  }

  const handleAcceptReroute = () => {
    setRerouteAlert(false)
    setActiveRouteName('Route C — SH-15 & NH-27 Safe Bypass (Active)')
    emit('VEHICLE_REROUTED', { vehicleId: vehicle.id, newRouteId: 'route-3' })
    if (voiceGuidance) {
      toast.info('🔊 Voice Guidance: Safe bypass locked. Proceed along SH-15 corridor.', { duration: 4000 })
    }
    toast.success('✅ Safe Bypass Corridor Locked', {
      description: 'Turn-by-turn navigation updated to bypass NH-415 landslide.',
    })
  }

  const handleSimulateSms = () => {
    const newSms = {
      id: `sms-${Date.now()}`,
      time: 'Just now',
      sender: 'NER-HQ-DISPATCH',
      text: 'SMS FALLBACK: NH-415 completely impassable. Proceed via SH-15 corridor as instructed. Confirm receipt.',
      priority: 'urgent' as const,
    }
    setSmsMessages(prev => [newSms, ...prev])
    setActiveTab('sms')
    toast.info('📱 SMS Notification Received on In-Cab Terminal', {
      description: newSms.text,
      duration: 6000,
    })
  }

  return (
    <div className="h-screen w-full bg-[#070B14] text-slate-100 font-sans selection:bg-blue-600/30 selection:text-white flex flex-col max-w-md mx-auto border-x border-slate-800 shadow-2xl overflow-hidden relative select-none">
      
      {/* ── Android Status Bar (System Bar) ── */}
      <div className="h-6 bg-[#04070D] px-3 flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-900 flex-shrink-0 z-40 select-none">
        <div className="flex items-center gap-1.5">
          <span>09:41</span>
          <span className="text-[10px] text-slate-500">•</span>
          <span className="text-[10px] text-emerald-400">HUD v2.4</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-slate-300">
            <Signal className="h-3 w-3 text-emerald-400" />
            4G LTE
          </span>
          <span className="flex items-center gap-0.5 text-slate-300">
            <Battery className="h-3.5 w-3.5 text-emerald-400" />
            86%
          </span>
        </div>
      </div>

      {/* ── In-Cab Android Top Bar ── */}
      <header className="p-3 bg-[#0A101E] border-b border-slate-800/90 flex items-center justify-between gap-2 flex-shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shadow-inner flex-shrink-0">
            <Truck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-xs sm:text-sm text-white tracking-tight truncate">
                {vehicle.registrationNo}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold uppercase tracking-wider">
                {vehicle.priority}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {vehicle.driver} • <span className="text-slate-300">{vehicle.origin} → {vehicle.destination}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Voice Guidance Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setVoiceGuidance(v => !v)
              toast.info(voiceGuidance ? '🔇 Voice guidance muted' : '🔊 Voice guidance active')
            }}
            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
            title="Toggle Voice Guidance"
          >
            {voiceGuidance ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          {/* Quick SOS Trigger */}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setSosModal(true)}
            className="h-8 px-2 text-[11px] font-bold bg-rose-600 hover:bg-rose-500 gap-1"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            SOS
          </Button>
        </div>
      </header>

      {/* ── Main Android Tab Views Container ── */}
      <main className="flex-1 overflow-hidden relative">
        
        {/* ── TAB 1: NAVIGATION HUD (FULL-SCREEN MAP + TACTICAL OVERLAYS) ── */}
        {activeTab === 'nav' && (
          <div className="w-full h-full relative flex flex-col">
            
            {/* 1. Floating Turn-by-Turn Card at Top */}
            <div className="absolute top-2.5 inset-x-2.5 z-20 animate-slide-down">
              <Card className="bg-[#0A111F]/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl overflow-hidden text-white">
                <div className="p-3 flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-blue-900/40">
                    <ArrowUpRight className="h-6 w-6 stroke-[2.5]" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wide">
                        In {nextManeuver.distance}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        Limit {nextManeuver.speedLimit} km/h
                      </span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-white tracking-tight leading-snug truncate">
                      {nextManeuver.instruction}
                    </h3>

                    <p className="text-[10px] text-slate-400 truncate">
                      {nextManeuver.subText}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/70 px-3 py-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    SH-15 Bypass
                  </span>
                  <span>Slope: <strong className="text-slate-200">3.2° (Safe)</strong></span>
                </div>
              </Card>
            </div>

            {/* 2. Floating Mid-Trip Reroute Alert Banner (Scenario B) */}
            {rerouteAlert && (
              <div className="absolute top-28 inset-x-2.5 z-20 animate-slide-up">
                <Card className="bg-gradient-to-r from-rose-950/95 via-rose-900/90 to-amber-950/95 border-2 border-rose-500/80 shadow-2xl backdrop-blur-xl text-white overflow-hidden p-3 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-rose-500/30 border border-rose-400 flex items-center justify-center text-rose-300 flex-shrink-0 animate-pulse">
                      <AlertOctagon className="h-5 w-5" />
                    </div>

                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-rose-200 uppercase tracking-wider">
                          ⚠️ MID-TRIP REROUTE
                        </span>
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-900/80 text-rose-300">
                          SCENARIO B
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white leading-snug truncate">
                        NH-415 Landslide Blockade ahead.
                      </p>
                      <p className="text-[10px] text-rose-200/90 leading-tight line-clamp-2">
                        Re-solved from GPS position via <strong>SH-15 Safe Bypass</strong> (+35 mins safe transit).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-rose-800/60">
                    <Button
                      onClick={handleAcceptReroute}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-8 shadow-lg shadow-emerald-950/50 gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Accept Safe Bypass
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleSimulateSms}
                      className="h-8 px-2.5 text-xs bg-slate-900/90 border border-slate-700 text-slate-300"
                    >
                      SMS Copy
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* 3. Embedded Map Engine Canvas */}
            <div className="w-full h-full">
              <MapEngine className="w-full h-full" />
            </div>

            {/* 4. Floating Mini-HUD Telemetry Strip at Bottom of Map */}
            <div className="absolute bottom-2 inset-x-2.5 z-20">
              <div className="p-2.5 rounded-xl bg-[#0A111F]/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl flex items-center justify-between text-center">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Speed</div>
                  <div className="text-base font-bold font-mono text-white leading-none mt-0.5">
                    {speed} <span className="text-[9px] text-slate-400">km/h</span>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-800" />

                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">ETA</div>
                  <div className="text-base font-bold font-mono text-emerald-400 leading-none mt-0.5">
                    5h 45m
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-800" />

                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Remaining</div>
                  <div className="text-base font-bold font-mono text-white leading-none mt-0.5">
                    118 <span className="text-[9px] text-slate-400">km</span>
                  </div>
                </div>

                <div className="h-6 w-px bg-slate-800" />

                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Fuel</div>
                  <div className="text-base font-bold font-mono text-amber-400 leading-none mt-0.5">
                    {fuel}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: FULL TELEMETRY & DIAGNOSTICS ── */}
        {activeTab === 'telemetry' && (
          <div className="h-full overflow-y-auto p-3 space-y-3 pb-16">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
              <span>In-Cab Diagnostics & Sensors</span>
              <span className="text-[10px] text-emerald-400 font-mono">TELEMETRY LIVE</span>
            </div>

            {/* Gauges Grid */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="bg-slate-900/80 border-slate-800 p-2.5 text-center">
                <div className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                  <Gauge className="h-3 w-3 text-blue-400" />
                  Speed
                </div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">{speed} km/h</div>
                <div className="text-[9px] text-emerald-400">Safe Hill Pace</div>
              </Card>

              <Card className="bg-slate-900/80 border-slate-800 p-2.5 text-center">
                <div className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                  <Clock className="h-3 w-3 text-emerald-400" />
                  ETA
                </div>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">5h 45m</div>
                <div className="text-[9px] text-slate-400">118 km left</div>
              </Card>

              <Card className="bg-slate-900/80 border-slate-800 p-2.5 text-center">
                <div className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-center gap-1">
                  <Fuel className="h-3 w-3 text-amber-400" />
                  Fuel
                </div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{fuel}%</div>
                <div className="text-[9px] text-slate-400">310 km range</div>
              </Card>
            </div>

            {/* Terrain Sensors */}
            <Card className="bg-slate-900/60 border-slate-800 p-3.5 space-y-2.5 text-xs text-white">
              <div className="font-bold flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <Compass className="h-4 w-4 text-blue-400" />
                  Corridor Terrain Telemetry
                </span>
                <span className="text-[10px] font-mono text-emerald-400">SH-15 BYPASS</span>
              </div>

              <div className="space-y-2 text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Slope Gradient:</span>
                  <strong className="text-white">14.2° Mountain Ascent</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Precipitation Gauge:</span>
                  <strong className="text-amber-400">38 mm/h (Wet Pavement)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subsoil Saturation:</span>
                  <strong className="text-rose-400">88% (High Moisture)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cargo Cold-Chain Temp:</span>
                  <strong className="text-emerald-400 font-mono">+4.2°C (Vaccines Safe)</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Trip Progress</span>
                  <span className="font-mono text-white">58% Completed</span>
                </div>
                <Progress value={58} color="primary" />
              </div>
            </Card>
          </div>
        )}

        {/* ── TAB 3: 1-TAP DELIVERY STATUS ACTIONS ── */}
        {activeTab === 'status' && (
          <div className="h-full overflow-y-auto p-3 space-y-3 pb-16">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
              <span>Driver Safety 1-Tap Status</span>
              <span className="text-[10px] text-blue-400">Single-Tap Action</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <Button
                variant={driverStatus === 'picked_up' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('picked_up')}
                className={cn(
                  'h-14 text-xs font-bold flex items-center justify-start gap-3 px-4 border-slate-800 rounded-xl',
                  driverStatus === 'picked_up' && 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/40 text-white'
                )}
              >
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-bold">1. Cargo Picked Up</div>
                  <div className="text-[10px] font-normal text-slate-300">Depot departure confirmed</div>
                </div>
              </Button>

              <Button
                variant={driverStatus === 'on_route' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('on_route')}
                className={cn(
                  'h-14 text-xs font-bold flex items-center justify-start gap-3 px-4 border-slate-800 rounded-xl',
                  driverStatus === 'on_route' && 'bg-emerald-600 border-emerald-500 shadow-lg shadow-emerald-900/40 text-white'
                )}
              >
                <Navigation className="h-5 w-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-bold">2. In Transit</div>
                  <div className="text-[10px] font-normal text-slate-300">Proceeding along safe corridor</div>
                </div>
              </Button>

              <Button
                variant={driverStatus === 'delayed' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('delayed')}
                className={cn(
                  'h-14 text-xs font-bold flex items-center justify-start gap-3 px-4 border-slate-800 rounded-xl',
                  driverStatus === 'delayed' && 'bg-amber-600 border-amber-500 shadow-lg shadow-amber-900/40 text-white'
                )}
              >
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-bold">3. Hazard Delay / Slowdown</div>
                  <div className="text-[10px] font-normal text-slate-300">Fog, mud, or road narrowing</div>
                </div>
              </Button>

              <Button
                variant={driverStatus === 'delivered' ? 'default' : 'outline'}
                onClick={() => handleStatusChange('delivered')}
                className={cn(
                  'h-14 text-xs font-bold flex items-center justify-start gap-3 px-4 border-slate-800 rounded-xl',
                  driverStatus === 'delivered' && 'bg-purple-600 border-purple-500 shadow-lg shadow-purple-900/40 text-white'
                )}
              >
                <HeartPulse className="h-5 w-5 flex-shrink-0" />
                <div className="text-left">
                  <div className="font-bold">4. Delivery Complete</div>
                  <div className="text-[10px] font-normal text-slate-300">Arrival at Pasighat Hospital Hub</div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* ── TAB 4: SMS BACKUP LOGS (DEAD ZONES) ── */}
        {activeTab === 'sms' && (
          <div className="h-full overflow-y-auto p-3 space-y-3 pb-16">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
              <span>SMS Dispatch Redundancy</span>
              <span className="text-[10px] text-rose-400 font-mono">DEAD-ZONE BACKUP</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              When 4G mobile data drops in deep Northeast river valleys, critical reroute orders are broadcast via SMS in parallel.
            </div>

            <div className="space-y-2.5">
              {smsMessages.map(sms => (
                <Card
                  key={sms.id}
                  className={cn(
                    'p-3 space-y-1 text-xs border text-white',
                    sms.priority === 'urgent'
                      ? 'bg-rose-950/30 border-rose-500/40'
                      : sms.priority === 'warning'
                      ? 'bg-amber-950/30 border-amber-500/40'
                      : 'bg-slate-900 border-slate-800'
                  )}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{sms.sender}</span>
                    <span>{sms.time}</span>
                  </div>
                  <div className="font-medium text-slate-200 leading-snug">{sms.text}</div>
                </Card>
              ))}
            </div>

            <Button
              onClick={handleSimulateSms}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs border border-slate-700 h-9"
            >
              Simulate New SMS Dispatch Order
            </Button>
          </div>
        )}

        {/* ── TAB 5: CONSIGNMENT MANIFEST ── */}
        {activeTab === 'manifest' && (
          <div className="h-full overflow-y-auto p-3 space-y-3 pb-16">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Official Consignment Manifest
            </div>

            <Card className="bg-[#0C1220] border-slate-800 p-3.5 space-y-2.5 text-xs text-white">
              <div className="text-slate-400">Cargo: <strong className="text-white">Emergency Medical Supplies & Vaccines</strong></div>
              <div className="text-slate-400">Batch Code: <strong className="text-blue-400 font-mono">MED-2025-AR-094</strong></div>
              <div className="text-slate-400">Weight: <strong className="text-white">2.4 Metric Tons</strong></div>
              <div className="text-slate-400">Storage Temp: <strong className="text-emerald-400">+2°C to +8°C (Compliant)</strong></div>
            </Card>

            <Card className="bg-[#0C1220] border-slate-800 p-3.5 space-y-2 text-xs text-white">
              <div className="font-semibold text-white">Destination Facility:</div>
              <div className="text-slate-300">District Hospital Pasighat & Relief Camp Alpha</div>
              <div className="text-[11px] text-slate-400">Chief Medical Officer: Dr. M. Koyu</div>
            </Card>

            <Card className="bg-[#0C1220] border-slate-800 p-3.5 space-y-2 text-xs text-white">
              <div className="font-semibold text-white">Authorized Dispatcher:</div>
              <div className="text-slate-300">Officer Rajesh Kumar • Guwahati Command HQ</div>
              <div className="text-blue-400 font-mono text-[11px]">+91 94350-12345</div>
            </Card>
          </div>
        )}
      </main>

      {/* ── Android Material Bottom Navigation Bar (5 Touch Tabs) ── */}
      <nav className="h-14 bg-[#0A101E] border-t border-slate-800/90 grid grid-cols-5 items-center justify-around flex-shrink-0 z-40 select-none">
        <button
          onClick={() => setActiveTab('nav')}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
            activeTab === 'nav' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <Compass className="h-4 w-4" />
          <span className="text-[10px]">Nav HUD</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
            activeTab === 'telemetry' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <Gauge className="h-4 w-4" />
          <span className="text-[10px]">Telemetry</span>
        </button>

        <button
          onClick={() => setActiveTab('status')}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
            activeTab === 'status' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-[10px]">Status</span>
        </button>

        <button
          onClick={() => setActiveTab('sms')}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
            activeTab === 'sms' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-[10px]">SMS ({smsMessages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('manifest')}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
            activeTab === 'manifest' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          )}
        >
          <FileText className="h-4 w-4" />
          <span className="text-[10px]">Manifest</span>
        </button>
      </nav>

      {/* ── Emergency SOS Trigger Modal with Safety Timer ── */}
      {sosModal && (
        <Modal
          open={sosModal}
          onClose={() => setSosModal(false)}
          title="Emergency Distress Signal (SOS)"
          description="Direct bridge to State Disaster Management & Police"
          size="sm"
        >
          <div className="space-y-4 text-xs text-white">
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-sm">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
                Broadcast Emergency Beacon
              </div>
              <p className="text-[11px] leading-relaxed">
                Will transmit your live GPS coordinates, vehicle registration, and emergency beacon to State Police (112) and Command Center.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {sosCountdown !== null ? (
                <Button
                  onClick={() => setSosCountdown(null)}
                  variant="destructive"
                  className="w-full font-bold h-11 animate-pulse"
                >
                  Cancel Countdown ({sosCountdown}s)
                </Button>
              ) : (
                <Button
                  onClick={() => setSosCountdown(3)}
                  variant="destructive"
                  className="w-full font-bold h-11 bg-rose-600 hover:bg-rose-500"
                >
                  Confirm SOS (3s Countdown)
                </Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
