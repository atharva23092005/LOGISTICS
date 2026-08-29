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
  ShieldCheck, ArrowDownRight, CornerUpRight, KeyRound,
  FileCheck2, ShieldBan, PhoneCall, AlertCircle, Plus,
  LogOut, User, CheckSquare, Square, ShieldQuestion,
  Wrench, ArrowLeft, QrCode, Maximize2, CheckCheck, Lock
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { MapEngine } from '@/modules/map/MapEngine'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useAppStore } from '@/stores/appStore'
import { useEventBus } from '@/stores/eventBus'
import { cn } from '@/utils/cn'
import type { User as UserType } from '@/types'

export function DriverPage() {
  const user = useAppStore(s => s.user)
  const login = useAppStore(s => s.login)
  const networkOnline = useAppStore(s => s.networkOnline)
  const vehicles = useVehicleStore(s => s.vehicles)
  const updateVehicle = useVehicleStore(s => s.updateVehicle)
  const emit = useEventBus(s => s.emit)

  // Dedicated In-App Cockpit Terminal Auth
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // In-Cab Login form state
  const [driverPhone, setDriverPhone] = useState('9862145890')
  const [driverLicense, setDriverLicense] = useState('DL-01-2018-0091234')
  const [selectedVehicleId, setSelectedVehicleId] = useState('v4')
  const [loginLoading, setLoginLoading] = useState(false)

  // Pre-trip safety checklist state
  const [checklist, setChecklist] = useState({
    fuelOk: true,
    brakesOk: true,
    cargoSealsOk: true,
    offlineMapsOk: true,
  })

  // Driver assigned convoy
  const vehicle = vehicles.find(v => v.id === selectedVehicleId) ?? vehicles[0]

  // In-Cab Navigation Tabs
  const [activeTab, setActiveTab] = useState<'nav' | 'manifest' | 'pod' | 'sms' | 'telemetry'>('nav')
  const [driverStatus, setDriverStatus] = useState<'picked_up' | 'on_route' | 'delayed' | 'delivered'>('on_route')
  const [rerouteAlert, setRerouteAlert] = useState(true)
  const [activeRouteName, setActiveRouteName] = useState('Route C — SH-15 Safe Bypass')
  const [speed, setSpeed] = useState(44)
  const [fuel, setFuel] = useState(74)
  const [voiceGuidance, setVoiceGuidance] = useState(true)
  const [sosCountdown, setSosCountdown] = useState<number | null>(null)
  const [sosModal, setSosModal] = useState(false)
  const [podModal, setPodModal] = useState(false)
  const [qrModal, setQrModal] = useState(false)
  const [podOtp, setPodOtp] = useState('')
  const [isDelivered, setIsDelivered] = useState(false)

  // Turn-by-turn instruction
  const [nextManeuver, setNextManeuver] = useState({
    distance: '1.4 km',
    instruction: 'Bear Left onto SH-15 North Bank Safe Corridor',
    subText: 'Avoids NH-415 Km 42 landslide zone • Slope 3.2° Safe',
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

  // Handle In-Cab Driver Sign-In
  const handleDriverLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!checklist.fuelOk || !checklist.brakesOk || !checklist.cargoSealsOk || !checklist.offlineMapsOk) {
      toast.error('Pre-Trip Safety Incomplete', {
        description: 'Please verify all 4 vehicle readiness checks before starting shift.',
      })
      return
    }

    setLoginLoading(true)
    await new Promise(r => setTimeout(r, 600))

    const driverUser: UserType = {
      id: 'u5',
      name: 'Tashi Namgyal',
      email: 'driver@ner-logistics.in',
      role: 'driver',
      district: 'East Siang',
      assignedVehicleId: selectedVehicleId,
    }

    login(driverUser)
    setIsAuthenticated(true)
    setLoginLoading(false)
    toast.success(`Shift Started: ${driverUser.name}`, {
      description: `Assigned Convoy: ${vehicle.registrationNo} • ${vehicle.cargo}`,
    })
  }

  const handleDriverLogout = () => {
    setIsAuthenticated(false)
    toast.info('Driver Shift Concluded', {
      description: 'In-cab terminal locked. Telemetry saved.',
    })
  }

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
      toast.error('SOS DISTRESS BEACON BROADCASTED', {
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
    setActiveRouteName('Route C — SH-15 Safe Bypass (Active)')
    emit('VEHICLE_REROUTED', { vehicleId: vehicle.id, newRouteId: 'route-3' })
    if (voiceGuidance) {
      toast.info('Voice Guidance: Safe bypass locked. Proceed along SH-15 corridor.', { duration: 4000 })
    }
    toast.success('Safe Bypass Corridor Locked', {
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
    toast.info('SMS Notification Received on In-Cab Terminal', {
      description: newSms.text,
      duration: 6000,
    })
  }

  const handleConfirmPod = () => {
    if (podOtp.trim() !== '8842' && podOtp.trim() !== '1234') {
      toast.error('Invalid Delivery Handover OTP', { description: 'Please ask consignee for the 4-digit code (e.g. 8842).' })
      return
    }
    setIsDelivered(true)
    setPodModal(false)
    handleStatusChange('delivered')
    toast.success('Proof of Delivery (POD) Confirmed!', {
      description: 'Digital consignment receipt generated & signed by Dr. P. Baruah.',
    })
  }

  // Proportioned, compact mobile app width (max-w-[420px]) perfectly centered in the web view
  return (
    <div className="min-h-dvh w-full bg-[#03060E] flex flex-col items-center justify-center p-0 sm:p-4 overflow-x-hidden">
      
      {/* Centered mobile-app proportion container */}
      <div className="w-full max-w-[420px] h-dvh sm:h-[840px] sm:max-h-[92vh] bg-background text-text font-sans flex flex-col sm:rounded-2xl sm:border border-border/80 shadow-2xl overflow-hidden relative select-none">
        
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {/* VIEW A: IN-CAB TRANSPORTER SIGN-IN & PRE-TRIP CHECKLIST (NOT AUTHENTICATED) */}
        {/* ══════════════════════════════════════════════════════════════════════ */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#070C16]">
            {/* Cockpit Status Bar */}
            <div className="h-7 bg-[#04070D] px-4 flex items-center justify-between text-[11px] font-mono text-text-muted border-b border-border/40 flex-shrink-0 z-40">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text">09:41</span>
                <span className="text-text-dim">•</span>
                <span className="text-success font-bold">CAB-TR-04</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-text">
                  <Signal className="h-3 w-3 text-success" />
                  <span className="text-2xs font-sans">4G LTE</span>
                </span>
                <span className="flex items-center gap-1 text-text-bright">
                  <Battery className="h-3.5 w-3.5 text-success" />
                  <span>86%</span>
                </span>
              </div>
            </div>

            {/* In-Cab Terminal Header */}
            <div className="px-4 py-2.5 bg-surface border-b border-border/80 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Link to="/login" className="p-1 rounded-lg hover:bg-surface-2 text-text-muted hover:text-text">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <span className="font-bold text-xs text-text">NER Convoy Dispatch</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 font-bold">
                IN-CAB HUD
              </span>
            </div>

            {/* Centered In-Cab Sign-In Card */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto flex flex-col justify-center space-y-3.5 hide-scrollbar my-auto">
              {/* Branding */}
              <div className="text-center space-y-1.5 pt-1">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-primary/15 border-2 border-primary/40 flex items-center justify-center text-primary shadow-lg shadow-primary/20 animate-pulse">
                  <Truck className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text tracking-tight">Transporter Terminal Sign-In</h2>
                  <p className="text-2xs text-text-muted">In-Cab Telemetry, Safety & Mid-Trip Navigation</p>
                </div>
              </div>

              {/* In-Cab Driver Form */}
              <form onSubmit={handleDriverLogin} className="space-y-3 surface-elevated p-3.5 rounded-2xl border border-border shadow-xl">
                <div className="space-y-1">
                  <label className="text-2xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-3 w-3 text-primary" />
                    Driver Phone / License No
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. 9862145890"
                    value={driverPhone}
                    onChange={e => setDriverPhone(e.target.value)}
                    className="bg-surface-2 border-border text-xs h-9 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="h-3 w-3 text-primary" />
                    Assigned Convoy / Vehicle
                  </label>
                  <select
                    value={selectedVehicleId}
                    onChange={e => setSelectedVehicleId(e.target.value)}
                    className="w-full bg-surface-2 border border-border text-xs text-text rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-primary font-mono"
                  >
                    <option value="v4">AR-01-GH-2345 (Medical Supplies • Emergency)</option>
                    <option value="v1">AS-01-AB-1234 (Vaccines & Cold Chain • High)</option>
                    <option value="v3">AS-09-CD-5678 (Drinking Water Tanker • 12KL)</option>
                  </select>
                </div>

                {/* Mandatory Pre-Trip Safety Checklist */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="text-2xs font-bold text-text-muted uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-success" />
                      Pre-Trip Safety & Readiness Checklist
                    </span>
                    <span className="text-[9px] text-success font-mono font-bold">4/4 REQUIRED</span>
                  </div>

                  <div className="space-y-1 bg-surface-2/70 p-2 rounded-xl border border-border/50 text-2xs text-text-muted">
                    {[
                      { key: 'fuelOk', label: 'Fuel Level Verified (>70%)' },
                      { key: 'brakesOk', label: 'Brakes & Tyre Pressure OK (34 PSI)' },
                      { key: 'cargoSealsOk', label: 'Cargo E-Waybill & Security Seal Verified' },
                      { key: 'offlineMapsOk', label: 'Mountain Pass Offline Vector Pack Loaded' },
                    ].map(item => {
                      const isChecked = checklist[item.key as keyof typeof checklist]
                      return (
                        <label key={item.key} className="flex items-center gap-2 cursor-pointer select-none py-0.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => setChecklist(c => ({ ...c, [item.key]: !c[item.key as keyof typeof checklist] }))}
                            className="rounded text-success focus:ring-success h-3.5 w-3.5"
                          />
                          <span className={isChecked ? 'text-text font-medium text-[11px]' : 'text-text-muted text-[11px]'}>
                            {item.label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <Navigation className="h-4 w-4" />
                  <span>{loginLoading ? 'Locking Shift Telemetry...' : 'Start Shift & Launch HUD'}</span>
                </Button>
              </form>

              {/* Quick 1-Tap Demo Driver Shortcut */}
              <div className="space-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDriverPhone('9862145890')
                    setSelectedVehicleId('v4')
                    setChecklist({ fuelOk: true, brakesOk: true, cargoSealsOk: true, offlineMapsOk: true })
                    handleDriverLogin()
                  }}
                  className="w-full p-2 rounded-xl border border-success/30 bg-success/10 hover:bg-success/20 text-success text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Zap className="h-4 w-4" />
                  <span>Quick 1-Tap Driver Start (Tashi Namgyal)</span>
                </button>

                <div className="text-center">
                  <Link to="/login" className="text-2xs text-text-muted hover:text-text underline">
                    Return to Central Command Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════════════════════ */
          /* VIEW B: MAIN IN-CAB DRIVER COCKPIT HUD APP (WHEN AUTHENTICATED)       */
          /* ══════════════════════════════════════════════════════════════════════ */
          <div className="flex-1 flex flex-col justify-between overflow-hidden relative">
            {/* ── Status Bar ── */}
            <div className="h-7 bg-[#04070D] px-3.5 flex items-center justify-between text-[11px] font-mono text-text-muted border-b border-border/40 flex-shrink-0 z-40">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text">09:41</span>
                <span className="text-text-dim">•</span>
                <span className="text-success font-bold">COCKPIT HUD v2.5</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-text">
                  <Signal className="h-3 w-3 text-success" />
                  <span className="text-2xs font-sans">4G LTE</span>
                </span>
                <span className="flex items-center gap-1 text-text-bright">
                  <Battery className="h-3.5 w-3.5 text-success" />
                  <span>86%</span>
                </span>
              </div>
            </div>

            {/* ── In-Cab Top App Bar (Header with End Shift / Exit Button) ── */}
            <header className="px-3.5 py-2.5 bg-surface border-b border-border/80 flex items-center justify-between gap-2 flex-shrink-0 z-30 shadow-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary font-bold shadow-inner flex-shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs sm:text-sm text-text tracking-tight truncate">
                      {vehicle.registrationNo}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-danger/20 text-danger border border-danger/30 font-bold uppercase tracking-wider font-mono">
                      {vehicle.priority}
                    </span>
                  </div>
                  <div className="text-[10px] text-text-muted truncate">
                    {vehicle.driver} • <span className="text-text">{vehicle.origin} → {vehicle.destination}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* View QR Transit Pass */}
                <button
                  onClick={() => setQrModal(true)}
                  className="h-8 px-2 rounded-lg flex items-center justify-center gap-1 border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 transition-colors font-bold text-[10px]"
                  title="Show QR Transit Pass"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Pass</span>
                </button>

                {/* Voice Guidance Toggle */}
                <button
                  onClick={() => {
                    setVoiceGuidance(v => !v)
                    toast.info(voiceGuidance ? 'Voice guidance muted' : 'Voice guidance active')
                  }}
                  className="h-8 w-8 rounded-lg flex items-center justify-center border border-border bg-surface-2 hover:bg-surface-3 text-text transition-colors"
                  title="Toggle Voice Guidance"
                >
                  {voiceGuidance ? <Volume2 className="h-4 w-4 text-success" /> : <VolumeX className="h-4 w-4 text-text-muted" />}
                </button>

                {/* Emergency SOS Panic Button */}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setSosModal(true)}
                  className="h-8 px-2 text-2xs font-bold bg-danger hover:bg-danger/90 gap-1 rounded-lg shadow-md"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>SOS</span>
                </Button>

                {/* End Shift / Exit Button */}
                <button
                  onClick={handleDriverLogout}
                  className="h-8 w-8 rounded-lg flex items-center justify-center border border-border bg-surface-2 hover:bg-danger/15 hover:text-danger text-text-muted transition-colors"
                  title="End Driver Shift / Lock Terminal"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </header>

            {/* ── Main Tab Content ── */}
            <main className="flex-1 overflow-hidden relative">
              
              {/* ── TAB 1: NAVIGATION HUD (FULL-SCREEN MAP + TACTICAL OVERLAYS) ── */}
              {activeTab === 'nav' && (
                <div className="w-full h-full relative flex flex-col">
                  
                  {/* 1. Floating Big Turn-by-Turn Card at Top */}
                  <div className="absolute top-2.5 inset-x-2.5 z-20 animate-slide-down">
                    <Card className="surface-elevated border border-border shadow-2xl overflow-hidden text-text rounded-2xl">
                      <div className="p-2.5 flex items-start gap-2.5">
                        <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-primary/30">
                          <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
                        </div>

                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-success uppercase tracking-wide">
                              In {nextManeuver.distance}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-muted font-mono">
                              Limit {nextManeuver.speedLimit} km/h
                            </span>
                          </div>

                          <h3 className="font-bold text-xs sm:text-sm text-text tracking-tight leading-snug truncate">
                            {nextManeuver.instruction}
                          </h3>

                          <p className="text-[10px] text-text-muted truncate">
                            {nextManeuver.subText}
                          </p>
                        </div>
                      </div>

                      <div className="bg-[#050912] px-3 py-1 border-t border-border/60 flex items-center justify-between text-[10px] text-text-muted font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="status-dot status-dot-green" />
                          SH-15 Bypass
                        </span>
                        <span>Slope: <strong className="text-text">3.2° (Safe)</strong> • Alt: <strong className="text-primary">840m</strong></span>
                      </div>
                    </Card>
                  </div>

                  {/* 2. Floating Landslide Proximity Radar Alert */}
                  {rerouteAlert && (
                    <div className="absolute top-28 inset-x-2.5 z-20 animate-slide-up">
                      <Card className="bg-danger/10 border-2 border-danger/60 shadow-2xl backdrop-blur-xl text-text overflow-hidden p-2.5 space-y-2 rounded-2xl">
                        <div className="flex items-start gap-2">
                          <div className="h-7 w-7 rounded-xl bg-danger/20 border border-danger/40 flex items-center justify-center text-danger flex-shrink-0 animate-pulse">
                            <AlertOctagon className="h-4 w-4" />
                          </div>

                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-danger uppercase tracking-wider flex items-center gap-1 font-mono">
                                <AlertTriangle className="h-3 w-3 inline" />
                                PROXIMITY HAZARD
                              </span>
                              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-danger/30 text-danger border border-danger/40">
                                SCENARIO B
                              </span>
                            </div>
                            <p className="text-xs font-bold text-text leading-snug truncate">
                              NH-415 Landslide Blockade Ahead (Km 42)
                            </p>
                            <p className="text-[10px] text-text-muted leading-tight">
                              AI Recommended Bypass via <strong>SH-15 Safe Corridor</strong> (+35m safe transit).
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-0.5 border-t border-danger/20">
                          <Button
                            onClick={handleAcceptReroute}
                            size="sm"
                            className="flex-1 h-6.5 text-[10px] font-bold bg-danger hover:bg-danger/90 text-white gap-1 rounded-lg"
                          >
                            <Navigation className="h-3 w-3" /> Accept Safe Bypass
                          </Button>
                          <Button
                            onClick={() => setRerouteAlert(false)}
                            size="sm"
                            variant="ghost"
                            className="h-6.5 px-2 text-[10px] text-text-muted hover:text-text"
                          >
                            Dismiss
                          </Button>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* 3. Background MapEngine */}
                  <div className="flex-1 w-full h-full">
                    <MapEngine layers={['roads', 'vehicles', 'alerts']} />
                  </div>

                  {/* 4. Bottom Cockpit Telemetry HUD */}
                  <div className="absolute bottom-2 inset-x-2.5 z-20 space-y-1.5">
                    {/* Telemetry Strip */}
                    <div className="glass-panel p-2 rounded-2xl border border-border shadow-2xl grid grid-cols-4 gap-1.5 text-center text-text">
                      <div className="bg-surface-2/80 p-1.5 rounded-xl border border-border/40">
                        <div className="text-[9px] text-text-muted flex items-center justify-center gap-0.5">
                          <Gauge className="h-2.5 w-2.5 text-primary" /> Speed
                        </div>
                        <div className="font-mono font-black text-sm text-text mt-0.5">
                          {speed} <span className="text-[8px] font-normal text-text-dim">km/h</span>
                        </div>
                      </div>

                      <div className="bg-surface-2/80 p-1.5 rounded-xl border border-border/40">
                        <div className="text-[9px] text-text-muted flex items-center justify-center gap-0.5">
                          <Fuel className="h-2.5 w-2.5 text-warning" /> Fuel
                        </div>
                        <div className="font-mono font-black text-sm text-text mt-0.5">
                          {fuel}%
                        </div>
                      </div>

                      <div className="bg-surface-2/80 p-1.5 rounded-xl border border-border/40">
                        <div className="text-[9px] text-text-muted flex items-center justify-center gap-0.5">
                          <Clock className="h-2.5 w-2.5 text-success" /> ETA
                        </div>
                        <div className="font-mono font-bold text-xs text-text mt-0.5">
                          2h 32m
                        </div>
                      </div>

                      <div className="bg-surface-2/80 p-1.5 rounded-xl border border-border/40">
                        <div className="text-[9px] text-text-muted flex items-center justify-center gap-0.5">
                          <Navigation className="h-2.5 w-2.5 text-info" /> Dist
                        </div>
                        <div className="font-mono font-bold text-xs text-text mt-0.5">
                          142 km
                        </div>
                      </div>
                    </div>

                    {/* Driver Journey Status Quick Selector */}
                    <div className="glass-panel p-1.5 rounded-2xl border border-border shadow-xl flex items-center justify-between gap-1 text-[9px]">
                      {[
                        { id: 'picked_up', label: '1. Loaded', icon: Truck },
                        { id: 'on_route', label: '2. En Route', icon: Navigation },
                        { id: 'delayed', label: '3. Delayed', icon: AlertTriangle },
                        { id: 'delivered', label: '4. Delivered', icon: CheckCircle2 },
                      ].map(s => {
                        const isCur = driverStatus === s.id
                        return (
                          <button
                            key={s.id}
                            onClick={() => handleStatusChange(s.id as any)}
                            className={cn(
                              'flex-1 py-1 px-1 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all',
                              isCur
                                ? 'bg-primary text-white shadow-md'
                                : 'bg-surface-2/60 text-text-muted hover:text-text'
                            )}
                          >
                            <s.icon className="h-3 w-3" />
                            <span>{s.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: ROUTE MANIFEST / TURN LIST ── */}
              {activeTab === 'manifest' && (
                <div className="p-3 space-y-2.5 h-full overflow-y-auto pb-20 animate-scale-in">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-bold text-text-muted uppercase tracking-wider">
                      Turn-by-Turn Route Manifest
                    </span>
                    <Badge variant="outline" className="text-[9px] font-mono">
                      {activeRouteName.split('—')[0]}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {[
                      { step: 1, dist: '0.0 km', text: 'Depart Guwahati Relief Depot Gate 2', status: 'completed', time: '07:15 AM' },
                      { step: 2, dist: '38.4 km', text: 'Merge onto NH-27 Eastbound Corridor', status: 'completed', time: '08:00 AM' },
                      { step: 3, dist: '94.2 km', text: 'Cross Tezpur Brahmaputra Bridge (SH-15)', status: 'active', time: '09:20 AM' },
                      { step: 4, dist: '142 km', text: 'Pass Pasighat District Checkpoint #04', status: 'upcoming', time: '11:45 AM' },
                      { step: 5, dist: '186 km', text: 'Arrive at Pasighat General Hospital Hub', status: 'upcoming', time: '01:15 PM' },
                    ].map(m => (
                      <div
                        key={m.step}
                        className={cn(
                          'surface-elevated p-2.5 rounded-2xl border flex items-start gap-2.5 transition-all',
                          m.status === 'active' ? 'border-primary bg-primary/[0.04]' : 'border-border'
                        )}
                      >
                        <div className={cn(
                          'h-6 w-6 rounded-xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0',
                          m.status === 'completed' ? 'bg-success/20 text-success' :
                          m.status === 'active' ? 'bg-primary text-white shadow-md' :
                          'bg-surface-2 text-text-muted'
                        )}>
                          {m.status === 'completed' ? <Check className="h-3.5 w-3.5" /> : m.step}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-text-muted">{m.dist}</span>
                            <span className="text-[10px] font-mono text-text-dim">{m.time}</span>
                          </div>
                          <div className="font-semibold text-xs text-text mt-0.5">{m.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB 3: DIGITAL CONVOY QR TRANSIT PASS & PROOF OF DELIVERY (POD) ── */}
              {activeTab === 'pod' && (
                <div className="p-3 space-y-3 h-full overflow-y-auto pb-20 animate-scale-in">
                  
                  {/* Detailed Digital QR Transit Pass Card */}
                  <div className="surface-elevated p-3.5 rounded-2xl border border-primary/40 space-y-3 bg-gradient-to-b from-primary/[0.06] to-transparent shadow-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                          <QrCode className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-xs text-text">Digital Transit QR Pass</div>
                          <div className="text-[9px] text-text-muted font-mono">NER-PASS-AR01GH2345-MED</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-mono text-success border-success/40 bg-success/10">
                        ECDSA SIGNED
                      </Badge>
                    </div>

                    {/* Stylized QR Code Display */}
                    <div className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-inner cursor-pointer hover:opacity-95 transition-opacity" onClick={() => setQrModal(true)}>
                      <div className="relative p-2 bg-white rounded-xl border border-slate-200">
                        {/* 2D QR Pattern simulation */}
                        <div className="w-36 h-36 bg-[#0B0F19] p-2 rounded-lg grid grid-cols-6 gap-1 relative overflow-hidden">
                          {/* Corner Markers */}
                          <div className="absolute top-2 left-2 w-7 h-7 border-2 border-white rounded-sm flex items-center justify-center">
                            <div className="w-3 h-3 bg-white" />
                          </div>
                          <div className="absolute top-2 right-2 w-7 h-7 border-2 border-white rounded-sm flex items-center justify-center">
                            <div className="w-3 h-3 bg-white" />
                          </div>
                          <div className="absolute bottom-2 left-2 w-7 h-7 border-2 border-white rounded-sm flex items-center justify-center">
                            <div className="w-3 h-3 bg-white" />
                          </div>
                          {/* Center Disaster Logistics Logo */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-9 w-9 rounded-lg bg-red-600 border border-white flex items-center justify-center text-white shadow-md">
                              <Shield className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-800 font-bold mt-1.5 flex items-center gap-1">
                        <Maximize2 className="h-3 w-3" /> Tap to Enlarge for Checkpoint Scanner
                      </span>
                    </div>

                    <div className="text-2xs space-y-1 bg-surface-2 p-2.5 rounded-xl border border-border/40 font-mono">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Vehicle Reg:</span>
                        <strong className="text-text">{vehicle.registrationNo}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Driver ID:</span>
                        <span className="text-text">{vehicle.driver}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Cargo:</span>
                        <span className="text-primary font-semibold truncate max-w-[180px]">{vehicle.cargo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Security Seal:</span>
                        <span className="text-success font-bold">#SEAL-44120-INTACT</span>
                      </div>
                    </div>
                  </div>

                  {/* Consignee POD Handover Card */}
                  <div className="surface-elevated p-3.5 rounded-2xl border border-border space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-xs text-text">Consignee Handover & POD</div>
                        <div className="text-[10px] text-text-muted">Pasighat General Hospital Hub</div>
                      </div>
                      <Badge variant={isDelivered ? 'success' : 'warning'} className="text-[9px] font-mono uppercase">
                        {isDelivered ? 'Delivered' : 'In Transit'}
                      </Badge>
                    </div>

                    <div className="text-2xs space-y-1 bg-surface-2 p-2.5 rounded-xl border border-border/40">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Receiving Officer:</span>
                        <span className="text-text font-medium">Dr. P. Baruah (Chief Medical Supdt)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Consignment OTP:</span>
                        <span className="font-mono font-bold text-warning">8842</span>
                      </div>
                    </div>

                    {!isDelivered ? (
                      <Button
                        onClick={() => setPodModal(true)}
                        className="w-full h-9.5 text-xs font-bold bg-success hover:bg-success/90 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg"
                      >
                        <FileCheck2 className="h-4 w-4" />
                        <span>Verify Handover OTP & Complete POD</span>
                      </Button>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-success/15 border border-success/30 text-success text-2xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                        <span>Waybill signed & closed. Delivery confirmed at HQ.</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB 4: SMS FALLBACK FEED ── */}
              {activeTab === 'sms' && (
                <div className="p-3 space-y-2.5 h-full overflow-y-auto pb-20 animate-scale-in">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-bold text-text-muted uppercase tracking-wider">
                      Cellular Dead-Zone SMS Stream
                    </span>
                    <button
                      onClick={handleSimulateSms}
                      className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Simulate SMS</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {smsMessages.map(sms => (
                      <Card
                        key={sms.id}
                        className={cn(
                          'surface-elevated p-2.5 rounded-2xl border space-y-1 text-text',
                          sms.priority === 'urgent' ? 'border-danger/50 bg-danger/[0.04]' :
                          sms.priority === 'warning' ? 'border-warning/50 bg-warning/[0.04]' :
                          'border-border'
                        )}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-primary flex items-center gap-1">
                            <Radio className="h-3 w-3" />
                            {sms.sender}
                          </span>
                          <span className="text-text-muted font-mono">{sms.time}</span>
                        </div>

                        <p className="text-xs text-text leading-relaxed font-sans">{sms.text}</p>

                        <div className="flex items-center justify-end pt-0.5">
                          <button
                            onClick={() => toast.success('Acknowledgment SMS queued for cellular burst dispatch.')}
                            className="text-[10px] text-primary font-semibold hover:underline"
                          >
                            Reply ACK ➔
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* ── TAB 5: VEHICLE HEALTH & TELEMETRY ── */}
              {activeTab === 'telemetry' && (
                <div className="p-3 space-y-3 h-full overflow-y-auto pb-20 animate-scale-in">
                  <div className="surface-elevated p-3.5 rounded-2xl border border-border space-y-2.5">
                    <div className="font-bold text-xs text-text">In-Cab Vehicle Health Monitor</div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-surface-2 p-2 rounded-xl border border-border space-y-0.5">
                        <div className="text-[10px] text-text-muted flex items-center gap-1">
                          <Thermometer className="h-3 w-3 text-warning" /> Engine Temp
                        </div>
                        <div className="font-mono font-bold text-xs text-text">88°C <span className="text-[9px] font-normal text-success">(OK)</span></div>
                      </div>

                      <div className="bg-surface-2 p-2 rounded-xl border border-border space-y-0.5">
                        <div className="text-[10px] text-text-muted flex items-center gap-1">
                          <Activity className="h-3 w-3 text-info" /> Tyre Pressure
                        </div>
                        <div className="font-mono font-bold text-xs text-text">34 PSI <span className="text-[9px] font-normal text-success">(6/6 OK)</span></div>
                      </div>

                      <div className="bg-surface-2 p-2 rounded-xl border border-border space-y-0.5">
                        <div className="text-[10px] text-text-muted flex items-center gap-1">
                          <Zap className="h-3 w-3 text-warning" /> Alternator
                        </div>
                        <div className="font-mono font-bold text-xs text-text">24.2V <span className="text-[9px] font-normal text-success">(Charge)</span></div>
                      </div>

                      <div className="bg-surface-2 p-2 rounded-xl border border-border space-y-0.5">
                        <div className="text-[10px] text-text-muted flex items-center gap-1">
                          <Clock className="h-3 w-3 text-primary" /> Driving Time
                        </div>
                        <div className="font-mono font-bold text-xs text-text">4h 12m</div>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-info/10 border border-info/20 text-2xs text-text-muted flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-info flex-shrink-0" />
                      <span>Anti-Fatigue Compliance: Mandatory 15m rest break in 48 mins.</span>
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* ── Bottom Navigation Bar ── */}
            <nav className="h-14 bg-surface border-t border-border flex items-center justify-around px-2 z-40 shadow-2xl flex-shrink-0">
              {[
                { id: 'nav', label: 'Nav HUD', icon: Navigation },
                { id: 'manifest', label: 'Turns', icon: CornerUpRight },
                { id: 'pod', label: 'QR Pass', icon: QrCode },
                { id: 'sms', label: 'SMS Feed', icon: MessageSquare, badge: smsMessages.length },
                { id: 'telemetry', label: 'Diagnostics', icon: Gauge },
              ].map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex flex-col items-center justify-center flex-1 h-full py-1 gap-0.5 transition-colors relative',
                      isActive ? 'text-primary font-bold' : 'text-text-muted hover:text-text'
                    )}
                  >
                    <div className="relative">
                      <Icon className={cn('h-4.5 w-4.5', isActive && 'text-primary')} />
                      {tab.badge != null && tab.badge > 0 && (
                        <span className="absolute -top-1.5 -right-2 h-3.5 min-w-[14px] px-1 rounded-full bg-primary text-white font-mono font-bold text-[8px] flex items-center justify-center">
                          {tab.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] leading-none">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        )}
      </div>

      {/* ── Enlarge QR Transit Pass Modal ── */}
      <Modal
        open={qrModal}
        onClose={() => setQrModal(false)}
        title="Official Convoy QR Transit Pass"
        description="Present this token to Checkpoint Gate Officers for 0-second offline clearance"
        size="sm"
      >
        <div className="space-y-3.5 text-center">
          <div className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center shadow-lg">
            <div className="w-48 h-48 bg-[#0B0F19] p-3 rounded-xl relative flex items-center justify-center">
              {/* Corner Markers */}
              <div className="absolute top-3 left-3 w-9 h-9 border-2 border-white rounded-sm flex items-center justify-center">
                <div className="w-4 h-4 bg-white" />
              </div>
              <div className="absolute top-3 right-3 w-9 h-9 border-2 border-white rounded-sm flex items-center justify-center">
                <div className="w-4 h-4 bg-white" />
              </div>
              <div className="absolute bottom-3 left-3 w-9 h-9 border-2 border-white rounded-sm flex items-center justify-center">
                <div className="w-4 h-4 bg-white" />
              </div>
              {/* Center Emblem */}
              <div className="h-12 w-12 rounded-xl bg-red-600 border-2 border-white flex items-center justify-center text-white shadow-xl">
                <Shield className="h-6 w-6" />
              </div>
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 mt-2">
              TOKEN: NER-PASS-AR01GH2345-MED-8842
            </div>
            <div className="text-[10px] text-slate-600 font-sans">
              Cryptographically Signed • Valid for Corridor SH-15
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-2 border border-border text-2xs text-left space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted">Convoy:</span>
              <strong className="text-text">{vehicle.registrationNo}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Payload:</span>
              <span className="text-primary font-semibold">{vehicle.cargo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Clearance Priority:</span>
              <span className="text-danger font-bold uppercase">EMERGENCY RED</span>
            </div>
          </div>

          <Button variant="outline" className="w-full text-xs" onClick={() => setQrModal(false)}>
            Close Pass Viewfinder
          </Button>
        </div>
      </Modal>

      {/* ── Emergency SOS Distress Modal ── */}
      <Modal
        open={sosModal}
        onClose={() => { setSosModal(false); setSosCountdown(null) }}
        title="EMERGENCY DISTRESS BEACON"
        description="Transmits GPS coordinates to NDRF, State Police & Disaster Command"
        size="sm"
      >
        <div className="space-y-3.5 text-center">
          <div className="p-3.5 rounded-2xl bg-danger/15 border-2 border-danger text-danger space-y-1.5">
            <ShieldAlert className="h-9 w-9 mx-auto animate-bounce" />
            <div className="font-bold text-sm text-text">Triggering Convoy SOS Beacon</div>
            {sosCountdown !== null ? (
              <div className="font-mono text-2xl font-black text-danger animate-pulse">
                00:0{sosCountdown}
              </div>
            ) : (
              <p className="text-2xs text-text-muted">
                Press confirm to immediately alert all nearby emergency response teams.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-2xs">
            <a
              href="tel:112"
              className="py-2 px-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text font-bold flex items-center justify-center gap-1"
            >
              <PhoneCall className="h-3.5 w-3.5 text-success" />
              <span>Police 112</span>
            </a>
            <a
              href="tel:1070"
              className="py-2 px-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text font-bold flex items-center justify-center gap-1"
            >
              <PhoneCall className="h-3.5 w-3.5 text-danger" />
              <span>Disaster 1070</span>
            </a>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => { setSosModal(false); setSosCountdown(null) }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 text-xs font-bold"
              onClick={() => setSosCountdown(5)}
            >
              Broadcast Distress
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Proof of Delivery (POD) OTP Modal ── */}
      <Modal
        open={podModal}
        onClose={() => setPodModal(false)}
        title="Verify Proof of Delivery"
        description="Enter the 4-digit recipient verification OTP"
        size="sm"
      >
        <div className="space-y-3.5">
          <div className="p-2.5 rounded-xl bg-surface-2 border border-border space-y-0.5 text-xs">
            <div className="font-bold text-text">Pasighat General Hospital Hub</div>
            <div className="text-[10px] text-text-muted">Recipient: Dr. P. Baruah (Chief Medical Supdt)</div>
          </div>

          <div className="space-y-1">
            <label className="text-2xs font-bold text-text-muted uppercase">Consignee Handover OTP</label>
            <Input
              type="text"
              maxLength={4}
              placeholder="e.g. 8842"
              value={podOtp}
              onChange={e => setPodOtp(e.target.value)}
              className="font-mono text-center text-lg tracking-widest h-10 bg-surface-2 border-border"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 text-xs" onClick={() => setPodModal(false)}>
              Cancel
            </Button>
            <Button variant="default" className="flex-1 text-xs bg-success hover:bg-success/90 text-white font-bold" onClick={handleConfirmPod}>
              <Check className="h-4 w-4" /> Confirm Handover
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
