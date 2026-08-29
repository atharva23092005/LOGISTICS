import { useState, useCallback, useMemo } from 'react'
import {
  Building2, ShieldAlert, CheckCircle2, AlertTriangle, MapPin,
  Clock, Check, X, Camera, RefreshCw, Send, Radio,
  Droplets, CloudRain, Mountain, ChevronRight, Phone, Eye,
  Layers, Compass, ExternalLink, ShieldCheck, Flame
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { Modal } from '@/components/ui/modal'
import { MapEngine } from '@/modules/map/MapEngine'
import { useAppStore } from '@/stores/appStore'
import { useAlertStore } from '@/stores/alertStore'
import { useRouteStore } from '@/stores/routeStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useEventBus } from '@/stores/eventBus'
import { mockDistricts } from '@/mock/districts'
import { mockWeather } from '@/mock/weather'
import { timeAgo } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { LogisticsAlert } from '@/types'

interface DistrictReport {
  id: string
  title: string
  highway: string
  location: string
  reportedBy: string
  reportedAt: string
  severity: 'critical' | 'warning' | 'info'
  status: 'pending' | 'verified' | 'resolved'
  passability: 'blocked' | 'single_lane' | 'caution'
  clearanceEta: string
  photos: string[]
  coords: { lat: number; lng: number }
  description: string
}

const INITIAL_DISTRICT_REPORTS: DistrictReport[] = [
  {
    id: 'dr-1',
    title: 'Landslide Debris Blockage at Km 42',
    highway: 'NH-415',
    location: 'NH-415, 45km from Dibrugarh (Jeypore Pass)',
    reportedBy: 'Field Officer Sunil Pegu',
    reportedAt: new Date(Date.now() - 25 * 60000).toISOString(),
    severity: 'critical',
    status: 'pending',
    passability: 'blocked',
    clearanceEta: '2-6h',
    photos: ['Damage_Survey_Km42.jpg', 'Debris_Profile.jpg'],
    coords: { lat: 27.7000, lng: 95.0500 },
    description: 'Approx 200m roadway buried under mudslide and rock slurry. 3 freight vehicles stranded. NHIDCL heavy excavator requested.',
  },
  {
    id: 'dr-2',
    title: 'Bridge Expansion Joint Crack — SH-15',
    highway: 'SH-15',
    location: 'SH-15 Approach Bridge, Pasighat Sector',
    reportedBy: 'Field Officer Rani Borah',
    reportedAt: new Date(Date.now() - 65 * 60000).toISOString(),
    severity: 'warning',
    status: 'pending',
    passability: 'single_lane',
    clearanceEta: '12-24h',
    photos: ['Bridge_Joint_Crack.jpg'],
    coords: { lat: 26.9000, lng: 93.9000 },
    description: '3m surface crack on eastern expansion joint. Single-lane alternate traffic advised. Multi-axle >25T restricted.',
  },
  {
    id: 'dr-3',
    title: 'Lowland Culvert Waterlogging',
    highway: 'NH-415',
    location: 'Pasighat Outskirts (Km 12)',
    reportedBy: 'Field Officer Karma Singh',
    reportedAt: new Date(Date.now() - 140 * 60000).toISOString(),
    severity: 'warning',
    status: 'verified',
    passability: 'caution',
    clearanceEta: '1-2h',
    photos: ['Culvert_Overflow.jpg'],
    coords: { lat: 27.5000, lng: 94.9500 },
    description: 'Water depth 20cm above road deck. High-clearance relief convoys passable.',
  },
]

export function DistrictAdminDashboard() {
  const user = useAppStore(s => s.user)
  const allAlerts = useAlertStore(s => s.alerts)
  const addAlert = useAlertStore(s => s.addAlert)
  const updateRoadStatus = useRouteStore(s => s.updateRoadStatus)
  const emit = useEventBus(s => s.emit)
  const activateEmergency = useAppStore(s => s.activateEmergency)

  const [selectedDistrict, setSelectedDistrict] = useState('East Siang')
  const [reports, setReports] = useState<DistrictReport[]>(INITIAL_DISTRICT_REPORTS)
  const [selectedReport, setSelectedReport] = useState<DistrictReport | null>(null)
  const [inspectModal, setInspectModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'queue' | 'patrols' | 'weather' | 'escalations'>('queue')
  const [escalateModal, setEscalateModal] = useState(false)

  const pendingReports = useMemo(() => reports.filter(r => r.status === 'pending'), [reports])
  const verifiedReports = useMemo(() => reports.filter(r => r.status === 'verified'), [reports])

  const districtWeather = useMemo(() => {
    return mockWeather.find(w => w.district === selectedDistrict) ?? mockWeather[1]
  }, [selectedDistrict])

  // Handle Verify Incident (Marks Road Blocked & Notifies HQ)
  const handleVerifyReport = useCallback((report: DistrictReport) => {
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'verified' } : r))
    
    // Update road state in routeStore
    updateRoadStatus('nh415-seg1', 'blocked', 92)

    // Emit event across platform & add official alert
    emit('ROAD_BLOCKED', {
      roadId: 'nh415-seg1',
      roadName: report.highway,
      affectedVehicles: ['v4', 'v6', 'v9'],
    })

    toast.success(`Verified: ${report.title}`, {
      description: 'Official blockage recorded. Alert broadcasted to State HQ & Driver HUDs.',
      duration: 6000,
    })
    setInspectModal(false)
  }, [updateRoadStatus, emit])

  // Handle Resolve Incident
  const handleResolveReport = useCallback((report: DistrictReport) => {
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, status: 'resolved' } : r))
    updateRoadStatus('nh415-seg1', 'open', 15)
    toast.success(`Resolved: ${report.highway} cleared`, {
      description: 'Corridor marked open for normal transit.',
    })
    setInspectModal(false)
  }, [updateRoadStatus])

  // State Emergency Escalation
  const handleEscalateToState = useCallback(() => {
    activateEmergency(`District Admin Escalation: Critical Landslide Blockade on NH-415 in ${selectedDistrict}`)
    emit('EMERGENCY_ACTIVATED', { reason: `Major infrastructure disruption in ${selectedDistrict}` })
    toast.error(`🚨 Escalated to State Emergency Control (SEOC)`, {
      description: 'NDRF Base Station and State Road Authority notified for emergency deployment.',
      duration: 8000,
    })
    setEscalateModal(false)
  }, [activateEmergency, emit, selectedDistrict])

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#070B14] text-white">
      {/* ── Top District Admin Header ── */}
      <header className="px-4 py-3 bg-[#0B1120] border-b border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              District Administration Portal
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 font-semibold uppercase">
                {selectedDistrict} Sector
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Admin: <span className="text-slate-200">{user?.name ?? 'Tsering Norbu (District Magistrate/Supervisor)'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* District Switcher */}
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {mockDistricts.map(d => (
              <option key={d.id} value={d.name}>{d.name} ({d.state})</option>
            ))}
          </select>

          {/* State Escalation Trigger */}
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setEscalateModal(true)}
            className="gap-1.5 text-xs font-bold shadow-lg shadow-rose-950/40"
          >
            <Flame className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Escalate to State HQ</span>
          </Button>
        </div>
      </header>

      {/* ── District Overview Strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-950/60 border-b border-slate-800/80 flex-shrink-0">
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Pending Verifications</div>
          <div className="text-xl font-bold text-amber-400 mt-0.5 font-mono flex items-center gap-2">
            {pendingReports.length}
            {pendingReports.length > 0 && <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
          </div>
          <div className="text-[10px] text-slate-500">Requires local admin action</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Verified Active Blockages</div>
          <div className="text-xl font-bold text-rose-400 mt-0.5 font-mono">
            {verifiedReports.length}
          </div>
          <div className="text-[10px] text-slate-500">NH-415 Km 42 Landslide</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">District Rainfall Gauge</div>
          <div className="text-xl font-bold text-blue-400 mt-0.5 font-mono flex items-center gap-1.5">
            <CloudRain className="h-4 w-4 text-blue-400" />
            {districtWeather.rainfall} mm/h
          </div>
          <div className="text-[10px] text-rose-400">Landslide Risk: {districtWeather.landslideRisk}%</div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium">Active Patrol Units</div>
          <div className="text-xl font-bold text-emerald-400 mt-0.5 font-mono flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            4 Officers
          </div>
          <div className="text-[10px] text-slate-500">8 checkpoints inspected</div>
        </div>
      </div>

      {/* ── Main Work Area (Split Pane: Queue + Map) ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Role-Specific Task Panels (5 Cols) */}
        <div className="lg:col-span-5 border-r border-slate-800 flex flex-col overflow-hidden bg-[#0A0F1D]">
          {/* Sub Navigation Tabs */}
          <div className="p-2 border-b border-slate-800 bg-slate-950/40 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('queue')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeTab === 'queue'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              )}
            >
              Incident Queue ({pendingReports.length})
            </button>

            <button
              onClick={() => setActiveTab('patrols')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeTab === 'patrols'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              )}
            >
              Patrols & Checkpoints
            </button>

            <button
              onClick={() => setActiveTab('weather')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                activeTab === 'weather'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              )}
            >
              Soil & Weather
            </button>
          </div>

          {/* Tab Content 1: Ground Verification Queue */}
          {activeTab === 'queue' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Field Reports Awaiting District Admin Action</span>
                <span className="text-[11px] text-amber-400 font-mono">{pendingReports.length} Pending</span>
              </div>

              {reports.map(report => (
                <div
                  key={report.id}
                  className={cn(
                    'p-3.5 rounded-xl border transition-all space-y-2.5 bg-slate-900/60',
                    report.status === 'pending'
                      ? 'border-amber-500/40 hover:border-amber-500/70 bg-amber-950/10'
                      : report.status === 'verified'
                      ? 'border-rose-500/40 bg-rose-950/10'
                      : 'border-slate-800 opacity-75'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-white">{report.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-500" />
                        {report.location}
                      </div>
                    </div>

                    <Badge
                      variant={report.status === 'pending' ? 'warning' : report.status === 'verified' ? 'danger' : 'success'}
                      className="capitalize text-[10px]"
                    >
                      {report.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    {report.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>By: <strong className="text-slate-200">{report.reportedBy}</strong></span>
                    <span>{timeAgo(report.reportedAt)}</span>
                  </div>

                  {/* Admin Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => { setSelectedReport(report); setInspectModal(true) }}
                      className="flex-1 text-xs gap-1 h-8"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Inspect Ground Evidence
                    </Button>

                    {report.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleVerifyReport(report)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1 h-8"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Verify
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content 2: Patrols & Checkpoints */}
          {activeTab === 'patrols' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              <div className="text-xs font-semibold text-slate-400">
                Active District Checkpoints & Patrol Units
              </div>

              {[
                { name: 'Pasighat Brahmaputra Span Bridge', highway: 'NH-415', status: 'Operational', inspector: 'Officer Sunil Pegu', last: '20 mins ago' },
                { name: 'Km 42 Slope Stabilization Point', highway: 'NH-415', status: 'Blocked (Mudslide)', inspector: 'Officer Sunil Pegu', last: '25 mins ago' },
                { name: 'SH-15 North Bank Approach Span', highway: 'SH-15', status: 'Caution (Joint Crack)', inspector: 'Officer Rani Borah', last: '1 hour ago' },
                { name: 'Ruksin Border Sector Post #2', highway: 'NH-415', status: 'Operational', inspector: 'Officer Sunil Pegu', last: '2 hours ago' },
              ].map(cp => (
                <div key={cp.name} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-white">{cp.name}</strong>
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded',
                      cp.status.includes('Blocked') ? 'bg-rose-500/20 text-rose-400' : cp.status.includes('Caution') ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                    )}>
                      {cp.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Highway: {cp.highway}</span>
                    <span>Inspector: {cp.inspector}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab Content 3: Soil & Weather Gauges */}
          {activeTab === 'weather' && (
            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-3">
                <div className="font-bold text-sm text-blue-300 flex items-center gap-2">
                  <CloudRain className="h-4 w-4" />
                  {selectedDistrict} Meteorological Radar
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Rainfall: <strong>{districtWeather.rainfall} mm/h</strong></div>
                  <div>Humidity: <strong>{districtWeather.humidity}%</strong></div>
                  <div>Temperature: <strong>{districtWeather.temperature}°C</strong></div>
                  <div>Soil Saturation: <strong className="text-rose-400">88% (Critical)</strong></div>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-[11px]">
                  ⚠️ <strong>Threshold Warning:</strong> Precipitation exceeding 50mm/hr combined with steep slope gradient (24.5°) triggers automated landslide risk score of 0.87.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive District Map Engine (7 Cols) */}
        <div className="lg:col-span-7 h-full relative">
          <MapEngine className="w-full h-full" />
        </div>
      </div>

      {/* ── Inspection Detail Modal ── */}
      {inspectModal && selectedReport && (
        <Modal
          open={inspectModal}
          onClose={() => setInspectModal(false)}
          title={`Ground Incident Verification: ${selectedReport.title}`}
          description={`Reported by ${selectedReport.reportedBy} • ${timeAgo(selectedReport.reportedAt)}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Highway: <strong className="text-white">{selectedReport.highway}</strong></span>
                <span className="text-slate-400">Clearance ETA: <strong className="text-amber-400">{selectedReport.clearanceEta}</strong></span>
              </div>
              <div className="text-slate-400">Location: <span className="text-white">{selectedReport.location}</span></div>
              <div className="text-slate-400">GPS: <span className="font-mono text-blue-400">{selectedReport.coords.lat}°N, {selectedReport.coords.lng}°E</span></div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">Damage & Survey Description:</label>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200">
                {selectedReport.description}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-300 block mb-1.5">Attached Ground Damage Photos ({selectedReport.photos.length}):</label>
              <div className="grid grid-cols-2 gap-2">
                {selectedReport.photos.map(p => (
                  <div key={p} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-slate-300">
                    <Camera className="h-4 w-4 text-blue-400" />
                    <span className="truncate text-xs">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <Button
                onClick={() => handleVerifyReport(selectedReport)}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                <Check className="h-4 w-4 mr-1" />
                Confirm & Mark Road BLOCKED
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleResolveReport(selectedReport)}
                className="flex-1"
              >
                Mark Cleared / Open
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── State Escalation Modal ── */}
      {escalateModal && (
        <Modal
          open={escalateModal}
          onClose={() => setEscalateModal(false)}
          title="State Disaster Management (SEOC) Escalation"
          description={`Direct emergency escalation for ${selectedDistrict} Sector`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-rose-400" />
                State Level Emergency Protocol Activation
              </div>
              <p className="text-[11px] leading-relaxed">
                This will escalate all road disruptions in {selectedDistrict} to State Emergency Operations (SEOC), activate regional safe corridors, and dispatch heavy recovery excavators.
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-slate-300">Reason for Escalation:</label>
              <textarea
                defaultValue={`Multiple critical slope failures and heavy debris along NH-415 connecting to Pasighat. 3 freight relief convoys stranded.`}
                className="w-full h-20 p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="destructive"
                onClick={handleEscalateToState}
                className="w-full font-bold"
              >
                Confirm State Escalation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
