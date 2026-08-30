import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity, TrendingUp, AlertTriangle, ShieldAlert,
  MapPin, Clock, ArrowRight, Download, Cpu, RefreshCw,
  Truck, CheckCircle2, ChevronRight, Sparkles, Filter,
  RotateCcw, HeartPulse, Fuel, Gauge, Phone, LayoutGrid,
  Table as TableIcon, Mountain, CloudRain, Droplets,
  Route as RouteIcon, Compass, ShieldCheck
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts'
import { toast } from 'sonner'
import { Badge }  from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs }   from '@/components/ui/tabs'
import { useAppStore }     from '@/stores/appStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useAlertStore }   from '@/stores/alertStore'
import { useRouteStore }   from '@/stores/routeStore'
import { ElevationProfile } from '@/modules/routing/ElevationProfile'
import { mockKPIHistory, mockDistrictPerformance, mockBottlenecks } from '@/mock/analytics'
import { cn } from '@/utils/cn'

// Module-level selectors
const selUser        = (s: ReturnType<typeof useAppStore.getState>) => s.user
const selVehicles    = (s: ReturnType<typeof useVehicleStore.getState>) => s.vehicles
const selAlerts      = (s: ReturnType<typeof useAlertStore.getState>) => s.alerts
const selRouteOptions = (s: ReturnType<typeof useRouteStore.getState>) => s.routeOptions
const selSelectedRouteId = (s: ReturnType<typeof useRouteStore.getState>) => s.selectedRouteId
const selSelectRoute = (s: ReturnType<typeof useRouteStore.getState>) => s.selectRoute

const CHART_STYLE = {
  backgroundColor: '#0D1626',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#E2E8F0',
  fontSize: '11px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
}

const C = {
  primary:  '#3B82F6',
  success:  '#10B981',
  warning:  '#F59E0B',
  danger:   '#EF4444',
  info:     '#06B6D4',
  muted:    '#1F3352',
  text:     '#94A3B8',
}

const LIVE_TABS = [
  { id: 'live_radar',      label: 'Live Operations Pulse' },
  { id: 'soil_matrix',     label: 'Soil & Hazard Matrix' },
  { id: 'route_intel',     label: 'Route Intelligence' },
  { id: 'chokepoints',     label: 'Active Chokepoints' },
  { id: 'convoy_watchlist',label: 'At-Risk Convoys' },
]

// Detailed segment breakdowns for the Analyst
const ROUTE_SEGMENTS_ANALYSIS: Record<string, Array<{
  segment: string; dist: string; surface: string; bridge: string; moisture: string; risk: number; status: string
}>> = {
  'route-c': [
    { segment: 'Guwahati → Nagaon Bypass', dist: '122 km', surface: '4-Lane Paved Highway', bridge: '40T Class (Excellent)', moisture: '42%', risk: 0, status: 'Clear Nominal Speed' },
    { segment: 'Nagaon → Tezpur Crossing', dist: '64 km', surface: '2-Lane Bitumen Corridor', bridge: '38T (Kolia Bhomora Bridge)', moisture: '54%', risk: 5, status: 'Safe Active Transit' },
    { segment: 'Tezpur → North Lakhimpur (SH-15)', dist: '118 km', surface: '2-Lane Paved Bypass', bridge: '35T Multi-Span', moisture: '48%', risk: 8, status: 'Safe Corridor Active' },
    { segment: 'North Lakhimpur → Pasighat HQ', dist: '44 km', surface: 'Paved Hill Cut (Low Gradient)', bridge: '30T Reinforced Concrete', moisture: '65%', risk: 18, status: 'Passable (No Debris)' },
  ],
  'route-a': [
    { segment: 'Guwahati → Kaziranga Sector', dist: '185 km', surface: '4-Lane Highway', bridge: '40T Class', moisture: '55%', risk: 15, status: 'Normal Flow' },
    { segment: 'Kaziranga Lowland Corridor', dist: '60 km', surface: '2-Lane Floodplain Cut', bridge: '30T Culvert Systems', moisture: '76%', risk: 62, status: 'Waterlogging Warning' },
    { segment: 'Jorhat → Banderdewa Ascent', dist: '55 km', surface: '2-Lane Mountain Highway', bridge: '28T Steel Truss', moisture: '68%', risk: 35, status: 'Slow Transit' },
    { segment: 'NH-415 Km 42 Landslide Sector', dist: '6 km', surface: '24.5° Steep Mountain Slope', bridge: '24T Damaged Bridgehead', moisture: '88%', risk: 87, status: 'CRITICAL BLOCKADE (200m Mudslide)' },
  ],
  'route-b': [
    { segment: 'Guwahati → Hojai', dist: '75 km', surface: '2-Lane Bitumen', bridge: '35T Class', moisture: '50%', risk: 18, status: 'Clear' },
    { segment: 'Hojai → Lumding Rail Corridor', dist: '65 km', surface: 'Freight Mixed Corridor', bridge: '32T Rail Overpass', moisture: '62%', risk: 40, status: 'Freight Congestion Delay' },
    { segment: 'Lumding → Diphu Karbi Hills', dist: '70 km', surface: '8.5° Hilly Curvature', bridge: '28T Arch Bridge', moisture: '72%', risk: 48, status: 'Heavy Fog Caution' },
    { segment: 'Golaghat → Pasighat Arc', dist: '172 km', surface: '2-Lane Southern Highway', bridge: '30T Timber Composite', moisture: '78%', risk: 54, status: 'Inundation Warning' },
  ],
}

