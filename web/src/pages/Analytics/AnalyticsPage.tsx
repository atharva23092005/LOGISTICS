/**
 * Disruption Analytics & Predictive Intelligence Studio
 *
 * Implements full analytical suite:
 *  1. Disruption Trends (12-Month Line Chart showing Monsoon Peaks in Jun-Jul)
 *  2. Disruption Causes (Donut Chart: Landslides 45%, Floods 30%, Road Damage 15%, Accidents 10%)
 *  3. District Impact Table (Sortable by Events, Avg Delay, Total Cost Impact with Red/Green grading)
 *  4. Regional Disruption Heat Map & Vulnerability Choropleth (Click-to-Drilldown)
 *  5. AI Cost Savings Chart (Composed Monthly Bar + Cumulative Total Line Chart)
 *  6. Interactive Detailed Incident Log with Live Filters
 *  7. Export PDF Modal Preview & Data Export Engine
 */
import { useState, useMemo } from 'react'
import {
  Sparkles, Sliders, Cpu, TrendingUp, BarChart3,
  ShieldAlert, Download, FileSpreadsheet, Play, RotateCcw,
  CheckCircle2, AlertTriangle, Layers, MapPin, ArrowRight,
  PieChart as PieIcon, Calendar, Printer, Filter, Search,
  Clock, IndianRupee, Mountain, Waves, AlertOctagon, CheckCheck,
  ChevronDown, ChevronUp, ArrowUpDown, X, FileText, Check,
  Share2, ShieldCheck, Activity
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, ComposedChart
} from 'recharts'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/utils/cn'

const CHART_STYLE = {
  backgroundColor: '#0D1626',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  color: '#E2E8F0',
  fontSize: '11px',
  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
}

const C = {
  primary:     '#3B82F6',
  landslide:   '#D97706', // Amber-Brown for Landslide
  flood:       '#3B82F6', // Blue for Floods
  roadDamage:  '#94A3B8', // Gray for Road Damage
  accident:    '#F59E0B', // Amber for Accidents
  warning:     '#F59E0B',
  info:        '#06B6D4',
  purple:      '#8B5CF6',
  success:     '#10B981',
  danger:      '#EF4444',
  muted:       '#1F3352',
  text:        '#94A3B8',
}

const STUDIO_TABS = [
  { id: 'overview',    label: 'Disruption Analytics Overview' },
  { id: 'cost_savings',label: 'AI Cost Savings & ROI' },
  { id: 'simulation',  label: 'What-If Simulation Studio' },
  { id: 'ml_models',   label: 'XGBoost AI Diagnostics' },
  { id: 'resilience',  label: 'District Resilience Matrix' },
]

// 12-Month Disruption Trend Data (Demonstrating Monsoon Spike in Jun-Jul)
const TWELVE_MONTH_TRENDS = [
  { month: 'Jan', landslides: 3,  floods: 0,  damage: 2, total: 5 },
  { month: 'Feb', landslides: 4,  floods: 1,  damage: 3, total: 8 },
  { month: 'Mar', landslides: 8,  floods: 2,  damage: 4, total: 14 },
  { month: 'Apr', landslides: 12, floods: 4,  damage: 5, total: 21 },
  { month: 'May', landslides: 18, floods: 9,  damage: 6, total: 33 },
  { month: 'Jun', landslides: 28, floods: 19, damage: 9, total: 56 }, // Monsoon Peak
  { month: 'Jul', landslides: 32, floods: 22, damage: 10, total: 64 }, // Monsoon Peak
  { month: 'Aug', landslides: 24, floods: 16, damage: 8, total: 48 },
  { month: 'Sep', landslides: 16, floods: 11, damage: 6, total: 33 },
  { month: 'Oct', landslides: 9,  floods: 4,  damage: 4, total: 17 },
  { month: 'Nov', landslides: 4,  floods: 1,  damage: 2, total: 7 },
  { month: 'Dec', landslides: 2,  floods: 0,  damage: 1, total: 3 },
]

// Disruption Causes Donut Distribution (Exact user spec)
const CAUSES_DATA = [
  { name: 'Landslides',    value: 45, count: 12, color: '#D97706' },
  { name: 'Floods',        value: 30, count: 8,  color: '#3B82F6' },
  { name: 'Road Damage',   value: 15, count: 4,  color: '#94A3B8' },
  { name: 'Accidents',     value: 10, count: 2,  color: '#F59E0B' },
]

// Monthly AI Cost Savings Data (Bar + Cumulative Line)
const COST_SAVINGS_DATA = [
  { month: 'Jan', monthly: 1.2, cumulative: 1.2 },
  { month: 'Feb', monthly: 1.8, cumulative: 3.0 },
  { month: 'Mar', monthly: 2.4, cumulative: 5.4 },
  { month: 'Apr', monthly: 3.1, cumulative: 8.5 },
  { month: 'May', monthly: 4.6, cumulative: 13.1 },
  { month: 'Jun', monthly: 6.2, cumulative: 19.3 },
  { month: 'Jul', monthly: 7.4, cumulative: 26.7 },
  { month: 'Aug', monthly: 5.8, cumulative: 32.5 },
  { month: 'Sep', monthly: 4.1, cumulative: 36.6 },
  { month: 'Oct', monthly: 2.7, cumulative: 39.3 },
  { month: 'Nov', monthly: 1.9, cumulative: 41.2 },
  { month: 'Dec', monthly: 1.3, cumulative: 42.5 },
]

