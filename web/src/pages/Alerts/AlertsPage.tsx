import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, CheckCheck, MapPin, Navigation, AlertOctagon, Filter,
  ArrowLeft, ShieldAlert, Sparkles, Compass, Download, ShieldCheck,
  Search, XCircle, AlertTriangle, Cpu, Radio, Cloud, RotateCcw,
  Layers, ChevronRight, ArrowRight, Activity, Truck, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { AlertCard }  from '@/components/cards/AlertCard'
import { Button }     from '@/components/ui/button'
import { Select }     from '@/components/ui/select'
import { Badge }      from '@/components/ui/badge'
import { Tabs }       from '@/components/ui/tabs'
import { MapEngine }  from '@/modules/map/MapEngine'
import { DemoControl } from '@/components/demo/DemoControl'
import { useAlertStore } from '@/stores/alertStore'
import { useMapStore }   from '@/stores/mapStore'
import { useVehicleStore } from '@/stores/vehicleStore'
import type { LogisticsAlert } from '@/types'
import { cn } from '@/utils/cn'
import { timeAgo } from '@/utils/format'

// Module-level stable selectors
const selAllAlerts     = (s: ReturnType<typeof useAlertStore.getState>) => s.alerts
const selAck           = (s: ReturnType<typeof useAlertStore.getState>) => s.acknowledgeAlert
const selResolve       = (s: ReturnType<typeof useAlertStore.getState>) => s.resolveAlert
const selUpdate        = (s: ReturnType<typeof useAlertStore.getState>) => s.updateAlert
const selFilter        = (s: ReturnType<typeof useAlertStore.getState>) => s.filter
const selSetFilter     = (s: ReturnType<typeof useAlertStore.getState>) => s.setFilter
const selFlyTo         = (s: ReturnType<typeof useMapStore.getState>)   => s.flyTo
const selCritical      = (s: ReturnType<typeof useAlertStore.getState>) => s.alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length
const selWarning       = (s: ReturnType<typeof useAlertStore.getState>) => s.alerts.filter(a => a.severity === 'warning'  && a.status !== 'resolved').length
const selActive        = (s: ReturnType<typeof useAlertStore.getState>) => s.alerts.filter(a => a.status === 'active').length
const selResolved      = (s: ReturnType<typeof useAlertStore.getState>) => s.alerts.filter(a => a.status === 'resolved').length

const SOURCE_OPTIONS = [
  { value: 'all',     label: 'All Sources' },
  { value: 'AI',      label: 'AI Prediction Engine' },
  { value: 'FIELD',   label: 'Field Officer Radios' },
  { value: 'GPS',     label: 'GPS Fleet Telemetry' },
  { value: 'WEATHER', label: 'IMD Doppler Radar' },
  { value: 'SYSTEM',  label: 'System Diagnostics' },
]