// District Soil & Terrain Risk Matrix Data
const DISTRICT_HEATMAP = [
  {
    district: 'Papum Pare (Itanagar)',
    state: 'Arunachal Pradesh',
    rainfall: '45 mm/h',
    rainNum: 45,
    saturation: '88%',
    saturationNum: 88,
    slope: '24.5°',
    slopeNum: 24.5,
    risk: 87,
    status: 'Critical Landslide Zone',
    highway: 'NH-415 Km 42',
    trend: '+12% Rain Surge'
  },
  {
    district: 'Kamrup Metro (Guwahati)',
    state: 'Assam',
    rainfall: '12 mm/h',
    rainNum: 12,
    saturation: '42%',
    saturationNum: 42,
    slope: '2.4°',
    slopeNum: 2.4,
    risk: 14,
    status: 'Normal Operations',
    highway: 'NH-27 Corridor',
    trend: 'Stable Flow'
  },
  {
    district: 'Nagaon & Tezpur',
    state: 'Assam',
    rainfall: '18 mm/h',
    rainNum: 18,
    saturation: '54%',
    saturationNum: 54,
    slope: '3.1°',
    slopeNum: 3.1,
    risk: 22,
    status: 'Safe Corridor Active',
    highway: 'SH-15 Bypass',
    trend: 'Optimal Passability'
  },
  {
    district: 'Golaghat (Kaziranga)',
    state: 'Assam',
    rainfall: '34 mm/h',
    rainNum: 34,
    saturation: '76%',
    saturationNum: 76,
    slope: '1.8°',
    slopeNum: 1.8,
    risk: 62,
    status: 'Flood Warning (Low-Lying)',
    highway: 'NH-37 Floodplain',
    trend: '+8% Inundation'
  },
  {
    district: 'East Siang (Pasighat)',
    state: 'Arunachal Pradesh',
    rainfall: '28 mm/h',
    rainNum: 28,
    saturation: '65%',
    saturationNum: 65,
    slope: '14.2°',
    slopeNum: 14.2,
    risk: 48,
    status: 'Moderate Hill Hazard',
    highway: 'NH-515 / NH-13',
    trend: 'Cautionary Speed'
  },
  {
    district: 'East Khasi Hills (Shillong)',
    state: 'Meghalaya',
    rainfall: '38 mm/h',
    rainNum: 38,
    saturation: '79%',
    saturationNum: 79,
    slope: '18.0°',
    slopeNum: 18.0,
    risk: 58,
    status: 'Heavy Fog & Wet Pavement',
    highway: 'NH-6 Meghalaya Arc',
    trend: 'Wet Subsoil Caution'
  },
]