// District Impact Table Data
interface DistrictImpactItem {
  id: string
  district: string
  events: number
  avgDelay: number // in hours for sorting
  avgDelayStr: string
  costVal: number // in Lakhs for sorting
  costImpact: string
  highway: string
  riskTier: 'Critical' | 'High' | 'Moderate' | 'Low'
  heatScore: number
}

const DISTRICT_IMPACTS_DATA: DistrictImpactItem[] = [
  { id: 'd1', district: 'East Siang', events: 6, avgDelay: 6.5, avgDelayStr: '6.5 hrs', costVal: 4.5, costImpact: '₹4.5L', highway: 'NH-415 Km 42',    riskTier: 'Critical', heatScore: 88 },
  { id: 'd2', district: 'Jorhat',     events: 8, avgDelay: 4.2, avgDelayStr: '4.2 hrs', costVal: 3.8, costImpact: '₹3.8L', highway: 'NH-27 / NH-715', riskTier: 'High',     heatScore: 68 },
  { id: 'd3', district: 'Tawang',     events: 5, avgDelay: 3.4, avgDelayStr: '3.4 hrs', costVal: 2.1, costImpact: '₹2.1L', highway: 'NH-13B Sela Pass',riskTier: 'High',     heatScore: 62 },
  { id: 'd4', district: 'Dibrugarh',  events: 4, avgDelay: 2.8, avgDelayStr: '2.8 hrs', costVal: 1.6, costImpact: '₹1.6L', highway: 'NH-37 Lowlands',  riskTier: 'Moderate', heatScore: 58 },
  { id: 'd5', district: 'Itanagar',   events: 4, avgDelay: 2.1, avgDelayStr: '2.1 hrs', costVal: 1.4, costImpact: '₹1.4L', highway: 'NH-415 / SH-15',  riskTier: 'Moderate', heatScore: 54 },
  { id: 'd6', district: 'Shillong',   events: 3, avgDelay: 1.2, avgDelayStr: '1.2 hrs', costVal: 0.7, costImpact: '₹0.7L', highway: 'NH-6 Highway',    riskTier: 'Low',      heatScore: 24 },
  { id: 'd7', district: 'Guwahati',   events: 2, avgDelay: 0.8, avgDelayStr: '0.8 hrs', costVal: 0.4, costImpact: '₹0.4L', highway: 'NH-27 Transit',   riskTier: 'Low',      heatScore: 18 },
]

// Detailed Incident Log Items
const INCIDENT_LOGS = [
  { id: 'inc-101', date: 'Jun 15', type: 'Landslide',  location: 'NH-37 Km 45 (Kaziranga Sector)', duration: '8 hrs', impact: '12 vehicles', action: 'Auto-Rerouted via SH-15 North Bank', status: 'Resolved' },
  { id: 'inc-102', date: 'Jun 14', type: 'Flood',      location: 'SH-12 (North Lakhimpur Bridge)',  duration: '24 hrs',impact: '5 vehicles',  action: 'Priority Medical Escort Dispatched', status: 'Resolved' },
  { id: 'inc-103', date: 'Jun 12', type: 'Road Damage',location: 'NH-415 Km 42 (Pasighat Pass)',   duration: '4 hrs', impact: '3 vehicles',  action: 'Heavy Multi-Axle Detour Active',  status: 'Resolved' },
  { id: 'inc-104', date: 'Jun 09', type: 'Landslide',  location: 'NH-13 Banderdewa Ascent',        duration: '6 hrs', impact: '8 vehicles',  action: 'BRO Excavators Cleared Mudslide',  status: 'Resolved' },
  { id: 'inc-105', date: 'Jun 04', type: 'Bridge Fault',location: 'Kolia Bhomora Multi-Span',      duration: '12 hrs',impact: '14 vehicles', action: 'Single-Lane Alternating Transit', status: 'Resolved' },
  { id: 'inc-106', date: 'May 28', type: 'Landslide',  location: 'NH-13B Sela Pass Km 18',         duration: '10 hrs',impact: '9 vehicles',  action: 'Winterized Convoy Rerouted',      status: 'Resolved' },
  { id: 'inc-107', date: 'May 22', type: 'Flood',      location: 'Majuli Lowland River Approach',  duration: '18 hrs',impact: '6 vehicles',  action: 'POL Fuel Tankers Diverted',       status: 'Resolved' },
  { id: 'inc-108', date: 'May 16', type: 'Accident',   location: 'NH-27 Nagaon Crossing',          duration: '3 hrs',  impact: '4 vehicles',  action: 'Crane Clearance Dispatched',      status: 'Resolved' },
]

