import { useState, useCallback, useMemo } from 'react'
import {
  Navigation, Cpu, CheckCircle, Compass, Sparkles, MapPin, Layers, Send, Mountain, TableProperties,
  Award, Clock, AlertTriangle, ShieldCheck, ShieldAlert, ArrowRight, ArrowRightLeft,
  ChevronRight, Edit3, X, CloudRain, CheckCircle2, AlertOctagon, Info, Eye, SlidersHorizontal
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { MapEngine }             from '@/modules/map/MapEngine'
import { RouteIntelligenceHeader } from '@/components/routing/RouteIntelligenceHeader'
import { RouteSelectionList }     from '@/components/routing/RouteSelectionList'
import { RouteDetailsPanel }      from '@/components/routing/RouteDetailsPanel'
import { Button }                from '@/components/ui/button'
import { Badge }                 from '@/components/ui/badge'
import { Modal }                 from '@/components/ui/modal'
import { DemoControl }           from '@/components/demo/DemoControl'
import { useRouteStore }         from '@/stores/routeStore'
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

const OVERRIDE_REASONS = [
  'Time-critical medical cargo requiring direct route',
  'Vehicle weight / axle constraint on bypass bridges',
  'Field officer confirmed alternate corridor is clear',
  'Senior SEOC emergency directive',
  'Other operational reason',
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

  // 3-Section mobile/tablet tab: 'planner' | 'map' | 'details'
  const [mobileTab, setMobileTab] = useState<'planner' | 'map' | 'details'>('planner')
  const [dispatched, setDispatched] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  // Override modal state
  const [overrideModal, setOverrideModal] = useState(false)
  const [overrideTarget, setOverrideTarget] = useState<RouteOption | null>(null)
  const [overrideReason, setOverrideReason] = useState(OVERRIDE_REASONS[0])
  const [customReason, setCustomReason] = useState('')

  const selectedRoute = routeOptions.find((r) => r.id === selectedId) ?? routeOptions[0]
  const recommendedRoute = routeOptions.find((r) => r.isAIRecommended) ?? routeOptions[0]

  const handleDispatch = useCallback((route: RouteOption) => {
    setDispatched(true)
    toast.success(`Dispatched convoy via ${route.label}`, {
      description: `ETA: ${Math.floor(route.duration / 60)}h ${route.duration % 60}m • Distance: ${route.distance}km • Safe corridor locked.`,
      duration: 6000,
    })
    setTimeout(() => setDispatched(false), 8000)
  }, [])

  const handleOpenOverride = useCallback((route: RouteOption) => {
    setOverrideTarget(route)
    setOverrideReason(OVERRIDE_REASONS[0])
    setCustomReason('')
    setOverrideModal(true)
  }, [])

  const handleConfirmOverride = useCallback(() => {
    if (!overrideTarget) return
    const reason = overrideReason === 'Other operational reason' ? customReason : overrideReason
    if (!reason.trim()) {
      toast.error('Please specify the override reason')
      return
    }

    selectRoute(overrideTarget.id)
    setOverrideModal(false)
    toast.warning(`Manual Route Override Confirmed`, {
      description: `Dispatched via ${overrideTarget.label} • Reason: ${reason}`,
      duration: 7000,
    })
    handleDispatch(overrideTarget)
  }, [overrideTarget, overrideReason, customReason, selectRoute, handleDispatch])

  const handleSwapLocations = useCallback(() => {
    setForm({
      origin: destination,
      destination: origin,
    })
    toast.info('Swapped origin and destination hubs')
  }, [origin, destination, setForm])

  const handleSelectFromList = useCallback((id: string) => {
    selectRoute(id)
    // On mobile, keep flow moving
    if (window.innerWidth < 768) {
      setMobileTab('map')
    }
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
              <h1 className="text-sm md:text-base font-bold text-text">Route Intelligence & Multi-Modal Optimizer</h1>
              <span className="badge-info text-2xs hidden sm:inline-flex">v2.4 Geo-AI</span>
            </div>
            <p className="text-2xs text-text-muted hidden sm:block">
              Topographic analysis • Landslide trigger modeling • 3-Section real-time operational cockpit
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 3-Way Responsive Section Switcher for Tablet / Mobile */}
          <div className="flex xl:hidden items-center bg-surface-3 p-1 rounded-xl border border-border">
            <button
              onClick={() => setMobileTab('planner')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors',
                mobileTab === 'planner' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'
              )}
            >
              1. Routes
            </button>
            <button
              onClick={() => setMobileTab('map')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors',
                mobileTab === 'map' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'
              )}
            >
              2. Map
            </button>
            <button
              onClick={() => setMobileTab('details')}
              className={cn(
                'px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors',
                mobileTab === 'details' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-white'
              )}
            >
              3. AI Cards
            </button>
          </div>

          <DemoControl />
        </div>
      </div>

      {/* ── 3-SECTION OPERATIONAL WORKSPACE ───────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── SECTION 1: ROUTE PLANNER & CORRIDOR SELECTION (LEFT PANEL) ── */}
        <div
          className={cn(
            'w-full md:w-80 lg:w-[320px] xl:w-[340px] flex-shrink-0 border-r border-border bg-surface flex flex-col overflow-hidden',
            mobileTab === 'planner' ? 'flex' : 'hidden lg:flex'
          )}
        >
          {/* Corridor Parameters & Journey Header */}
          <RouteIntelligenceHeader
            origin={origin}
            destination={destination}
            cargo={cargo}
            priority={priority}
            isCalculating={calculating}
            onOriginChange={(val) => setForm({ origin: val })}
            onDestinationChange={(val) => setForm({ destination: val })}
            onCargoChange={(val) => setForm({ cargo: val })}
            onPriorityChange={(val) => setForm({ priority: val })}
            onCalculate={() => {
              calculate()
              if (window.innerWidth < 1280) {
                setMobileTab('details')
              }
            }}
            onSwapLocations={handleSwapLocations}
          />

          {/* Computed Routes List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <RouteSelectionList
              routes={routeOptions}
              selectedId={selectedRoute?.id || 'route-3'}
              onSelectRoute={handleSelectFromList}
            />

            {/* Quick Helper Badge */}
            <div className="p-2.5 rounded-xl bg-surface-2 border border-border/60 text-2xs text-text-muted space-y-1">
              <span className="font-semibold text-text flex items-center gap-1">
                <Info className="h-3 w-3 text-primary" />
                <span>Selection Tip</span>
              </span>
              <p className="text-[11px] text-text-dim leading-relaxed">
                Clicking any route updates the live map and displays its explainable AI breakdown in Section 3.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: LIVE GEOGRAPHIC MAP ENGINE (CENTER STAGE) ──────────── */}
        <div
          className={cn(
            'flex-1 relative overflow-hidden min-w-0 bg-background',
            mobileTab === 'map' ? 'flex' : 'hidden md:flex'
          )}
        >
          <MapEngine layers={['roads', 'routes', 'vehicles', 'alerts', 'safeCorridors']} />

          {/* Toggle Details Panel Button (for medium screens) */}
          <div className="hidden lg:flex xl:hidden absolute top-4 right-4 z-10">
            <Button
              size="sm"
              variant="secondary"
              className="text-xs shadow-lg bg-surface/90 backdrop-blur border border-border"
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1" />
              {rightPanelOpen ? 'Hide AI Cards' : 'Show AI Cards'}
            </Button>
          </div>

          {/* Persistent Selected Route Action Callout at Bottom of Map */}
          {selectedRoute && !dispatched && (
            <div className="absolute bottom-4 left-3 right-3 md:left-6 md:right-6 z-10 max-w-xl mx-auto animate-scale-in">
              <div className="surface-elevated rounded-2xl p-3 md:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xl border border-border/80 bg-surface/95 backdrop-blur-md">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs md:text-sm font-bold text-text truncate">
                      {selectedRoute.label}
                    </span>
                    {selectedRoute.isAIRecommended ? (
                      <Badge variant="success" className="text-2xs font-bold flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        AI Optimal
                      </Badge>
                    ) : (
                      <Badge
                        variant={selectedRoute.riskScore >= 75 ? 'danger' : 'warning'}
                        className="text-2xs font-bold"
                      >
                        {selectedRoute.riskScore >= 75 ? 'Blocked Route' : 'Caution Route'}
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
                      <strong>{Math.floor(selectedRoute.duration / 60)}h {selectedRoute.duration % 60}m</strong>
                    </span>
                    <span
                      className={cn(
                        'font-bold',
                        selectedRoute.riskScore >= 75
                          ? 'text-danger'
                          : selectedRoute.riskScore >= 50
                          ? 'text-warning'
                          : 'text-success'
                      )}
                    >
                      Risk: {selectedRoute.riskScore}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    className={cn(
                      'w-full sm:w-auto h-8 text-xs font-bold shadow-md',
                      selectedRoute.isAIRecommended
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-primary hover:bg-primary-hover text-white'
                    )}
                    onClick={() => handleDispatch(selectedRoute)}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    Dispatch Convoy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── SECTION 3: DEDICATED INTELLIGENCE & DECISION DETAILS (RIGHT PANEL) ── */}
        <div
          className={cn(
            'w-full md:w-96 lg:w-[380px] xl:w-[420px] flex-shrink-0 bg-surface flex flex-col overflow-hidden border-l border-border',
            mobileTab === 'details'
              ? 'flex'
              : rightPanelOpen
              ? 'hidden xl:flex'
              : 'hidden'
          )}
        >
          {selectedRoute && (
            <RouteDetailsPanel
              selectedRoute={selectedRoute}
              recommendedRoute={recommendedRoute}
              onDispatch={handleDispatch}
              onOverride={handleOpenOverride}
            />
          )}
        </div>
      </div>

      {/* ── Manual Route Override Modal ── */}
      {overrideModal && overrideTarget && (
        <Modal
          title="Manual Route Override Authorization"
          open={overrideModal}
          onClose={() => setOverrideModal(false)}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                <span>Overriding AI Recommended Safe Corridor</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                You are manually selecting <strong>{overrideTarget.label}</strong> with a hazard risk index of{' '}
                <strong className={overrideTarget.riskScore >= 75 ? 'text-rose-400' : 'text-amber-300'}>
                  {overrideTarget.riskScore}%
                </strong>. This decision will be logged to SEOC audit streams.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider block">
                Select Operational Justification
              </label>
              <div className="space-y-1.5">
                {OVERRIDE_REASONS.map((r) => (
                  <label
                    key={r}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all',
                      overrideReason === r
                        ? 'bg-primary/15 border-primary text-primary font-semibold'
                        : 'bg-surface-2 border-border text-text-muted hover:text-text'
                    )}
                  >
                    <input
                      type="radio"
                      name="overrideReason"
                      value={r}
                      checked={overrideReason === r}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="accent-primary"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {overrideReason === 'Other operational reason' && (
              <div className="space-y-1.5">
                <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider block">
                  Custom Operational Remarks
                </label>
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter details, field officer badge ID, or authority order..."
                  className="w-full bg-surface-2 border border-border rounded-xl p-2.5 text-xs text-text focus:outline-none focus:border-primary resize-none h-20"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOverrideModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="warning"
                size="sm"
                className="font-bold"
                onClick={handleConfirmOverride}
              >
                Authorize & Dispatch Override
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