export function AlertsPage() {
  const navigate = useNavigate()
  const allAlerts        = useAlertStore(selAllAlerts)
  const acknowledgeAlert = useAlertStore(selAck)
  const resolveAlert     = useAlertStore(selResolve)
  const updateAlert      = useAlertStore(selUpdate)
  const filterSource     = useAlertStore(selFilter).source
  const setFilter        = useAlertStore(selSetFilter)
  const flyTo            = useMapStore(selFlyTo)
  const vehicles         = useVehicleStore(s => s.vehicles)
  const criticalCount    = useAlertStore(selCritical)
  const warningCount     = useAlertStore(selWarning)
  const activeCount      = useAlertStore(selActive)
  const resolvedCount    = useAlertStore(selResolved)

  const [tab,           setTab]           = useState('active')
  const [mobileTab,     setMobileTab]     = useState<'list' | 'detail'>('list')
  const [selectedAlert, setSelectedAlert] = useState<LogisticsAlert | null>(allAlerts.find(a => a.severity === 'critical') ?? allAlerts[0] ?? null)
  const [mapVisible,    setMapVisible]    = useState(true)
  const [searchQuery,   setSearchQuery]   = useState('')

  const filteredAlerts = useMemo(() => {
    return allAlerts.filter(a => {
      if (tab === 'active'   && a.status !== 'active') return false
      if (tab === 'critical' && (a.severity !== 'critical' || a.status === 'resolved')) return false
      if (tab === 'resolved' && a.status !== 'resolved') return false
      if (filterSource !== 'all' && a.source !== filterSource) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (!a.title.toLowerCase().includes(q) &&
            !a.description.toLowerCase().includes(q) &&
            !(a.locationName ?? '').toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [allAlerts, tab, filterSource, searchQuery])

  const handleViewMap = useCallback((a: LogisticsAlert) => {
    setSelectedAlert(a)
    setMobileTab('detail')
    if (a.location) flyTo(a.location, 12)
  }, [flyTo])

  const handleEscalate = useCallback((alert: LogisticsAlert) => {
    updateAlert(alert.id, { severity: 'critical', status: 'active' })
    toast.error(`Escalated to High Priority: ${alert.title}`, {
      description: 'Emergency response command notified. Priority rerouting enforced.'
    })
  }, [updateAlert])

  const acknowledgeAll = useCallback(() => {
    allAlerts.filter(a => a.status === 'active').forEach(a => acknowledgeAlert(a.id))
    toast.success('All active alerts acknowledged')
  }, [allAlerts, acknowledgeAlert])

  const handleExportCSV = () => {
    let csv = '=== NER LOGISTICS - INCIDENT & ALERT DOSSIER ===\n'
    csv += `Export Timestamp: ${new Date().toISOString()}\n\n`
    csv += 'ID,Severity,Status,Source,Title,Description,Location,Latitude,Longitude,AIRiskScore,Timestamp\n'
    allAlerts.forEach(a => {
      csv += `"${a.id}","${a.severity}","${a.status}","${a.source}","${a.title}","${a.description}","${a.locationName ?? ''}",${a.location?.lat ?? ''},${a.location?.lng ?? ''},${a.aiRiskScore ?? ''},"${a.timestamp}"\n`
    })

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `NER_Incident_Log_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Alert & incident dossier downloaded as CSV')
  }

  const TABS = [
    { id: 'all',      label: 'All Incidents' },
    { id: 'active',   label: `Active (${activeCount})` },
    { id: 'critical', label: `Critical (${criticalCount})` },
    { id: 'resolved', label: `Resolved (${resolvedCount})` },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between px-3 md:px-5 py-2.5 border-b border-border flex-shrink-0 bg-surface gap-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-danger/10 border border-danger/30 text-danger flex items-center justify-center flex-shrink-0">
            <Bell className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-text truncate">Alert Command & Incident Stream</h1>
              {criticalCount > 0 && (
                <span className="badge-critical text-2xs font-bold animate-pulse">
                  {criticalCount} CRITICAL
                </span>
              )}
            </div>
            <p className="text-2xs text-text-muted">Multi-sensor telemetry, field officer reports & real-time detour dispatch</p>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex md:hidden items-center justify-between gap-1 bg-surface-3 p-1 rounded-xl border border-border">
          <button
            onClick={() => setMobileTab('list')}
            className={cn(
              'flex-1 py-1 px-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5',
              mobileTab === 'list' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'
            )}
          >
            <Bell className="h-3 w-3" /> Incidents ({filteredAlerts.length})
          </button>
          <button
            onClick={() => setMobileTab('detail')}
            className={cn(
              'flex-1 py-1 px-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5',
              mobileTab === 'detail' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'
            )}
          >
            <Compass className="h-3 w-3" /> Triage & GIS
          </button>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={acknowledgeAll} className="h-8 text-xs font-semibold">
            <CheckCheck className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Ack All</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMapVisible(!mapVisible)}
            className="h-8 text-xs font-semibold"
          >
            <MapPin className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">{mapVisible ? 'Hide Map' : 'Show Map'}</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportCSV} className="h-8 text-xs font-semibold">
            <Download className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <DemoControl />
        </div>
      </div>

      {/* ── MAIN WORKSPACE ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── LEFT: Alert List & Filters ────────────────────────────────────── */}
        <div className={cn(
          'w-full md:w-[420px] lg:w-[460px] flex-shrink-0 md:border-r border-border bg-surface flex-col overflow-hidden',
          mobileTab === 'list' ? 'flex' : 'hidden md:flex'
        )}>
          {/* Search, Tabs + Source Filter */}
          <div className="p-3 space-y-2.5 border-b border-border flex-shrink-0 bg-surface">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <input
                type="text"
                placeholder="Search incidents, highways, districts…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 rounded-lg border border-border bg-surface-2 text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Tabs tabs={TABS} active={tab} onChange={setTab} variant="pill" />
            <Select options={SOURCE_OPTIONS} value={filterSource} onChange={e => setFilter({ source: e.target.value })} />
          </div>

          {/* Alerts List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12 app-card p-6">
                <Bell className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-text">No Incidents Found</p>
                <p className="text-2xs text-text-muted mt-1">No alerts match the active search and filters.</p>
              </div>
            ) : (
              filteredAlerts.map(a => (
                <div
                  key={a.id}
                  onClick={() => { setSelectedAlert(a); setMobileTab('detail') }}
                  className="cursor-pointer"
                >
                  <AlertCard
                    alert={a}
                    selected={selectedAlert?.id === a.id}
                    onAcknowledge={acknowledgeAlert}
                    onResolve={resolveAlert}
                    onViewMap={handleViewMap}
                    onEscalate={handleEscalate}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT: Alert Detail Triage + Interactive GIS Map ──────────────── */}
        <div className={cn(
          'w-full md:w-auto flex-1 flex-col overflow-hidden bg-background',
          mobileTab === 'detail' ? 'flex' : 'hidden md:flex'
        )}>
          {/* Selected Alert Hero Triage Banner */}
          {selectedAlert ? (
            <div className={cn(
              "p-3.5 md:p-4 border-b border-border bg-surface flex-shrink-0 shadow-sm space-y-2.5 transition-all",
              selectedAlert.severity === 'critical' ? 'border-b-danger/40' :
              selectedAlert.severity === 'warning' ? 'border-b-warning/35' :
              'border-b-info/30'
            )}>
              {/* Row 1: Title, Status Badge, Live Dot & Tactical Action Buttons */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn(
                    'p-2 rounded-lg border flex-shrink-0',
                    selectedAlert.severity === 'critical' ? 'bg-danger/15 border-danger/30 text-danger' :
                    selectedAlert.severity === 'warning' ? 'bg-warning/15 border-warning/30 text-warning' :
                    'bg-info/15 border-info/30 text-info'
                  )}>
                    <AlertOctagon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-sm md:text-base font-bold text-text leading-tight truncate">
                        {selectedAlert.title}
                      </h2>
                      <Badge
                        variant={selectedAlert.severity === 'critical' ? 'danger' : selectedAlert.severity === 'warning' ? 'warning' : 'info'}
                        className="text-2xs uppercase font-bold px-1.5 py-0"
                      >
                        {selectedAlert.severity}
                      </Badge>
                      <span className={cn(
                        'flex items-center gap-1 text-2xs font-semibold',
                        selectedAlert.status === 'active' ? 'text-danger' :
                        selectedAlert.status === 'acknowledged' ? 'text-warning' :
                        'text-success'
                      )}>
                        <span className={cn(
                          'status-dot',
                          selectedAlert.status === 'active' ? 'status-dot-red animate-status-pulse' :
                          selectedAlert.status === 'acknowledged' ? 'status-dot-amber' :
                          'status-dot-green'
                        )} />
                        {selectedAlert.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tactical Actions Suite */}
                <div className="flex items-center gap-1.5 flex-shrink-0 self-end lg:self-center flex-wrap">
                  {selectedAlert.status === 'active' && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs font-semibold"
                        onClick={() => {
                          acknowledgeAlert(selectedAlert.id)
                          toast.success('Incident Acknowledged')
                        }}
                      >
                        <CheckCheck className="h-3 w-3 mr-1" />
                        Acknowledge
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-semibold border-danger/30 text-danger hover:bg-danger/10"
                        onClick={() => handleEscalate(selectedAlert)}
                      >
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        Escalate
                      </Button>

                      <Button
                        size="sm"
                        className="h-7 text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm"
                        onClick={() => {
                          acknowledgeAlert(selectedAlert.id)
                          navigate('/routes')
                          toast.success('Bypass Route C Loaded', {
                            description: 'Alternative safe corridor dispatched to affected convoys.'
                          })
                        }}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Dispatch Auto-Detour
                      </Button>
                    </>
                  )}

                  {selectedAlert.status !== 'resolved' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        resolveAlert(selectedAlert.id)
                        toast.success('Incident resolved and corridor marked clear')
                      }}
                      className="h-7 text-xs font-semibold text-text-muted hover:text-success hover:bg-success/10"
                    >
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>

              {/* Row 2: Clean Incident Description */}
              <p className="text-xs text-text-muted leading-relaxed pl-0 lg:pl-10">
                {selectedAlert.description}
              </p>

              {/* Row 3: Cohesive Telemetry & Telematics Metadata Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50 text-2xs">
                {selectedAlert.locationName && (
                  <span className="bg-surface-2 px-2 py-0.5 rounded-md border border-border text-text font-medium flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" />
                    {selectedAlert.locationName}
                  </span>
                )}

                {selectedAlert.location && (
                  <span className="bg-surface-2 px-2 py-0.5 rounded-md border border-border text-text-muted">
                    GPS: <span className="text-text font-medium">{selectedAlert.location.lat.toFixed(3)}°N, {selectedAlert.location.lng.toFixed(3)}°E</span>
                  </span>
                )}

                {selectedAlert.aiRiskScore != null && (
                  <span className={cn(
                    'font-bold px-2 py-0.5 rounded-md border',
                    selectedAlert.aiRiskScore >= 75
                      ? 'bg-danger/15 text-danger border-danger/30'
                      : 'bg-warning/15 text-warning border-warning/30'
                  )}>
                    AI Hazard Risk: {selectedAlert.aiRiskScore}%
                  </span>
                )}

                <span className="bg-surface-2 px-2 py-0.5 rounded-md border border-border text-text-muted">
                  Source: <strong className="text-text">{selectedAlert.source}</strong>
                </span>

                {selectedAlert.affectedVehicles && selectedAlert.affectedVehicles.length > 0 && (
                  <span className="bg-warning/15 text-warning px-2 py-0.5 rounded-md border border-warning/30 font-bold flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    {selectedAlert.affectedVehicles.length} Active Convoys Impacted
                  </span>
                )}

                <span className="text-text-dim ml-auto text-2xs flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {timeAgo(selectedAlert.timestamp)}
                </span>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center justify-between px-4 py-2.5 bg-surface-2 border-b border-border text-2xs text-text-muted flex-shrink-0">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Select an incident from the stream to view tactical GIS coordinates and automated intervention tools.
              </span>
              <span className="text-text-subtle">GIS Map Ready</span>
            </div>
          )}

          {/* Interactive GIS Map Viewport */}
          {mapVisible && (
            <div className="flex-1 relative overflow-hidden">
              <MapEngine
                layers={['roads', 'alerts', 'vehicles']}
                onAlertClick={handleViewMap}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