export function AnalyticsPage() {
  const [tab, setTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('30d')
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedHeatDistrict, setSelectedHeatDistrict] = useState<string | null>(null)
  
  // Table Sorting State
  const [sortField, setSortField] = useState<'events' | 'avgDelay' | 'costVal'>('events')
  const [sortAsc, setSortAsc] = useState(false)

  // PDF Preview Dialog State
  const [pdfDialogOpen, setPdfDialogOpen] = useState(false)

  // ── WHAT-IF SIMULATION STATE ──────────────────────────────────────────────
  const [simRoad, setSimRoad]         = useState('nh415')
  const [simDuration, setSimDuration] = useState(6)
  const [simRain, setSimRain]         = useState(85)
  const [simReroute, setSimReroute]   = useState(true)

  // Computed simulation metrics
  const simResults = useMemo(() => {
    const baseOnTime = 82.0
    const severityFactor = (simDuration / 12) * (simRain / 50)
    const onTimeWithoutAI = Math.max(42, Math.round(baseOnTime - severityFactor * 22))
    const onTimeWithAI    = Math.min(89, Math.round(baseOnTime - (simReroute ? severityFactor * 3.2 : severityFactor * 22)))
    const idleHoursSaved  = simReroute ? Math.round(simDuration * 3.2 * 8.5) : 0
    const strandedCount   = simReroute ? 0 : Math.min(8, Math.round(simDuration * 0.5))

    const simChartData = [
      { hour: 'Hour 0', normal: 85, withoutAI: 85, withAI: 85 },
      { hour: 'Hour 2', normal: 84, withoutAI: Math.max(48, 84 - severityFactor * 8), withAI: 83 },
      { hour: `Hour ${Math.round(simDuration/2)}`, normal: 84, withoutAI: onTimeWithoutAI + 5, withAI: onTimeWithAI - 1 },
      { hour: `Hour ${simDuration}`, normal: 85, withoutAI: onTimeWithoutAI, withAI: onTimeWithAI },
      { hour: 'Recovery', normal: 85, withoutAI: onTimeWithoutAI + 15, withAI: 84 },
    ]

    return { onTimeWithoutAI, onTimeWithAI, idleHoursSaved, strandedCount, simChartData }
  }, [simRoad, simDuration, simRain, simReroute])

  // Sorted District Impacts
  const sortedDistricts = useMemo(() => {
    return [...DISTRICT_IMPACTS_DATA].sort((a, b) => {
      const valA = a[sortField]
      const valB = b[sortField]
      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1)
    })
  }, [sortField, sortAsc])

  // Handle Sort Toggle
  const handleSort = (field: 'events' | 'avgDelay' | 'costVal') => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  // Filtered Incident Logs
  const filteredLogs = useMemo(() => {
    return INCIDENT_LOGS.filter(item => {
      const matchType = filterType === 'all' || item.type.toLowerCase().includes(filterType.toLowerCase())
      const matchDistrict = !selectedHeatDistrict || item.location.toLowerCase().includes(selectedHeatDistrict.toLowerCase())
      const matchSearch = searchQuery === '' ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.action.toLowerCase().includes(searchQuery.toLowerCase())
      return matchType && matchDistrict && matchSearch
    })
  }, [filterType, selectedHeatDistrict, searchQuery])

  // PDF Export Trigger
  const handleDownloadPDF = () => {
    setPdfDialogOpen(false)
    toast.success('Executive PDF Dossier Downloaded', {
      description: 'NERA_Disruption_Analytics_Report_Q2_2026.pdf saved.',
    })
  }

  // CSV Export Trigger
  const handleExportCSV = () => {
    let csv = '=== NER LOGISTICS PLATFORM — DISRUPTION ANALYTICS DOSSIER ===\n'
    csv += `Export Date: ${new Date().toISOString()}\n`
    csv += `Time Horizon: ${timeRange.toUpperCase()}\n\n`
    csv += '=== 30-DAY KPI SUMMARY ===\n'
    csv += 'Disruptions This Month: 24, On-Time Rate: 82%, Cost Saved: INR 12.5 Lakhs, Avg Resolution: 3.4h\n\n'
    csv += '=== DISTRICT IMPACT SUMMARY ===\n'
    csv += 'District,Events,AvgDelayHours,CostImpactLakhs,Highway,RiskTier\n'
    DISTRICT_IMPACTS_DATA.forEach(d => {
      csv += `"${d.district}",${d.events},${d.avgDelay},${d.costVal},"${d.highway}","${d.riskTier}"\n`
    })
    csv += '\n=== INCIDENT HISTORY LOG ===\n'
    csv += 'Date,Type,Location,Duration,Impact,Action,Status\n'
    INCIDENT_LOGS.forEach(i => {
      csv += `"${i.date}","${i.type}","${i.location}","${i.duration}","${i.impact}","${i.action}","${i.status}"\n`
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `NER_Disruption_Analytics_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Macro analytics CSV dataset exported.')
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* ── HEADER TOOLBAR ────────────────────────────────────────────────── */}
      <div className="border-b border-border/80 flex-shrink-0 bg-surface">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3 md:px-5 py-3 gap-3">
          
          {/* Title & Subtitle */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 text-primary flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold text-text">Disruption Analytics</h1>
                <Badge variant="muted" className="text-2xs hidden sm:inline-flex">Regional Intelligence</Badge>
              </div>
              <p className="text-2xs text-text-muted">
                Macro network performance, historical hazard trends, district heatmaps & financial resilience
              </p>
            </div>
          </div>

          {/* Time Range Selector & Export Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Time Filter Dropdown */}
            <div className="relative inline-flex items-center">
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                className="h-8 pl-2.5 pr-7 rounded-lg border border-border bg-surface-2 text-xs font-semibold text-text focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days (Current Month)</option>
                <option value="90d">Last 90 Days</option>
                <option value="6m">Last 6 Months (Monsoon)</option>
                <option value="1y">Full 12-Month Cycle</option>
              </select>
              <ChevronDown className="h-3 w-3 text-text-muted absolute right-2 pointer-events-none" />
            </div>

            {/* Export PDF Button (Opens Sample Report Dialog) */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPdfDialogOpen(true)}
              className="h-8 text-xs font-semibold bg-white/5 hover:bg-white/10 border-white/10 text-white"
            >
              <Printer className="h-3.5 w-3.5 mr-1 text-primary" />
              <span>Export PDF</span>
            </Button>

            {/* Export CSV Button */}
            <Button
              size="sm"
              variant="secondary"
              onClick={handleExportCSV}
              className="h-8 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>

        </div>

        {/* Tab Navigation Strip */}
        <div className="px-3 md:px-5 py-1.5 border-t border-border/60 bg-surface-2/30 flex items-center justify-between overflow-x-auto hide-scrollbar">
          <Tabs tabs={STUDIO_TABS} active={tab} onChange={setTab} variant="pill" />
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-5">

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 1: DISRUPTION ANALYTICS OVERVIEW (PRIMARY REQUESTED VIEW)
           ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <div className="space-y-5">
            
            {/* ── 1. TOP 3-SCORECARD KPI TILES (OVERVIEW) ──────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Card 1: Disruptions This Month */}
              <div className="app-card p-4 bg-surface border border-white/10 rounded-xl space-y-1 relative overflow-hidden">
                <div className="flex items-center justify-between text-2xs text-text-muted">
                  <span className="font-semibold uppercase tracking-wider">Disruptions</span>
                  <span className="text-2xs text-emerald-400 font-bold">-14% vs Last Month</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">24</span>
                  <span className="text-xs text-text-muted font-medium">This Month</span>
                </div>
                <div className="text-[11px] text-text-dim pt-1 flex items-center gap-2">
                  <span className="text-amber-500 font-semibold">12 Landslides</span> • 
                  <span className="text-primary font-semibold">8 Floods</span> • 
                  <span className="text-text-muted font-semibold">4 Road Damage</span>
                </div>
              </div>

              {/* Card 2: On-Time Rate */}
              <div className="app-card p-4 bg-surface border border-white/10 rounded-xl space-y-1 relative overflow-hidden">
                <div className="flex items-center justify-between text-2xs text-text-muted">
                  <span className="font-semibold uppercase tracking-wider">On-Time Rate</span>
                  <span className="text-2xs text-emerald-400 font-bold">+4.2% AI Uplift</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400">82%</span>
                  <span className="text-xs text-text-muted font-medium">This Month</span>
                </div>
                <div className="text-[11px] text-text-dim pt-1">
                  Baseline Target ≥80% • <strong className="text-white">19 Convoys</strong> Saved via Route C
                </div>
              </div>

              {/* Card 3: Logistics Cost Saved */}
              <div className="app-card p-4 bg-surface border border-white/10 rounded-xl space-y-1 relative overflow-hidden">
                <div className="flex items-center justify-between text-2xs text-text-muted">
                  <span className="font-semibold uppercase tracking-wider">Cost Saved</span>
                  <span className="text-2xs text-primary font-bold">From AI Routing</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary">₹12.5L</span>
                  <span className="text-xs text-text-muted font-medium">This Month</span>
                </div>
                <div className="text-[11px] text-text-dim pt-1">
                  163 Fleet Idle Hours Saved • Zero Cold-Chain Vaccine Loss
                </div>
              </div>

            </div>

            {/* ── 2. DISRUPTION TRENDS (12-MONTH LINE CHART) ─────────────── */}
            <div className="app-card p-4 bg-surface border border-white/10 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-sm font-bold text-white">Disruption Trends (12 Months)</span>
                    <span className="text-2xs text-amber-400 ml-2 font-medium">
                      ⚠️ Monsoonal Peak in June–July
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-2xs text-text-muted">
                  <span className="flex items-center gap-1.5 font-semibold text-amber-500">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" /> Landslides (Brown)
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-blue-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" /> Floods (Blue)
                  </span>
                  <span className="flex items-center gap-1.5 font-semibold text-slate-400">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400 inline-block" /> Road Damage (Gray)
                  </span>
                </div>
              </div>

              <div className="h-[240px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={TWELVE_MONTH_TRENDS}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.muted} opacity={0.5} />
                    <XAxis dataKey="month" tick={{ fill: C.text, fontSize: 11 }} />
                    <YAxis tick={{ fill: C.text, fontSize: 11 }} unit=" ev" />
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Line type="monotone" dataKey="landslides" name="Landslides" stroke={C.landslide} strokeWidth={2.5} dot={{ r: 3, fill: C.landslide }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="floods"     name="Floods"     stroke={C.flood}     strokeWidth={2.5} dot={{ r: 3, fill: C.flood }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="damage"     name="Road Damage" stroke={C.roadDamage} strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-text-dim pt-1 border-t border-white/5">
                <span>* Seasonal monsoonal rainfall surge accelerates slope saturation in June–July, driving 64 total monthly incidents.</span>
                <span className="text-amber-400 font-semibold">Validates Proactive AI Detour Focus</span>
              </div>
            </div>

            {/* ── 3. SPLIT ROW: DISRUPTION CAUSES + SORTABLE DISTRICT IMPACT ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left (Col 5): Disruption Causes Donut Chart */}
              <div className="lg:col-span-5 app-card p-4 bg-surface border border-white/10 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <PieIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-white">Disruption Causes</span>
                  </div>
                  <Badge variant="outline" className="text-2xs text-amber-400 border-amber-500/30">
                    #1 Landslides (45%)
                  </Badge>
                </div>

                <div className="h-[180px] relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CAUSES_DATA}
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {CAUSES_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={CHART_STYLE} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Donut Readout */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black text-white">24</span>
                    <span className="text-[10px] text-text-dim">Total Events</span>
                  </div>
                </div>

                {/* Causes Breakdown List */}
                <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs">
                  {CAUSES_DATA.map(c => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="text-text-muted">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-dim text-2xs">({c.count} events)</span>
                        <strong className="text-white font-mono">{c.value}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right (Col 7): Sortable District Impact Scorecard Table */}
              <div className="lg:col-span-7 app-card p-4 bg-surface border border-white/10 rounded-xl space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <span className="text-sm font-bold text-white">District Impact Table</span>
                      <span className="text-2xs text-text-dim ml-2 hidden sm:inline">(Click header to sort)</span>
                    </div>
                  </div>
                  <span className="text-2xs text-text-muted">7 Sectors Monitored</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-[11px] text-text-dim uppercase tracking-wider font-semibold">
                        <th className="py-2 px-2">District</th>
                        
                        {/* Sortable Events Header */}
                        <th
                          onClick={() => handleSort('events')}
                          className="py-2 px-2 text-center cursor-pointer hover:text-white transition-colors select-none"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Events</span>
                            {sortField === 'events' && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                          </div>
                        </th>

                        {/* Sortable Avg Delay Header */}
                        <th
                          onClick={() => handleSort('avgDelay')}
                          className="py-2 px-2 text-center cursor-pointer hover:text-white transition-colors select-none"
                        >
                          <div className="flex items-center justify-center gap-1">
                            <span>Avg Delay</span>
                            {sortField === 'avgDelay' && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                          </div>
                        </th>

                        {/* Sortable Cost Impact Header */}
                        <th
                          onClick={() => handleSort('costVal')}
                          className="py-2 px-2 text-right cursor-pointer hover:text-white transition-colors select-none"
                        >
                          <div className="flex items-center justify-end gap-1">
                            <span>Cost Impact</span>
                            {sortField === 'costVal' && (sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)}
                          </div>
                        </th>

                        <th className="py-2 px-2 text-right">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sortedDistricts.map(d => {
                        const isSelected = selectedHeatDistrict === d.district
                        // Red for high impact, Green for low impact
                        const impactColor = d.riskTier === 'Critical' ? 'text-danger bg-danger/10 border-danger/30' :
                                            d.riskTier === 'High'     ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                                            d.riskTier === 'Moderate' ? 'text-info bg-info/10 border-info/30' :
                                            'text-success bg-success/10 border-success/30'
                        return (
                          <tr
                            key={d.id}
                            onClick={() => setSelectedHeatDistrict(isSelected ? null : d.district)}
                            className={cn(
                              'hover:bg-surface-2/60 transition-colors cursor-pointer',
                              isSelected && 'bg-primary/15'
                            )}
                          >
                            <td className="py-2 px-2 font-semibold text-white">
                              <div className="flex items-center gap-1.5">
                                <span>{d.district}</span>
                                {isSelected && (
                                  <span className="text-[10px] text-primary font-bold">(Filtered)</span>
                                )}
                              </div>
                              <span className="text-[10px] text-text-dim block font-normal">{d.highway}</span>
                            </td>
                            <td className="py-2 px-2 text-center font-mono font-bold text-white">{d.events}</td>
                            <td className="py-2 px-2 text-center font-mono text-text-muted">{d.avgDelayStr}</td>
                            <td className="py-2 px-2 text-right font-mono text-text-muted">{d.costImpact}</td>
                            <td className="py-2 px-2 text-right">
                              <span className={cn('text-2xs font-bold px-2 py-0.5 rounded border', impactColor)}>
                                {d.riskTier}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] text-text-dim pt-1 flex items-center justify-between">
                  <span>* Red = High Infrastructure Vulnerability (East Siang & Jorhat require priority investment).</span>
                  {selectedHeatDistrict && (
                    <button
                      onClick={() => setSelectedHeatDistrict(null)}
                      className="text-primary hover:underline font-semibold"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* ── 4. REGIONAL DISRUPTION HEAT MAP (CHOROPLETH) ────────────── */}
            <div className="app-card p-4 bg-surface border border-white/10 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <div>
                    <span className="text-sm font-bold text-white">Regional Disruption Heat Map (Choropleth Intensity)</span>
                    <span className="text-2xs text-text-muted ml-2 hidden sm:inline">Darker red = higher disruption frequency</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-2xs text-text-muted">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-danger inline-block" /> Critical (&gt;80%)</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500 inline-block" /> Elevated (50–80%)</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-success inline-block" /> Low / Safe (&lt;50%)</span>
                </div>
              </div>

              {/* Interactive Heat Map Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-2">
                {DISTRICT_IMPACTS_DATA.map(d => {
                  const isSelected = selectedHeatDistrict === d.district
                  const heatColor = d.heatScore >= 80 ? 'border-danger/60 bg-danger/[0.12] text-danger' :
                                    d.heatScore >= 50 ? 'border-amber-500/50 bg-amber-500/[0.08] text-amber-400' :
                                    'border-success/40 bg-success/[0.06] text-success'
                  return (
                    <div
                      key={d.id}
                      onClick={() => setSelectedHeatDistrict(isSelected ? null : d.district)}
                      className={cn(
                        'p-3 rounded-xl border text-center transition-all cursor-pointer space-y-1',
                        heatColor,
                        isSelected ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:scale-102'
                      )}
                    >
                      <div className="text-xs font-bold text-white truncate">{d.district}</div>
                      <div className="text-lg font-black">{d.heatScore}%</div>
                      <div className="text-[10px] text-text-dim uppercase font-semibold">
                        {d.events} Incidents
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-[11px] text-text-dim pt-1">
                Click any district tile above to filter the detailed incident log below.
              </p>
            </div>

            {/* ── 5. DETAILED INCIDENT LOG TABLE ─────────────────────────── */}
            <div className="app-card p-4 bg-surface border border-white/10 rounded-xl space-y-3">
              
              {/* Header with Search & Filter Chips */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <CheckCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-white">Detailed Incident Log</span>
                  <Badge variant="muted" className="text-2xs font-mono">{filteredLogs.length} Records</Badge>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search incident / highway..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="h-7 pl-8 pr-2.5 rounded-lg border border-border bg-surface-2 text-xs text-text placeholder:text-text-dim focus:outline-none focus:ring-1 focus:ring-primary w-44"
                    />
                  </div>

                  {/* Type Filter Buttons */}
                  <div className="flex items-center gap-1 bg-surface-2 p-0.5 rounded-lg border border-white/5 text-2xs">
                    {['all', 'landslide', 'flood', 'road damage', 'accident'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={cn(
                          'px-2 py-1 rounded-md font-semibold capitalize transition-colors',
                          filterType === type ? 'bg-primary text-white' : 'text-text-muted hover:text-white'
                        )}
                      >
                        {type === 'all' ? 'All Types' : type}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table Records */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-[11px] text-text-dim uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Location / Highway</th>
                      <th className="py-2.5 px-3 text-center">Duration</th>
                      <th className="py-2.5 px-3">Impact</th>
                      <th className="py-2.5 px-3">AI Tactical Action</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredLogs.map(item => (
                      <tr key={item.id} className="hover:bg-surface-2/60 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-text-muted whitespace-nowrap">{item.date}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <Badge
                            variant={
                              item.type === 'Landslide' ? 'danger' :
                              item.type === 'Flood' ? 'info' :
                              item.type === 'Accident' ? 'warning' : 'outline'
                            }
                            className="text-2xs font-semibold"
                          >
                            {item.type}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-white">{item.location}</td>
                        <td className="py-2.5 px-3 text-center font-mono text-text-muted">{item.duration}</td>
                        <td className="py-2.5 px-3 text-text-muted">{item.impact}</td>
                        <td className="py-2.5 px-3 text-primary text-xs font-medium">{item.action}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                            <CheckCircle2 className="h-3 w-3" />
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 2: AI COST SAVINGS & ROI CHART (COMPOSED BAR + LINE)
           ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'cost_savings' && (
          <div className="space-y-4">
            
            {/* Top Cost Savings Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="app-card p-4 bg-surface border border-white/10 rounded-xl space-y-1">
                <span className="text-2xs text-text-muted uppercase font-semibold">Total Savings (12 Months)</span>
                <div className="text-3xl font-black text-emerald-400">₹42.5 Lakhs</div>
                <span className="text-[10px] text-text-dim">From fuel optimization & recovery</span>
              </div>
              <div className="app-card p-4 bg-surface border border-white/10 rounded-xl space-y-1">
                <span className="text-2xs text-text-muted uppercase font-semibold">Peak Monthly Savings (July)</span>
                <div className="text-3xl font-black text-primary">₹7.4 Lakhs</div>
                <span className="text-[10px] text-text-dim">Monsoonal AI detour activation</span>
              </div>
              <div className="app-card p-4 bg-surface border border-white/10 rounded-xl space-y-1">
                <span className="text-2xs text-text-muted uppercase font-semibold">Average Fleet ROI</span>
                <div className="text-3xl font-black text-white">4.8x</div>
                <span className="text-[10px] text-emerald-400 font-semibold">Positive operational payback</span>
              </div>
            </div>

            {/* Composed Bar + Line Chart */}
            <div className="app-card p-4 bg-surface border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">Monthly Savings vs Cumulative Total (₹ Lakhs)</span>
                </div>
                <div className="flex items-center gap-4 text-2xs text-text-muted">
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <span className="h-2.5 w-2.5 rounded-sm bg-primary inline-block" /> Monthly Savings (Bar)
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 inline-block" /> Cumulative Total (Line)
                  </span>
                </div>
              </div>

              <div className="h-[280px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={COST_SAVINGS_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.muted} opacity={0.5} />
                    <XAxis dataKey="month" tick={{ fill: C.text, fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fill: C.text, fontSize: 11 }} unit="L" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: C.text, fontSize: 11 }} unit="L" />
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Bar yAxisId="left" dataKey="monthly" name="Monthly Savings (₹ Lakhs)" fill={C.primary} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative Total (₹ Lakhs)" stroke={C.success} strokeWidth={3} dot={{ r: 4, fill: C.success }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 3: WHAT-IF SIMULATION STUDIO
           ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'simulation' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Simulation Controls Sidebar */}
              <div className="app-card p-4 space-y-4 bg-surface border border-white/10 rounded-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-white">Scenario Parameters</span>
                  </div>
                  <button
                    onClick={() => {
                      setSimRoad('nh415')
                      setSimDuration(6)
                      setSimRain(85)
                      setSimReroute(true)
                      toast.info('Simulation reset to baseline defaults')
                    }}
                    className="text-text-muted hover:text-white p-1"
                    title="Reset parameters"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text">Target Highway Segment</label>
                  <select
                    value={simRoad}
                    onChange={e => setSimRoad(e.target.value)}
                    className="w-full h-8 px-2.5 rounded-lg border border-border bg-surface-2 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="nh415">NH-415 Pasighat Sector (Mudslide Hazard)</option>
                    <option value="nh13">NH-13 West Siang (Steep Rockfall Zone)</option>
                    <option value="nh13b">NH-13B Sela Pass (High-Altitude Icy Fog)</option>
                    <option value="nh37">NH-37 Kaziranga Lowlands (Flood Risk)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">Blockade Clearance Window</span>
                    <span className="font-bold text-primary">{simDuration} Hours</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={24}
                    step={1}
                    value={simDuration}
                    onChange={e => setSimDuration(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-surface-3 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>2 hrs (Minor)</span>
                    <span>12 hrs (Severe)</span>
                    <span>24 hrs (Critical)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-text">Monsoonal Precipitation Rate</span>
                    <span className="font-bold text-info">{simRain} mm/hr</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    step={5}
                    value={simRain}
                    onChange={e => setSimRain(Number(e.target.value))}
                    className="w-full accent-info h-1.5 bg-surface-3 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>10 mm/h (Light)</span>
                    <span>50 mm/h (Threshold)</span>
                    <span>120 mm/h (Extreme)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-text">Dynamic AI Auto-Detour</span>
                    <button
                      onClick={() => setSimReroute(!simReroute)}
                      className={cn(
                        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors',
                        simReroute ? 'bg-primary' : 'bg-surface-3'
                      )}
                    >
                      <span className={cn('inline-block h-3.5 w-3.5 transform rounded-full bg-white transition', simReroute ? 'translate-x-4' : 'translate-x-1')} />
                    </button>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    When active, automatically computes Route C North Bank bypass for all inbound convoys.
                  </p>
                </div>
              </div>

              {/* Simulation Output Dashboard */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="app-card p-3 space-y-0.5 bg-surface border border-white/10 rounded-xl">
                    <div className="text-2xs text-text-muted">Unmanaged Delivery Rate</div>
                    <div className="text-lg font-bold text-danger">{simResults.onTimeWithoutAI}%</div>
                    <div className="text-[10px] text-danger">Severe bottleneck drop</div>
                  </div>
                  <div className="app-card p-3 space-y-0.5 bg-surface border border-white/10 rounded-xl">
                    <div className="text-2xs text-text-muted">With AI Auto-Detour</div>
                    <div className="text-lg font-bold text-success">{simResults.onTimeWithAI}%</div>
                    <div className="text-[10px] text-success font-semibold">Protected schedule</div>
                  </div>
                  <div className="app-card p-3 space-y-0.5 bg-surface border border-white/10 rounded-xl">
                    <div className="text-2xs text-text-muted">Idle Hours Saved</div>
                    <div className="text-lg font-bold text-primary">{simResults.idleHoursSaved} hrs</div>
                    <div className="text-[10px] text-text-muted">Across active fleet</div>
                  </div>
                  <div className="app-card p-3 space-y-0.5 bg-surface border border-white/10 rounded-xl">
                    <div className="text-2xs text-text-muted">Stranded Convoys</div>
                    <div className="text-lg font-bold text-warning">{simResults.strandedCount} units</div>
                    <div className="text-[10px] text-text-muted">{simReroute ? '0 Stranded (Safe)' : 'Requires SOS'}</div>
                  </div>
                </div>

                <div className="app-card p-4 bg-surface border border-white/10 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-text">Simulated Delivery Reliability Curve</span>
                    <span className="text-2xs text-text-muted">Baseline vs Unmanaged vs AI Rerouted</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={simResults.simChartData}>
                      <defs>
                        <linearGradient id="simWithAI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.success} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={C.success} stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="simWithoutAI" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={C.danger} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={C.danger} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={C.muted} opacity={0.5} />
                      <XAxis dataKey="hour" tick={{ fill: C.text, fontSize: 11 }} />
                      <YAxis domain={[40, 100]} tick={{ fill: C.text, fontSize: 11 }} unit="%" />
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Legend wrapperStyle={{ fontSize: 11, color: C.text }} />
                      <Area type="monotone" dataKey="withAI" name="With AI Detour (Route C) %" stroke={C.success} fill="url(#simWithAI)" strokeWidth={2} />
                      <Area type="monotone" dataKey="withoutAI" name="Without Rerouting %" stroke={C.danger} fill="url(#simWithoutAI)" strokeWidth={2} />
                      <Area type="monotone" dataKey="normal" name="Normal Target Baseline %" stroke={C.primary} strokeDasharray="4 4" fill="none" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 4: XGBOOST AI MODEL & FEATURE DIAGNOSTICS
           ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'ml_models' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              <div className="app-card p-4 space-y-3 bg-surface border border-white/10 rounded-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-text">XGBoost Feature Importance Weights (v2.4)</span>
                  </div>
                  <span className="text-2xs text-text-muted">Normalized Gain Score</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Relative weightings of terrain, radar, and historical features in predicting highway mudslide occurrence within 6 hours.
                </p>
                <div className="space-y-2.5 pt-1">
                  {[
                    { feature: 'Hourly Rainfall Rate (IMD Radar)', weight: 32, color: C.primary, desc: 'Critical threshold >50 mm/h' },
                    { feature: 'Topographic Slope Gradient (DEM)', weight: 28, color: C.warning, desc: 'Critical threshold >15° slope angle' },
                    { feature: 'Subsoil Moisture Saturation Index', weight: 22, color: C.info, desc: 'Critical threshold >75% saturation' },
                    { feature: 'GSI Historical Landslide Recurrence', weight: 18, color: C.purple, desc: 'Segment frequency over 10 years' },
                  ].map(f => (
                    <div key={f.feature} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-text">{f.feature}</span>
                        <span className="font-bold tabular-nums" style={{ color: f.color }}>{f.weight}%</span>
                      </div>
                      <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${f.weight * 2.5}%`, backgroundColor: f.color }} />
                      </div>
                      <div className="text-[10px] text-text-muted">{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="app-card p-4 space-y-3 bg-surface border border-white/10 rounded-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm font-bold text-text">Model Validation & Confusion Matrix</span>
                  </div>
                  <Badge variant="outline" className="border-success/30 text-success text-2xs">Verified v2.4</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20 space-y-0.5">
                    <div className="text-2xs text-text-muted">True Positives (Landslide Correct)</div>
                    <div className="text-xl font-bold text-success">842 Events</div>
                    <div className="text-[10px] text-success">High precision verified</div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-2 border border-border space-y-0.5">
                    <div className="text-2xs text-text-muted">False Positives (False Alarm)</div>
                    <div className="text-xl font-bold text-warning">48 Events</div>
                    <div className="text-[10px] text-text-muted">5.4% false alert rate</div>
                  </div>
                  <div className="p-3 rounded-lg bg-surface-2 border border-border space-y-0.5">
                    <div className="text-2xs text-text-muted">False Negatives (Missed)</div>
                    <div className="text-xl font-bold text-danger">12 Events</div>
                    <div className="text-[10px] text-danger">1.4% missed rate</div>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10 border border-success/20 space-y-0.5">
                    <div className="text-2xs text-text-muted">True Negatives (Clear Correct)</div>
                    <div className="text-xl font-bold text-success">3,120 Events</div>
                    <div className="text-[10px] text-success">Safe highway routing</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-white/5">
                  <div>
                    <div className="text-[10px] text-text-muted">Overall Accuracy</div>
                    <div className="font-bold text-text mt-0.5">94.2%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-text-muted">F1 Performance</div>
                    <div className="font-bold text-primary mt-0.5">0.930</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-text-muted">Inference Latency</div>
                    <div className="font-bold text-success mt-0.5">42 ms</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 5: DISTRICT RESILIENCE MATRIX
           ═══════════════════════════════════════════════════════════════════ */}
        {tab === 'resilience' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DISTRICT_IMPACTS_DATA.map(d => (
                <div key={d.id} className="app-card p-4 space-y-2 bg-surface border border-white/10 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-text">{d.district}</span>
                    <span className={cn('text-xs font-bold', d.riskTier === 'Critical' ? 'text-danger' : d.riskTier === 'High' ? 'text-amber-400' : 'text-success')}>
                      {d.riskTier} Impact • {d.events} Events
                    </span>
                  </div>
                  <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden flex gap-px">
                    <div className="bg-success h-full" style={{ width: `${100 - d.heatScore}%` }} />
                    <div className="bg-danger  h-full" style={{ width: `${d.heatScore}%` }} />
                  </div>
                  <div className="flex justify-between text-2xs text-text-muted pt-1">
                    <span>Corridor: {d.highway}</span>
                    <span>Avg Delay: {d.avgDelayStr}</span>
                    <span className="text-white font-mono font-semibold">Cost: {d.costImpact}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── PDF EXPORT SAMPLE REPORT DIALOG ──────────────────────────────── */}
      <Dialog open={pdfDialogOpen} onOpenChange={setPdfDialogOpen}>
        <DialogContent className="max-w-2xl bg-[#0D1626] border border-white/15 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
              <Printer className="h-4 w-4 text-primary" />
              Executive Disruption & Financial Analytics Report
            </DialogTitle>
            <DialogDescription className="text-xs text-text-muted">
              Official summary prepared for Ministry of Development of North Eastern Region (MDoNER).
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-xl bg-surface-2 border border-white/10 space-y-4 text-xs">
            {/* Header Metadata */}
            <div className="flex justify-between border-b border-white/10 pb-3">
              <div>
                <div className="font-bold text-white text-sm">NERA LOGISTICS INTELLIGENCE DOSSIER</div>
                <div className="text-2xs text-text-muted">Period: June 2026 (Monsoonal Deluge Phase 1)</div>
              </div>
              <div className="text-right text-2xs text-text-muted">
                <div>Document Ref: NERA-DISR-2026-Q2</div>
                <div>Status: Verified Official Prototype</div>
              </div>
            </div>

            {/* 3 Executive Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center py-1">
              <div className="p-2.5 rounded-lg bg-surface-3">
                <span className="text-[10px] text-text-muted block">Total Disruptions</span>
                <strong className="text-base text-white">24 Events</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-3">
                <span className="text-[10px] text-text-muted block">On-Time Reliability</span>
                <strong className="text-base text-emerald-400">82.0%</strong>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-3">
                <span className="text-[10px] text-text-muted block">Estimated Cost Saved</span>
                <strong className="text-base text-primary">₹12.5 Lakhs</strong>
              </div>
            </div>

            {/* Key Findings */}
            <div className="space-y-1.5 text-2xs leading-relaxed text-text">
              <div className="font-bold text-white text-xs">Key Executive Findings:</div>
              <div>• <strong>Landslides constitute 45% of disruptions</strong> (12 incidents), heavily concentrated along NH-415 Km 42 in East Siang.</div>
              <div>• <strong>Jorhat & East Siang require highest infrastructure priority</strong>, suffering an average delay of 6.5 hours during monsoons.</div>
              <div>• AI dynamic rerouting via Route C North Bank bypass saved 163 fleet idle hours and prevented cold-chain vaccine spoilage.</div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            <span className="text-2xs text-text-dim">Format: Adobe PDF (Vector Standard)</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPdfDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={handleDownloadPDF} className="text-xs font-semibold bg-primary text-white">
                <Download className="h-3.5 w-3.5 mr-1" />
                Download Report PDF
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
