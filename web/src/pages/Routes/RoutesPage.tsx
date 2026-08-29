import { useState, useCallback } from 'react'
import {
  Navigation, Cpu, CheckCircle, Compass, Sparkles, MapPin, Layers, Send, Mountain, TableProperties,
  Award, Clock
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { MapEngine }             from '@/modules/map/MapEngine'
import { RouteCard }             from '@/components/cards/RouteCard'
import { RiskCard }              from '@/components/cards/RiskCard'
import { RouteWhyPanel }         from '@/components/ai/RouteWhyPanel'
import { ElevationProfile }      from '@/modules/routing/ElevationProfile'
import { RouteComparisonMatrix } from '@/modules/routing/RouteComparisonMatrix'
import { Button }                from '@/components/ui/button'
import { Select }                from '@/components/ui/select'
import { Badge }                 from '@/components/ui/badge'
import { Tabs }                  from '@/components/ui/tabs'
import { DemoControl }           from '@/components/demo/DemoControl'
import { useRouteStore }         from '@/stores/routeStore'
import { mockPredictions }       from '@/mock/predictions'
import { mockWeather }           from '@/mock/weather'
import { weatherIcon }           from '@/utils/format'
import type { RouteOption }      from '@/types'

// ── Module-level stable selectors ─────────────────────────────────────────────
const selRouteOptions  = (s: ReturnType<typeof useRouteStore.getState>) => s.routeOptions
const selSelectedId    = (s: ReturnType<typeof useRouteStore.getState>) => s.selectedRouteId
const selSelectRoute   = (s: ReturnType<typeof useRouteStore.getState>) => s.selectRoute
const selOrigin        = (s: ReturnType<typeof useRouteStore.getState>) => s.plannerOrigin
const selDest          = (s: ReturnType<typeof useRouteStore.getState>) => s.plannerDestination
const selCargo         = (s: ReturnType<typeof useRouteStore.getState>) => s.plannerCargo
const selPriority      = (s: ReturnType<typeof useRouteStore.getState>) => s.plannerPriority
const selSetForm       = (s: ReturnType<typeof useRouteStore.getState>) => s.setPlannerForm
const selCalculate     = (s: ReturnType<typeof useRouteStore.getState>) => s.calculateRoutes
const selCalculating   = (s: ReturnType<typeof useRouteStore.getState>) => s.isCalculating

const DISTRICT_OPTIONS = [
  { value: 'Guwahati',   label: 'Guwahati' },
  { value: 'Jorhat',     label: 'Jorhat' },
  { value: 'Dibrugarh',  label: 'Dibrugarh' },
  { value: 'East Siang', label: 'East Siang' },
  { value: 'Itanagar',   label: 'Itanagar' },
  { value: 'Tawang',     label: 'Tawang' },
  { value: 'Shillong',   label: 'Shillong' },
]
const CARGO_OPTIONS = [
  { value: 'Medical Supplies',   label: 'Medical Supplies & Vaccines' },
  { value: 'Food Grains',        label: 'Food Grains & Rations' },
  { value: 'Water Purification', label: 'Water Purification Units' },
  { value: 'Fuel',               label: 'POL / Diesel Fuel' },
  { value: 'Construction',       label: 'Heavy Construction' },
  { value: 'Other',              label: 'General Freight' },
]
const PRIORITY_OPTIONS = [
  { value: 'emergency', label: 'Emergency (Highest)' },
  { value: 'high',      label: 'High Priority' },
  { value: 'medium',    label: 'Medium Priority' },
  { value: 'low',       label: 'Standard Transit' },
]

const LEFT_TABS = [
  { id: 'routes',    label: 'Routes' },
  { id: 'compare',   label: 'Compare' },
  { id: 'elevation', label: 'Terrain' },
  { id: 'why',       label: 'Why AI?' },
  { id: 'risk',      label: 'Hazards' },
  { id: 'weather',   label: 'Weather' },
]

export function RoutesPage() {
  const routeOptions = useRouteStore(selRouteOptions)
  const selectedId   = useRouteStore(selSelectedId)
  const selectRoute  = useRouteStore(selSelectRoute)
  const origin       = useRouteStore(selOrigin)
  const destination  = useRouteStore(selDest)
  const cargo        = useRouteStore(selCargo)
  const priority     = useRouteStore(selPriority)
  const setForm      = useRouteStore(selSetForm)
  const calculate    = useRouteStore(selCalculate)
  const calculating  = useRouteStore(selCalculating)

  const [tab, setTab] = useState('routes')
  const [mobileTab, setMobileTab] = useState<'planner' | 'map'>('planner')
  const [dispatched, setDispatched] = useState(false)
  const [showElevationModal, setShowElevationModal] = useState(false)

  const selectedRoute = routeOptions.find(r => r.id === selectedId) ?? routeOptions[0]
  const recommended   = routeOptions.find(r => r.isAIRecommended) ?? routeOptions[0]
  const alternatives  = routeOptions.filter(r => !r.isAIRecommended)

  const handleDispatch = (route: RouteOption) => {
    setDispatched(true)
    toast.success(`Dispatched convoy via ${route.label}`, {
      description: `ETA: ${Math.floor(route.duration / 60)}h ${route.duration % 60}m • Distance: ${route.distance}km • Safe corridor locked`,
    })
    setTimeout(() => setDispatched(false), 8000)
  }

  const handleAccept = useCallback((route: RouteOption) => {
    selectRoute(route.id)
    handleDispatch(route)
  }, [selectRoute])

  const handleOverride = useCallback((route: RouteOption, reason: string) => {
    selectRoute(route.id)
    toast.warning(`Manual route override: ${route.label}`, {
      description: `Reason: ${reason} • Risk score: ${route.riskScore}% — Proceed with convoy escort.`,
    })
  }, [selectRoute])

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* ── TOPBAR ─────────────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Navigation className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold text-text">AI Multi-Modal Route Optimizer</h1>
              <span className="badge-info text-2xs hidden sm:inline-flex">v2.4 Geo-AI</span>
            </div>
            <p className="text-2xs text-text-muted hidden sm:block">
              Topographic analysis • Landslide trigger modeling • Safe North Bank bypass
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile switcher */}
          <div className="flex md:hidden items-center bg-surface-3 p-1 rounded-xl border border-border">
            <button
              onClick={() => setMobileTab('planner')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                mobileTab === 'planner' ? 'bg-primary text-white shadow-sm' : 'text-text-muted'
              }`}
            >
              Planner
            </button>
            <button
              onClick={() => setMobileTab('map')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                mobileTab === 'map' ? 'bg-primary text-white shadow-sm' : 'text-text-muted'
              }`}
            >
              Map
            </button>
          </div>

          <DemoControl />
        </div>
      </div>

      {/* ── WORKSPACE ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── LEFT PANEL — Planner & Details ───────────────────────────────── */}
        <div className={`w-full md:w-80 lg:w-[420px] flex-shrink-0 border-r border-border bg-surface flex-col overflow-hidden ${
          mobileTab === 'planner' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Planner inputs */}
          <div className="p-3 border-b border-border/80 space-y-2.5 bg-surface-2/40">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Origin</label>
                <Select options={DISTRICT_OPTIONS} value={origin}
                  onChange={e => setForm({ origin: e.target.value })} />
              </div>
              <div>
                <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Destination</label>
                <Select options={DISTRICT_OPTIONS} value={destination}
                  onChange={e => setForm({ destination: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Cargo</label>
                <Select options={CARGO_OPTIONS} value={cargo}
                  onChange={e => setForm({ cargo: e.target.value })} />
              </div>
              <div>
                <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Priority</label>
                <Select options={PRIORITY_OPTIONS} value={priority}
                  onChange={e => setForm({ priority: e.target.value })} />
              </div>
            </div>

            <Button
              className="w-full h-8 text-xs font-semibold"
              size="sm"
              loading={calculating}
              onClick={() => {
                calculate()
                setMobileTab('map')
              }}
            >
              <Cpu className="h-3.5 w-3.5" />
              {calculating ? 'Calculating Multi-Modal Routes…' : 'Calculate AI Routes'}
            </Button>
          </div>

          {/* Tab bar */}
          <div className="p-2 border-b border-border bg-surface flex-shrink-0">
            <Tabs
              tabs={LEFT_TABS}
              active={tab}
              onChange={setTab}
              variant="pill"
            />
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
            {/* Route cards */}
            {tab === 'routes' && routeOptions.map((r, i) => (
              <RouteCard
                key={r.id}
                route={r}
                selected={selectedId === r.id}
                rank={i + 1}
                onSelect={(id) => {
                  selectRoute(id)
                  setMobileTab('map')
                }}
                onDispatch={() => handleDispatch(r)}
              />
            ))}

            {/* Side-by-side Route Comparison Matrix */}
            {tab === 'compare' && (
              <RouteComparisonMatrix onDispatch={handleDispatch} className="w-full" />
            )}

            {/* Elevation & Terrain Profile Tab */}
            {tab === 'elevation' && (
              <ElevationProfile
                route={selectedRoute || recommended}
                className="w-full"
              />
            )}

            {/* WHY panel — explainable AI */}
            {tab === 'why' && recommended && (
              <RouteWhyPanel
                recommended={recommended}
                alternatives={alternatives}
                onAccept={handleAccept}
                onOverride={handleOverride}
              />
            )}
            {tab === 'why' && !recommended && (
              <div className="text-center py-10 app-card p-4">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-2 opacity-70" />
                <p className="text-xs font-semibold text-text">Calculate routes first</p>
                <p className="text-2xs text-text-muted mt-1">AI explainability matrix will populate here.</p>
              </div>
            )}

            {/* AI Risk cards */}
            {tab === 'risk' && mockPredictions.slice(0, 3).map(p => (
              <RiskCard key={p.id} prediction={p} showTimeline />
            ))}

            {/* Weather */}
            {tab === 'weather' && mockWeather.slice(0, 4).map(w => (
              <div key={w.district} className="app-card p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text">{w.district}</span>
                  <span className="text-lg">{weatherIcon(w.condition)}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-2xs">
                  <span className="text-text-muted">Rainfall</span>
                  <span className="text-text text-right font-medium">{w.rainfall}mm/hr</span>
                  <span className="text-text-muted">Visibility</span>
                  <span className="text-text text-right">{w.visibility}km</span>
                  <span className="text-text-muted">Landslide Risk</span>
                  <span className={`text-right font-bold ${w.landslideRisk >= 75 ? 'text-danger' : w.landslideRisk >= 50 ? 'text-warning' : 'text-success'}`}>
                    {w.landslideRisk}%
                  </span>
                </div>
                {/* Forecast mini-bars */}
                <div className="flex items-end gap-1 h-8 pt-1 border-t border-border/40">
                  {w.forecast.map(f => (
                    <div key={f.hour} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className={`w-full rounded-sm ${f.risk >= 75 ? 'bg-danger' : f.risk >= 50 ? 'bg-warning' : 'bg-info'}`}
                        style={{ height: `${Math.max(3, (f.risk / 100) * 24)}px` }}
                      />
                      <div className="text-[8px] text-text-subtle">+{f.hour}h</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTER — Map & Elevation Drawer ──────────────────────────────── */}
        <div className={`flex-1 relative overflow-hidden min-w-0 bg-background ${
          mobileTab === 'map' ? 'flex' : 'hidden md:flex'
        }`}>
          <MapEngine layers={['roads', 'routes', 'vehicles', 'alerts']} />

          {/* Collapsible Elevation Modal / Drawer on Map View */}
          {showElevationModal && selectedRoute && (
            <div className="absolute top-16 right-4 z-20 w-96 max-w-[calc(100vw-2rem)] animate-scale-in">
              <ElevationProfile
                route={selectedRoute}
                onClose={() => setShowElevationModal(false)}
              />
            </div>
          )}

          {/* Selected route bottom callout */}
          {selectedRoute && !dispatched && (
            <div className="absolute bottom-4 left-3 right-3 md:left-6 md:right-6 z-10 max-w-2xl mx-auto animate-scale-in">
              <div className="surface-elevated rounded-xl p-3 md:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-modal border border-border/80 bg-surface/95 backdrop-blur">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs md:text-sm font-bold text-text truncate">{selectedRoute.label}</span>
                    {selectedRoute.isAIRecommended && (
                      <Badge variant="success" className="text-2xs font-bold flex items-center gap-1">
                        <Award className="h-2.5 w-2.5" />
                        AI Pick
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 md:gap-5 text-2xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3 text-primary" />
                      <strong>{selectedRoute.distance}</strong> km
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-text-dim" />
                      <strong>{Math.floor(selectedRoute.duration/60)}h {selectedRoute.duration%60}m</strong>
                    </span>
                    <span className={cn(
                      'font-bold',
                      selectedRoute.riskScore >= 75 ? 'text-danger' :
                      selectedRoute.riskScore >= 50 ? 'text-warning' :
                      'text-success'
                    )}>
                      Risk: {selectedRoute.riskScore}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs font-semibold bg-white/5 hover:bg-white/10"
                    onClick={() => setShowElevationModal(!showElevationModal)}
                  >
                    <Mountain className="h-3.5 w-3.5 text-primary mr-1" /> Terrain Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="w-full sm:w-auto h-7 text-xs font-semibold shadow-sm"
                    onClick={() => handleDispatch(selectedRoute)}
                  >
                    <Send className="h-3 w-3 mr-1" /> Confirm & Dispatch
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