export function AnalystDashboard() {
  const navigate = useNavigate()
  const user = useAppStore(selUser)
  const vehicles = useVehicleStore(selVehicles)
  const alerts = useAlertStore(selAlerts)
  const routeOptions = useRouteStore(selRouteOptions)
  const selectedRouteId = useRouteStore(selSelectedRouteId)
  const selectRoute = useRouteStore(selSelectRoute)

  const [tab, setTab] = useState('live_radar')
  const [matrixView, setMatrixView] = useState<'table' | 'grid'>('table')
  const [convoyFilter, setConvoyFilter] = useState<'all' | 'stopped' | 'delayed' | 'medical'>('all')

  const selectedRoute = routeOptions.find(r => r.id === selectedRouteId) ?? routeOptions[0]

  const onRouteCount = vehicles.filter(v => v.status === 'on_route').length
  const delayedCount = vehicles.filter(v => v.status === 'delayed').length
  const stoppedCount = vehicles.filter(v => v.status === 'stopped').length
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved')

  const filteredWatchlist = useMemo(() => {
    const atRisk = vehicles.filter(v => v.status === 'stopped' || v.status === 'delayed')
    if (convoyFilter === 'stopped') return atRisk.filter(v => v.status === 'stopped')
    if (convoyFilter === 'delayed') return atRisk.filter(v => v.status === 'delayed')
    if (convoyFilter === 'medical') return atRisk.filter(v => v.cargoCategory === 'medical' || v.type === 'ambulance')
    return atRisk
  }, [vehicles, convoyFilter])

  // Radar data
  const radarData = mockDistrictPerformance.map(d => ({
    district: d.district.slice(0, 7),
    onTime:   d.onTime,
    delayed:  d.delayed,
  }))

  const handleExportQuickSummary = () => {
    let csv = '=== NER LOGISTICS - ANALYST LIVE SHIFT REPORT ===\n'
    csv += `Shift Date: ${new Date().toISOString()}\n`
    csv += `Analyst On Duty: ${user?.name ?? 'Amit Sharma'} (${user?.district ?? 'Guwahati'})\n\n`
    csv += 'District,Precipitation,SoilSaturation,SlopeAngle,LandslideRisk,Status\n'
    DISTRICT_HEATMAP.forEach(d => {
      csv += `"${d.district}",${d.rainfall},${d.saturation},${d.slope},${d.risk}%,${d.status}\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `NER_Live_Shift_Report_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Live operations shift report downloaded as CSV')
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="border-b border-border/80 flex-shrink-0 bg-surface">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3 md:px-5 py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 text-primary flex items-center justify-center flex-shrink-0">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold text-text">Analyst Live Operations Cockpit</h1>
                <Badge variant="muted" className="text-2xs hidden sm:inline-flex">Live Shift View</Badge>
              </div>
              <p className="text-2xs text-text-muted">Real-time situational telemetry, live soil saturation & active convoy triage</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/analytics')}
              className="h-8 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Simulation & ML Studio</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="secondary" onClick={handleExportQuickSummary} className="h-8 text-xs font-semibold">
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export Shift CSV</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="px-3 md:px-5 py-1.5 border-t border-border/60 bg-surface-2/30 flex items-center justify-between overflow-x-auto hide-scrollbar">
          <Tabs tabs={LIVE_TABS} active={tab} onChange={setTab} variant="pill" />
        </div>
      </div>

      {/* ── MAIN BODY ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-4">

        {/* Live Operational Triage Banner */}
        <div className="p-3 rounded-xl bg-danger/5 border border-danger/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-danger/10 text-danger flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="font-bold text-text flex items-center gap-2">
                <span>Active Critical Incident: NH-415 Blockade (Km 42 Pasighat Sector)</span>
                <span className="text-2xs px-2 py-0.5 rounded bg-danger/20 text-danger font-bold">87% Hazard Risk</span>
              </div>
              <p className="text-text-muted mt-0.5 leading-relaxed">
                200m active mudslide triggered by 85 mm/hr monsoonal rainfall. 3 convoys halted (including Life-Critical Ambulance <code>AR-01-GH-2345</code>). Detour via <strong>Route C (SH-15 North Bank Bypass)</strong> active.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/routes')}
            className="text-xs font-semibold whitespace-nowrap self-end sm:self-center bg-primary hover:bg-primary/90 text-white"
          >
            Review Route C Detour
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>

        {/* Live Fleet KPI Pulse Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="app-card p-3.5 space-y-1">
            <div className="text-xl md:text-2xl font-bold text-success tabular-nums">{onRouteCount} Convoys</div>
            <div className="text-xs font-semibold text-text">On Route (Normal Speed)</div>
            <div className="text-2xs text-text-muted">50% of active 12-vehicle fleet</div>
          </div>
          <div className="app-card p-3.5 space-y-1">
            <div className="text-xl md:text-2xl font-bold text-warning tabular-nums">{delayedCount} Convoys</div>
            <div className="text-xs font-semibold text-text">Delayed (Fog / Congestion)</div>
            <div className="text-2xs text-text-muted">Avg delay impact: +35 mins</div>
          </div>
          <div className="app-card p-3.5 space-y-1">
            <div className="text-xl md:text-2xl font-bold text-danger tabular-nums">{stoppedCount} Convoys</div>
            <div className="text-xs font-semibold text-text">Stopped at Blockade</div>
            <div className="text-2xs text-danger font-semibold">Turnaround instructed via Route C</div>
          </div>
          <div className="app-card p-3.5 space-y-1">
            <div className="text-xl md:text-2xl font-bold text-primary tabular-nums">91.4%</div>
            <div className="text-xs font-semibold text-text">Network On-Time Rate Today</div>
            <div className="text-2xs text-success font-semibold">+6.2% recovery with AI detour</div>
          </div>
        </div>

        {/* ── TAB 1: LIVE OPERATIONS PULSE ─────────────────────────────────── */}
        {tab === 'live_radar' && (
          <div className="space-y-4">
            {/* 24h Hourly Dispatch Curve */}
            <div className="app-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-text">Fleet On-Time vs Delayed Convoys — 24h Trend</span>
                </div>
                <span className="text-2xs text-text-muted">Live 1-Hour Telemetry Aggregation</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mockKPIHistory}>
                  <defs>
                    <linearGradient id="anOTLive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.success} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={C.success} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="anDLLive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.warning} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={C.warning} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.muted} opacity={0.5} />
                  <XAxis dataKey="time" tick={{ fill: C.text, fontSize: 11 }} />
                  <YAxis tick={{ fill: C.text, fontSize: 11 }} domain={[0, 100]} unit="%" />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11, color: C.text }} />
                  <Area type="monotone" dataKey="onTime" name="On-Time Rate %" stroke={C.success} fill="url(#anOTLive)" strokeWidth={2} />
                  <Area type="monotone" dataKey="delayed" name="Delayed Convoys %" stroke={C.warning} fill="url(#anDLLive)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Radar + Chokepoints Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="app-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-text">District Delivery Reliability Radar</span>
                  <span className="text-2xs text-text-muted">7 Northeast Sectors</span>
                </div>
                <ResponsiveContainer width="100%" height={230}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={C.muted} />
                    <PolarAngleAxis dataKey="district" tick={{ fill: C.text, fontSize: 10 }} />
                    <Radar name="On-Time %" dataKey="onTime" stroke={C.success} fill={C.success} fillOpacity={0.2} />
                    <Radar name="Delayed %" dataKey="delayed" stroke={C.warning} fill={C.warning} fillOpacity={0.2} />
                    <Legend wrapperStyle={{ fontSize: 11, color: C.text }} />
                    <Tooltip contentStyle={CHART_STYLE} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Priority Live Anomaly Feed */}
              <div className="app-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-sm font-bold text-text">Active Shift Anomalies & Alerts ({criticalAlerts.length})</span>
                  <button onClick={() => navigate('/alerts')} className="text-2xs text-primary font-semibold hover:underline">
                    View All Alerts →
                  </button>
                </div>
                <div className="space-y-2">
                  {criticalAlerts.slice(0, 3).map(a => (
                    <div key={a.id} className="p-2.5 rounded-lg border border-danger/30 bg-danger/5 flex items-start gap-2.5 text-xs">
                      <AlertTriangle className="h-4 w-4 text-danger flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-text">{a.title}</div>
                        <div className="text-2xs text-text-muted mt-0.5 line-clamp-1">{a.description}</div>
                        <div className="text-[10px] text-danger font-medium mt-1">Requires Route C Bypass · Action Required</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: SOIL & HAZARD MATRIX ──────────────────────────────────── */}
        {tab === 'soil_matrix' && (
          <div className="space-y-4">
            {/* Top Micro-KPI Pulse Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="app-card p-3.5 space-y-1 border-danger/30 bg-danger/5">
                <div className="flex items-center justify-between text-2xs text-text-muted">
                  <span>Critical Landslide Hazard</span>
                  <span className="h-2 w-2 rounded-full bg-danger animate-pulse" />
                </div>
                <div className="text-lg md:text-xl font-bold text-danger">1 District (87%)</div>
                <div className="text-[10px] text-text-muted">Papum Pare (Itanagar Sector)</div>
              </div>

              <div className="app-card p-3.5 space-y-1 border-warning/30 bg-warning/5">
                <div className="flex items-center justify-between text-2xs text-text-muted">
                  <span>Flood & Fog Warnings</span>
                  <span className="h-2 w-2 rounded-full bg-warning" />
                </div>
                <div className="text-lg md:text-xl font-bold text-warning">2 Districts (58–62%)</div>
                <div className="text-[10px] text-text-muted">Golaghat & Shillong Hills</div>
              </div>

              <div className="app-card p-3.5 space-y-1 border-success/30 bg-success/5">
                <div className="flex items-center justify-between text-2xs text-text-muted">
                  <span>Normal Passability</span>
                  <span className="h-2 w-2 rounded-full bg-success" />
                </div>
                <div className="text-lg md:text-xl font-bold text-success">3 Districts (14–48%)</div>
                <div className="text-[10px] text-text-muted">Guwahati, Tezpur, Pasighat</div>
              </div>

              <div className="app-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-2xs text-text-muted">
                  <span>Regional Mean Saturation</span>
                  <Droplets className="h-3 w-3 text-info" />
                </div>
                <div className="text-lg md:text-xl font-bold text-info">67.3% Saturation</div>
                <div className="text-[10px] text-text-muted">Monsoonal subsoil baseline</div>
              </div>
            </div>

            {/* Matrix Container */}
            <div className="app-card p-4 space-y-4">
              {/* Matrix Control Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-3 border-b border-white/10 gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-warning/10 text-warning">
                    <ShieldAlert className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text">District Soil Moisture Saturation & Topographic Slope Matrix</div>
                    <div className="text-2xs text-text-muted">Live IMD Doppler Radar Feeds & Geological Survey of India DEM GSI Telemetry</div>
                  </div>
                </div>

                {/* View switcher */}
                <div className="flex items-center bg-surface-2 rounded-lg border border-border p-0.5 self-end sm:self-center">
                  <button
                    onClick={() => setMatrixView('table')}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-2xs font-semibold flex items-center gap-1.5 transition-all',
                      matrixView === 'table' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'
                    )}
                  >
                    <TableIcon className="h-3 w-3" />
                    Table Matrix
                  </button>
                  <button
                    onClick={() => setMatrixView('grid')}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-2xs font-semibold flex items-center gap-1.5 transition-all',
                      matrixView === 'grid' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'
                    )}
                  >
                    <LayoutGrid className="h-3 w-3" />
                    Heatmap Cards
                  </button>
                </div>
              </div>

              {/* TABLE VIEW */}
              {matrixView === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-[10px] text-text-muted uppercase tracking-wider">
                        <th className="py-2.5 px-3">District & State</th>
                        <th className="py-2.5 px-3">Precipitation (IMD)</th>
                        <th className="py-2.5 px-3">Soil Moisture Saturation</th>
                        <th className="py-2.5 px-3">Slope Gradient</th>
                        <th className="py-2.5 px-3">Hazard Risk Score</th>
                        <th className="py-2.5 px-3">Corridor Highway</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[11px]">
                      {DISTRICT_HEATMAP.map(d => {
                        const isCritical = d.risk >= 75
                        const isModerate = d.risk >= 50 && d.risk < 75

                        return (
                          <tr key={d.district} className="hover:bg-white/5 transition-colors group">
                            <td className="py-3 px-3">
                              <div className="font-bold text-white text-xs">{d.district}</div>
                              <div className="text-[10px] text-text-muted">{d.state}</div>
                            </td>

                            {/* Precipitation */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5 font-medium text-info">
                                <CloudRain className="h-3 w-3 flex-shrink-0" />
                                <span>{d.rainfall}</span>
                              </div>
                              <div className="text-[10px] text-text-muted">{d.trend}</div>
                            </td>

                            {/* Soil Moisture Saturation */}
                            <td className="py-3 px-3 min-w-[140px]">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className={cn('font-bold', isCritical ? 'text-danger' : isModerate ? 'text-warning' : 'text-success')}>
                                  {d.saturation}
                                </span>
                                <span className="text-[10px] text-text-muted">
                                  {d.saturationNum >= 80 ? 'Critical' : d.saturationNum >= 60 ? 'Elevated' : 'Nominal'}
                                </span>
                              </div>
                              <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                                <div
                                  className={cn('h-full transition-all', isCritical ? 'bg-danger' : isModerate ? 'bg-warning' : 'bg-success')}
                                  style={{ width: `${d.saturationNum}%` }}
                                />
                              </div>
                            </td>

                            {/* Slope Gradient */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5 font-medium text-text">
                                <Mountain className="h-3 w-3 text-text-muted flex-shrink-0" />
                                <span>{d.slope}</span>
                              </div>
                              <div className="text-[10px] text-text-muted">
                                {d.slopeNum >= 20 ? 'Steep Mountain Ridge' : d.slopeNum >= 10 ? 'Hilly Sector' : 'Valley Lowland'}
                              </div>
                            </td>

                            {/* Landslide Hazard Risk */}
                            <td className="py-3 px-3">
                              <span className={cn(
                                'font-bold px-2 py-1 rounded text-[10px] inline-flex items-center gap-1',
                                isCritical ? 'bg-danger/20 text-danger border border-danger/30' :
                                isModerate ? 'bg-warning/20 text-warning border border-warning/30' :
                                'bg-success/20 text-success border border-success/30'
                              )}>
                                <span className={cn('h-1.5 w-1.5 rounded-full', isCritical ? 'bg-danger animate-pulse' : isModerate ? 'bg-warning' : 'bg-success')} />
                                {d.risk}% Risk
                              </span>
                            </td>

                            {/* Highway Sector */}
                            <td className="py-3 px-3 font-medium text-text">
                              <div>{d.highway}</div>
                              <div className="text-[10px] text-text-muted">{d.status}</div>
                            </td>

                            {/* Action Button */}
                            <td className="py-3 px-3 text-right">
                              <Button
                                size="sm"
                                variant={isCritical ? 'default' : 'secondary'}
                                onClick={() => {
                                  navigate('/routes')
                                  toast.info(`Inspecting safe routing bypass for ${d.district}`)
                                }}
                                className={cn('h-7 text-[10px] font-semibold', isCritical ? 'bg-primary text-white' : '')}
                              >
                                {isCritical ? 'Plan Detour' : 'Inspect'}
                                <ChevronRight className="h-3 w-3 ml-0.5" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* HEATMAP CARDS VIEW */}
              {matrixView === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {DISTRICT_HEATMAP.map(d => {
                    const isCritical = d.risk >= 75
                    const isModerate = d.risk >= 50 && d.risk < 75

                    return (
                      <div
                        key={d.district}
                        className={cn(
                          'p-3.5 rounded-xl border transition-all space-y-3 bg-surface',
                          isCritical ? 'border-danger/40' :
                          isModerate ? 'border-warning/30' :
                          'border-white/10 hover:border-white/20'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-bold text-xs text-text">{d.district}</div>
                            <div className="text-[10px] text-text-muted">{d.state} · {d.highway}</div>
                          </div>
                          <span className={cn(
                            'font-bold px-2 py-0.5 rounded text-[10px]',
                            isCritical ? 'bg-danger/20 text-danger border border-danger/30' :
                            isModerate ? 'bg-warning/20 text-warning border border-warning/30' :
                            'bg-success/20 text-success border border-success/30'
                          )}>
                            {d.risk}% Risk
                          </span>
                        </div>

                        {/* 3 Metric readout pills */}
                        <div className="grid grid-cols-3 gap-1.5 text-center text-2xs">
                          <div className="p-1.5 rounded-lg bg-surface-2 border border-white/5">
                            <div className="text-[9px] text-text-muted">Rainfall</div>
                            <div className="font-bold text-info mt-0.5">{d.rainfall}</div>
                          </div>
                          <div className="p-1.5 rounded-lg bg-surface-2 border border-white/5">
                            <div className="text-[9px] text-text-muted">Saturation</div>
                            <div className={cn('font-bold mt-0.5', isCritical ? 'text-danger' : isModerate ? 'text-warning' : 'text-success')}>
                              {d.saturation}
                            </div>
                          </div>
                          <div className="p-1.5 rounded-lg bg-surface-2 border border-white/5">
                            <div className="text-[9px] text-text-muted">Slope Angle</div>
                            <div className="font-bold text-text mt-0.5">{d.slope}</div>
                          </div>
                        </div>

                        {/* Passability description */}
                        <div className="text-[11px] text-text-muted leading-tight">
                          Status: <strong className={isCritical ? 'text-danger' : isModerate ? 'text-warning' : 'text-text'}>{d.status}</strong>
                        </div>

                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate('/routes')}
                          className="w-full h-7 text-[10px] font-semibold"
                        >
                          View Route Intelligence
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Bottom Physical Thresholds Reference Strip */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="app-card p-3.5 space-y-1">
                <div className="text-xs font-bold text-text flex items-center gap-1.5">
                  <Mountain className="h-3.5 w-3.5 text-danger" />
                  Critical Slope Angle Threshold
                </div>
                <div className="text-xl font-bold text-danger">15.0° DEM Gradient</div>
                <p className="text-2xs text-text-muted leading-relaxed">
                  Terrain slopes above 15° with saturation over 75% trigger an immediate 87% landslide hazard score.
                </p>
              </div>

              <div className="app-card p-3.5 space-y-1">
                <div className="text-xs font-bold text-text flex items-center gap-1.5">
                  <Droplets className="h-3.5 w-3.5 text-warning" />
                  Subsoil Moisture Saturation Limit
                </div>
                <div className="text-xl font-bold text-warning">80.0% Subsoil Index</div>
                <p className="text-2xs text-text-muted leading-relaxed">
                  Subsoil shear strength degrades rapidly above 80%, multiplying mudslide liquefaction risk by 4.2x.
                </p>
              </div>

              <div className="app-card p-3.5 space-y-1">
                <div className="text-xs font-bold text-text flex items-center gap-1.5">
                  <CloudRain className="h-3.5 w-3.5 text-info" />
                  Monsoon Downpour Trigger
                </div>
                <div className="text-xl font-bold text-info">50.0 mm/hr Precipitation</div>
                <p className="text-2xs text-text-muted leading-relaxed">
                  Radar precipitation exceeding 50 mm/h activates mandatory convoy speed restrictions and daylight routing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: ROUTE INTELLIGENCE ─────────────────────────────────────── */}
        {tab === 'route_intel' && (
          <div className="space-y-4">
            {/* Multi-Corridor Tradeoff Executive Scorecards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {routeOptions.map(r => {
                const isSelected = r.id === selectedRouteId
                const isAI = r.isAIRecommended
                const isBlocked = r.riskScore >= 75

                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      selectRoute(r.id)
                      toast.info(`Selected ${r.label.split('—')[0].trim()}`)
                    }}
                    className={cn(
                      'app-card p-4 space-y-3 cursor-pointer transition-all border',
                      isSelected ? 'border-primary shadow-lg bg-primary/5' :
                      isBlocked ? 'border-danger/30 hover:border-danger/60' :
                      'border-white/10 hover:border-white/20'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-text">{r.label.split('—')[0].trim()}</span>
                          {isAI && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-success/20 text-success border border-success/30 font-bold">
                              AI Optimal
                            </span>
                          )}
                        </div>
                        <div className="text-2xs text-text-muted mt-0.5 line-clamp-1">
                          {r.label.split('—')[1]?.trim() ?? r.via.join(' → ')}
                        </div>
                      </div>

                      <Badge
                        variant={isBlocked ? 'danger' : isAI ? 'success' : 'warning'}
                        className="text-[10px] uppercase font-bold"
                      >
                        {isBlocked ? 'Blocked' : isAI ? 'Passable' : 'Caution'}
                      </Badge>
                    </div>

                    {/* Metric Capsules */}
                    <div className="grid grid-cols-3 gap-1.5 text-center text-2xs">
                      <div className="p-1.5 rounded-lg bg-surface-2 border border-white/5">
                        <div className="text-[9px] text-text-muted">Distance</div>
                        <div className="font-bold text-text mt-0.5">{r.distance} km</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-surface-2 border border-white/5">
                        <div className="text-[9px] text-text-muted">Transit ETA</div>
                        <div className="font-bold text-text mt-0.5">{Math.floor(r.duration / 60)}h {r.duration % 60}m</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-surface-2 border border-white/5">
                        <div className="text-[9px] text-text-muted">Hazard Risk</div>
                        <div className={cn('font-bold mt-0.5', isBlocked ? 'text-danger' : isAI ? 'text-success' : 'text-warning')}>
                          {r.riskScore}%
                        </div>
                      </div>
                    </div>

                    {/* Verdict */}
                    <div className="text-2xs text-text-muted pt-1 border-t border-white/5 flex items-center justify-between">
                      <span>{isBlocked ? 'Active Mudslide at Km 42' : isAI ? 'Safe Corridor Locked' : 'Lowland Flood Exposure'}</span>
                      <span className="text-primary font-semibold">Inspect →</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Embedded Topographic Elevation & Terrain Gradient Graph */}
            <ElevationProfile route={selectedRoute} />

            {/* Segment-by-Segment Infrastructure Matrix */}
            <div className="app-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <RouteIcon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-text">
                    Corridor Segment & Physical Infrastructure Analysis — {selectedRoute.label.split('—')[0].trim()}
                  </span>
                </div>
                <span className="text-2xs text-text-muted">Geotechnical Assessment</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-text-muted uppercase tracking-wider">
                      <th className="py-2.5 px-3">Corridor Highway Segment</th>
                      <th className="py-2.5 px-3">Distance</th>
                      <th className="py-2.5 px-3">Pavement / Surface Quality</th>
                      <th className="py-2.5 px-3">Bridge Load Limit</th>
                      <th className="py-2.5 px-3">Subsoil Moisture</th>
                      <th className="py-2.5 px-3">Hazard Risk</th>
                      <th className="py-2.5 px-3">Passability Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-[11px]">
                    {(ROUTE_SEGMENTS_ANALYSIS[selectedRoute.id] ?? ROUTE_SEGMENTS_ANALYSIS['route-c']).map(seg => {
                      const isHighRisk = seg.risk >= 75
                      const isMedRisk = seg.risk >= 30 && seg.risk < 75

                      return (
                        <tr key={seg.segment} className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 px-3 font-semibold text-white">{seg.segment}</td>
                          <td className="py-2.5 px-3 text-text-muted">{seg.dist}</td>
                          <td className="py-2.5 px-3 text-text">{seg.surface}</td>
                          <td className="py-2.5 px-3 text-info font-medium">{seg.bridge}</td>
                          <td className="py-2.5 px-3 text-warning font-medium">{seg.moisture}</td>
                          <td className="py-2.5 px-3">
                            <span className={cn(
                              'font-bold px-2 py-0.5 rounded text-[10px]',
                              isHighRisk ? 'bg-danger/20 text-danger border border-danger/30' :
                              isMedRisk ? 'bg-warning/20 text-warning border border-warning/30' :
                              'bg-success/20 text-success border border-success/30'
                            )}>
                              {seg.risk}% Risk
                            </span>
                          </td>
                          <td className={cn('py-2.5 px-3 text-2xs font-semibold', isHighRisk ? 'text-danger' : isMedRisk ? 'text-warning' : 'text-success')}>
                            {seg.status}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Decision Attribution Breakdown Capsule */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2.5">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-text">
                  Algorithmic Route Selection Rationale (XGBoost Topographic Decision Engine)
                </span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                The AI optimization engine selected <strong>Route C (SH-15 North Bank Safe Bypass)</strong> over Direct Route A despite adding 42 km of transit distance. Direct Route A crosses the active <strong>NH-415 Km 42 mudslide zone</strong> (88% soil moisture saturation, 24.5° slope), imposing an estimated <strong>5.5-hour stranding delay</strong>. Route C bypasses the mountain hazard corridor, maintaining a <strong>98.2% on-time delivery confidence</strong>.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="outline" className="text-2xs border-success/30 text-success">
                  +5.5h Blockade Avoidance
                </Badge>
                <Badge variant="outline" className="text-2xs border-primary/30 text-primary">
                  Max Slope 4.8° (Safe)
                </Badge>
                <Badge variant="outline" className="text-2xs border-info/30 text-info">
                  Bridge Class 40T Certified
                </Badge>
                <Badge variant="outline" className="text-2xs border-warning/30 text-warning">
                  Subsoil Saturation 48% (Stable)
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: ACTIVE CHOKEPOINTS ────────────────────────────────────── */}
        {tab === 'chokepoints' && (
          <div className="space-y-3">
            {mockBottlenecks.map((b, i) => (
              <div
                key={b.roadId}
                className={cn(
                  'app-card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3',
                  i === 0 ? 'border-danger/40 bg-danger/5' : i === 1 ? 'border-warning/40 bg-warning/5' : ''
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    'text-2xl font-bold w-8 text-center',
                    i === 0 ? 'text-danger' : i === 1 ? 'text-warning' : 'text-text-muted'
                  )}>
                    #{i + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text">{b.roadName}</span>
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded', i === 0 ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning')}>
                        {b.incidents} Incidents Logged
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-2xs text-text-muted mt-1">
                      <span>GPS: {b.coordinates.lat.toFixed(2)}°N, {b.coordinates.lng.toFixed(2)}°E</span>
                      <span>Avg Delay Impact: <strong className="text-text">{b.avgDelay} hrs</strong></span>
                      {i === 0 && <span className="text-danger font-semibold">Active Mudslide Blockade</span>}
                    </div>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    navigate('/routes')
                    toast.info(`Inspecting detour options for ${b.roadName}`)
                  }}
                  className="text-xs font-semibold h-8"
                >
                  Plan Detour
                  <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 4: CONVOY WATCHLIST ──────────────────────────────────────── */}
        {tab === 'convoy_watchlist' && (
          <div className="space-y-4">
            {/* Filter and Action Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-white/10">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-text mr-1 flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-primary" />
                  Filter Convoys:
                </span>
                {[
                  { id: 'all', label: `All At-Risk (${vehicles.filter(v => v.status === 'stopped' || v.status === 'delayed').length})` },
                  { id: 'stopped', label: `Stopped (${vehicles.filter(v => v.status === 'stopped').length})` },
                  { id: 'delayed', label: `Delayed (${vehicles.filter(v => v.status === 'delayed').length})` },
                  { id: 'medical', label: 'Life-Critical Medical' },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setConvoyFilter(f.id as any)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-2xs font-semibold transition-all border',
                      convoyFilter === f.id
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'border-border bg-surface-2 text-text-muted hover:text-text hover:bg-surface-3'
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    navigate('/routes')
                    toast.success('Batch rerouting initialized for all 3 stranded units via Route C')
                  }}
                  className="h-8 text-xs font-semibold bg-danger hover:bg-danger/90 text-white shadow-sm whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Batch Reroute Stranded Units (3)
                </Button>
              </div>
            </div>

            {/* Convoy Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {filteredWatchlist.map(v => {
                const isStopped = v.status === 'stopped'
                const isMedical = v.cargoCategory === 'medical' || v.type === 'ambulance'
                const isFuel = v.type === 'tanker' && v.cargo.toLowerCase().includes('fuel')

                return (
                  <div
                    key={v.id}
                    className={cn(
                      'app-card p-4 space-y-3.5 border transition-all flex flex-col justify-between bg-surface',
                      isStopped ? 'border-danger/40' : 'border-warning/30'
                    )}
                  >
                    {/* Card Header & Status */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={cn(
                            'h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 border',
                            isMedical ? 'bg-danger/15 border-danger/30 text-danger' :
                            isFuel ? 'bg-warning/15 border-warning/30 text-warning' :
                            'bg-primary/15 border-primary/30 text-primary'
                          )}>
                            {isMedical ? <HeartPulse className="h-5 w-5" /> :
                             isFuel ? <Fuel className="h-5 w-5" /> :
                             <Truck className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-text truncate">
                              {v.registrationNo}
                            </div>
                            <div className="text-2xs text-text-muted capitalize">
                              {v.type} · {v.district}
                            </div>
                          </div>
                        </div>

                        <Badge
                          variant={isStopped ? 'danger' : 'warning'}
                          className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5"
                        >
                          {isStopped ? 'Blocked' : 'Delayed'}
                        </Badge>
                      </div>

                      {/* Cargo Description Banner */}
                      <div className="p-2 rounded-lg bg-surface-2 border border-white/5 space-y-1">
                        <div className="flex items-center justify-between text-2xs">
                          <span className="text-text-muted">Cargo:</span>
                          <span className="font-semibold text-primary capitalize">{v.cargoCategory} Priority</span>
                        </div>
                        <div className="text-xs font-semibold text-text line-clamp-1">
                          {v.cargo}
                        </div>
                      </div>
                    </div>

                    {/* Route Transit Progress */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-2xs text-text-muted">
                        <span className="font-medium text-text">{v.origin}</span>
                        <ArrowRight className="h-3 w-3 text-primary flex-shrink-0" />
                        <span className="font-medium text-text">{v.destination}</span>
                      </div>
                      <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full transition-all', isStopped ? 'bg-danger' : 'bg-warning')}
                          style={{ width: `${v.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted">
                        <span>Progress: {v.progress}%</span>
                        <span className={cn('font-semibold', isStopped ? 'text-danger' : 'text-warning')}>
                          {isStopped ? 'Halted at Km 42' : 'Slow Transit (38 km/h)'}
                        </span>
                      </div>
                    </div>

                    {/* 4-Metric Data Capsule */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-surface-2/70 border border-white/5">
                        <div className="text-[10px] text-text-muted flex items-center justify-center gap-1">
                          <Gauge className="h-3 w-3 text-text-muted" /> Speed & Fuel
                        </div>
                        <div className="font-bold text-text mt-0.5">
                          {v.speed} km/h · <span className="text-success">{v.fuelLevel}% Fuel</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-2/70 border border-white/5">
                        <div className="text-[10px] text-text-muted flex items-center justify-center gap-1">
                          <Clock className="h-3 w-3 text-text-muted" /> Delay Impact
                        </div>
                        <div className={cn('font-bold mt-0.5', isStopped ? 'text-danger' : 'text-warning')}>
                          {isStopped ? '+3.8h Blockade' : '+35m Fog Delay'}
                        </div>
                      </div>
                    </div>

                    {/* Driver Contact & AI Recommendation Box */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-2xs p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-success" />
                          <span className="text-text font-medium">{v.driver}</span>
                        </div>
                        <span className="text-text-muted">{v.driverPhone}</span>
                      </div>

                      <div className="p-2 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-text-muted leading-relaxed">
                        <strong className="text-primary font-semibold">AI Prescription: </strong>
                        {isStopped
                          ? 'Execute turnaround to SH-15 North Bank to recover schedule (+92% on-time confidence).'
                          : 'Maintain daylight transit speed; monitor Kaziranga overflow channels.'}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-white/5 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          toast.info(`Calling driver ${v.driver} at ${v.driverPhone}…`)
                        }}
                        className="flex-1 h-8 text-xs font-semibold"
                      >
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        Call Driver
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          navigate('/routes')
                          toast.info(`Assigning Route C detour to ${v.registrationNo}`)
                        }}
                        className="flex-1 h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-white"
                      >
                        Assign Detour
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>

                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
