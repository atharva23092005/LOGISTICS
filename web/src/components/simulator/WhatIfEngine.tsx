/**
 * WhatIfEngine — Impact Simulator
 * Lets the evaluator pick a road, severity, and rainfall,
 * then shows Before / After / With-AI-Rerouting cascade.
 */
import { useState, useCallback } from 'react'
import { Zap, AlertTriangle, TrendingDown, TrendingUp, Navigation, RotateCcw, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useVehicleStore } from '@/stores/vehicleStore'
import { useRouteStore }   from '@/stores/routeStore'
import { useAlertStore }   from '@/stores/alertStore'
import { useEventBus }     from '@/stores/eventBus'
import type { WhatIfResult, WhatIfScenario, CargoCategoryPriority } from '@/types'

// ── Deterministic simulation engine ──────────────────────────────────────────
function runSimulation(
  roadId: string,
  roadName: string,
  severityLabel: string,
  rainfall: number,
  vehicles: ReturnType<typeof useVehicleStore.getState>['vehicles'],
): WhatIfResult {
  const total       = vehicles.length
  const affected    = vehicles.filter(v => v.affectedByRoadId === roadId || v.routeId?.includes(roadId.split('-')[0])).length
  const affectedPct = affected / total

  const before = {
    onTimePct:        82,
    avgDelayMin:      42,
    affectedVehicles: 0,
    cargoAtRiskLakh:  0,
  }

  const severityMult = severityLabel === 'Critical' ? 1.0 : severityLabel === 'High' ? 0.72 : 0.45
  const rainfallMult = Math.min(1, rainfall / 100)
  const impact       = severityMult * rainfallMult

  const after = {
    onTimePct:        Math.max(30, Math.round(before.onTimePct - 25 * impact)),
    avgDelayMin:      Math.round(before.avgDelayMin + 115 * impact),
    affectedVehicles: Math.max(1, Math.round(total * 0.48 * impact + affected)),
    cargoAtRiskLakh:  parseFloat((8.4 * impact).toFixed(1)),
  }

  const recovered = Math.round(after.affectedVehicles * 0.82)
  const withRerouting = {
    onTimePct:           Math.min(before.onTimePct - 3, after.onTimePct + Math.round(22 * impact)),
    avgDelayMin:         Math.round(after.avgDelayMin * 0.38 + before.avgDelayMin * 0.15),
    vehiclesRecovered:   recovered,
    cargoProtectedLakh:  parseFloat((after.cargoAtRiskLakh * 0.94).toFixed(1)),
  }

  // Category breakdown
  const catCounts: Record<CargoCategoryPriority, number> = { medical: 0, food: 0, water: 0, other: 0 }
  vehicles.filter(v =>
    v.affectedByRoadId === roadId || v.routeId?.includes(roadId.split('-')[0])
  ).forEach(v => {
    catCounts[v.cargoCategory ?? 'other']++
  })
  // Ensure at least some values for demo
  if (Object.values(catCounts).every(c => c === 0)) {
    catCounts.medical = 3; catCounts.food = 4; catCounts.water = 2; catCounts.other = 1
  }

  return {
    scenario: { roadId, roadName, severityLabel, rainfall, durationHours: 6 },
    before,
    after,
    withRerouting,
    dispatchPriority: [
      { category: 'medical', count: catCounts.medical },
      { category: 'food',    count: catCounts.food    },
      { category: 'water',   count: catCounts.water   },
      { category: 'other',   count: catCounts.other   },
    ],
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function MetricBox({
  label, before, after, unit = '', higherIsBetter = true,
}: {
  label: string; before: number; after: number; unit?: string; higherIsBetter?: boolean
}) {
  const improved = higherIsBetter ? after > before : after < before
  const Icon     = improved ? TrendingUp : TrendingDown
  const color    = improved ? 'text-success' : 'text-danger'
  const delta    = after - before
  return (
    <div className="bg-surface-2 rounded-lg p-2.5 text-center space-y-0.5">
      <div className="text-[10px] text-text-muted">{label}</div>
      <div className="text-lg font-bold text-text tabular-nums">{after}{unit}</div>
      <div className={cn('flex items-center justify-center gap-0.5 text-[10px] font-semibold', color)}>
        <Icon className="h-2.5 w-2.5" />
        {delta > 0 ? '+' : ''}{delta}{unit}
      </div>
    </div>
  )
}

function ResultColumn({
  label, color, bgColor, children,
}: { label: string; color: string; bgColor: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex-1 rounded-xl border p-3 space-y-2', bgColor)}>
      <div className={cn('text-[10px] font-bold uppercase tracking-wider text-center', color)}>{label}</div>
      {children}
    </div>
  )
}

const ROAD_OPTIONS = [
  { value: 'nh415-seg1', label: 'NH-415 — Dibrugarh–East Siang' },
  { value: 'nh37-seg1',  label: 'NH-37 — Guwahati–Dibrugarh' },
  { value: 'nh13-seg1',  label: 'NH-13 — Itanagar–Tawang' },
  { value: 'nh27-seg1',  label: 'NH-27 — Guwahati–Jorhat' },
  { value: 'nh6-seg1',   label: 'NH-6 — Shillong–Guwahati' },
]
const SEVERITY_OPTIONS = [
  { value: 'Critical', label: '🔴 Critical — Full Blockage' },
  { value: 'High',     label: '🟡 High — Partial, slow traffic' },
  { value: 'Medium',   label: '🔵 Medium — Caution advised' },
]
const RAINFALL_OPTIONS = [
  { value: '110', label: '110 mm/hr — Extreme' },
  { value: '84',  label: '84 mm/hr — Heavy' },
  { value: '55',  label: '55 mm/hr — Moderate' },
  { value: '28',  label: '28 mm/hr — Light' },
]
const CATEGORY_CONFIG = {
  medical: { icon: '🏥', color: 'text-danger',  bg: 'bg-danger/10',  label: 'Medical' },
  food:    { icon: '🌾', color: 'text-warning', bg: 'bg-warning/10', label: 'Food' },
  water:   { icon: '💧', color: 'text-info',    bg: 'bg-info/10',    label: 'Water' },
  other:   { icon: '📦', color: 'text-text-muted', bg: 'bg-surface-2', label: 'Other' },
}

export function WhatIfEngine() {
  const vehicles      = useVehicleStore(s => s.vehicles)
  const roads         = useRouteStore(s => s.roads)
  const addAlert      = useAlertStore(s => s.addAlert)
  const emit          = useEventBus(s => s.emit)

  const [roadId,     setRoadId]     = useState('nh415-seg1')
  const [severity,   setSeverity]   = useState('Critical')
  const [rainfall,   setRainfall]   = useState('84')
  const [result,     setResult]     = useState<WhatIfResult | null>(null)
  const [simulating, setSimulating] = useState(false)
  const [activated,  setActivated]  = useState(false)

  const roadName = ROAD_OPTIONS.find(r => r.value === roadId)?.label?.split('—')[0].trim() ?? roadId

  const simulate = useCallback(() => {
    setSimulating(true)
    setActivated(false)
    setTimeout(() => {
      const r = runSimulation(roadId, roadName, severity, parseInt(rainfall), vehicles)
      setResult(r)
      setSimulating(false)
    }, 1200)
  }, [roadId, roadName, severity, rainfall, vehicles])

  const activateResponse = useCallback(() => {
    if (!result) return
    setActivated(true)
    // Trigger the real event bus — this cascades through all stores
    emit('ROAD_BLOCKED', {
      roadId:           result.scenario.roadId,
      roadName:         result.scenario.roadName,
      affectedVehicles: vehicles.filter(v =>
        v.affectedByRoadId === roadId || v.routeId?.includes(roadId.split('-')[0])
      ).map(v => v.id),
    })
    toast.success('🚨 Simulation activated — system responding', {
      description: `Rerouting ${result.withRerouting.vehiclesRecovered} vehicles via safe corridors.`,
      duration: 6000,
    })
  }, [result, emit, vehicles, roadId])

  const reset = useCallback(() => {
    setResult(null)
    setActivated(false)
  }, [])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-warning/10 border border-warning/20">
            <Zap className="h-4 w-4 text-warning" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text">What-If Simulator</h2>
            <p className="text-[10px] text-text-muted">Simulate road failure → see network impact → AI response</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Scenario builder */}
        <div className="bg-surface-2 border border-border rounded-xl p-4 space-y-3">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" /> Scenario Configuration
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <div>
              <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wide block mb-1">Road Segment</label>
              <Select options={ROAD_OPTIONS} value={roadId} onChange={e => { setRoadId(e.target.value); setResult(null) }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wide block mb-1">Severity</label>
                <Select options={SEVERITY_OPTIONS} value={severity} onChange={e => setSeverity(e.target.value)} />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-text-muted uppercase tracking-wide block mb-1">Rainfall</label>
                <Select options={RAINFALL_OPTIONS} value={rainfall} onChange={e => setRainfall(e.target.value)} />
              </div>
            </div>
          </div>
          <Button className="w-full" loading={simulating} onClick={simulate}>
            <Zap className="h-4 w-4" />
            {simulating ? 'Simulating…' : 'Run Simulation'}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Scenario summary */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger/10 border border-danger/30">
              <AlertTriangle className="h-4 w-4 text-danger flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-danger">{result.scenario.roadName} — {result.scenario.severityLabel} Event</div>
                <div className="text-[10px] text-text-muted">{result.scenario.rainfall}mm/hr rainfall · {result.scenario.durationHours}h duration</div>
              </div>
            </div>

            {/* Before / After / With Rerouting — 3 columns */}
            <div className="flex gap-2">
              {/* BEFORE */}
              <ResultColumn label="Before" color="text-text-muted" bgColor="border-border bg-surface">
                <MetricBox label="On-Time %"     before={result.before.onTimePct}      after={result.before.onTimePct}      unit="%" higherIsBetter />
                <MetricBox label="Avg Delay"     before={result.before.avgDelayMin}    after={result.before.avgDelayMin}    unit="m" higherIsBetter={false} />
                <MetricBox label="Affected"      before={result.before.affectedVehicles} after={result.before.affectedVehicles} higherIsBetter={false} />
                <div className="text-center text-[9px] text-text-subtle">Normal operations</div>
              </ResultColumn>

              {/* Arrow */}
              <div className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-px bg-danger/40" />
                  <AlertTriangle className="h-4 w-4 text-danger" />
                  <div className="h-8 w-px bg-danger/40" />
                </div>
              </div>

              {/* AFTER */}
              <ResultColumn label="After Failure" color="text-danger" bgColor="border-danger/30 bg-danger/5">
                <MetricBox label="On-Time %"  before={result.before.onTimePct}       after={result.after.onTimePct}       unit="%" higherIsBetter />
                <MetricBox label="Avg Delay"  before={result.before.avgDelayMin}     after={result.after.avgDelayMin}     unit="m" higherIsBetter={false} />
                <MetricBox label="Affected"   before={result.before.affectedVehicles} after={result.after.affectedVehicles} higherIsBetter={false} />
                <div className="text-center text-[9px] text-danger font-semibold">
                  ₹{result.after.cargoAtRiskLakh}L at risk
                </div>
              </ResultColumn>

              {/* Arrow */}
              <div className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-8 w-px bg-success/40" />
                  <Navigation className="h-4 w-4 text-success" />
                  <div className="h-8 w-px bg-success/40" />
                </div>
              </div>

              {/* WITH REROUTING */}
              <ResultColumn label="With AI Rerouting" color="text-success" bgColor="border-success/30 bg-success/5">
                <MetricBox label="On-Time %"  before={result.after.onTimePct}       after={result.withRerouting.onTimePct}   unit="%" higherIsBetter />
                <MetricBox label="Avg Delay"  before={result.after.avgDelayMin}     after={result.withRerouting.avgDelayMin} unit="m" higherIsBetter={false} />
                <MetricBox label="Recovered"  before={0}                            after={result.withRerouting.vehiclesRecovered} higherIsBetter />
                <div className="text-center text-[9px] text-success font-semibold">
                  ₹{result.withRerouting.cargoProtectedLakh}L protected
                </div>
              </ResultColumn>
            </div>

            {/* AI Dispatch Priority */}
            <div className="bg-surface border border-border rounded-xl p-3">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                AI Dispatch Priority Order
              </div>
              <div className="space-y-1.5">
                {result.dispatchPriority.filter(d => d.count > 0).map((d, i) => {
                  const cfg = CATEGORY_CONFIG[d.category]
                  return (
                    <div key={d.category} className={cn('flex items-center gap-3 p-2 rounded-lg border', cfg.bg,
                      d.category === 'medical' ? 'border-danger/20' : d.category === 'food' ? 'border-warning/20' : 'border-border')}>
                      <span className="text-sm font-bold text-text-muted w-4">#{i+1}</span>
                      <span className="text-base">{cfg.icon}</span>
                      <span className={cn('text-xs font-semibold flex-1', cfg.color)}>{cfg.label}</span>
                      <span className="text-xs font-bold text-text">{d.count} vehicle{d.count !== 1 ? 's' : ''}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* AI Actions taken */}
            <div className="bg-surface border border-border rounded-xl p-3">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">AI Actions</div>
              <div className="space-y-1.5">
                {[
                  `Rerouting ${result.withRerouting.vehiclesRecovered} vehicles via NH-6 safe corridor`,
                  `Prioritising ${result.dispatchPriority.find(d => d.category === 'medical')?.count ?? 0} medical convoys`,
                  `Notifying ${Math.ceil(result.after.affectedVehicles * 0.4)} field officers`,
                  `Recalculating ETAs for all affected routes`,
                  `Activating emergency dispatch protocol`,
                ].map((action, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-text-muted">
                    <span className="text-success font-bold">✓</span>
                    {action}
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
              <Button
                size="sm"
                className="flex-1"
                variant={activated ? 'success' : 'emergency'}
                onClick={activateResponse}
                disabled={activated}
              >
                {activated ? (
                  <><span className="text-sm">✓</span> Response Activated</>
                ) : (
                  <><Navigation className="h-3.5 w-3.5" /> Activate Response</>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
