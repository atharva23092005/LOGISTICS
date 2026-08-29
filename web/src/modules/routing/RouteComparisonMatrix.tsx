import { CheckCircle2, AlertTriangle, ShieldCheck, Clock, MapPin, Fuel, Send } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { useRouteStore } from '@/stores/routeStore'
import { toast } from 'sonner'
import type { RouteOption } from '@/types'

interface RouteComparisonMatrixProps {
  onDispatch?: (route: RouteOption) => void
  className?: string
}

export function RouteComparisonMatrix({ onDispatch, className }: RouteComparisonMatrixProps) {
  const routeOptions = useRouteStore((s) => s.routeOptions)
  const selectedRouteId = useRouteStore((s) => s.selectedRouteId)
  const selectRoute = useRouteStore((s) => s.selectRoute)

  const handleSelect = (route: RouteOption) => {
    selectRoute(route.id)
    toast.info(`Selected ${route.label.split('—')[0].trim()}`, {
      description: `Risk Score: ${route.riskScore}% • Distance: ${route.distance}km`,
    })
  }

  const handleDispatch = (route: RouteOption) => {
    selectRoute(route.id)
    if (onDispatch) {
      onDispatch(route)
    } else {
      toast.success(`Dispatched convoy via ${route.label}`, {
        description: `Safe corridor locked. ETA: ${Math.floor(route.duration / 60)}h ${route.duration % 60}m.`,
      })
    }
  }

  return (
    <div
      className={cn(
        'glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl bg-[#0D1626]/95 backdrop-blur-xl text-text space-y-4',
        className
      )}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Multi-Modal Route Comparison Matrix</span>
            <span className="badge-info text-[9px]">AI Feasibility Score</span>
          </h2>
          <p className="text-2xs text-text-muted mt-0.5">
            Side-by-side topographic, hazard exposure, and corridor infrastructure comparison
          </p>
        </div>
      </div>

      {/* ── Table Container ───────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-[11px] text-text-muted uppercase tracking-wider">
              <th className="py-2.5 px-3 font-semibold">Corridor Route</th>
              <th className="py-2.5 px-3 font-semibold">Distance & ETA</th>
              <th className="py-2.5 px-3 font-semibold">Hazard Risk</th>
              <th className="py-2.5 px-3 font-semibold">Max Gradient</th>
              <th className="py-2.5 px-3 font-semibold">Bridges & Infra</th>
              <th className="py-2.5 px-3 font-semibold">Active Blockades</th>
              <th className="py-2.5 px-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {routeOptions.map((route) => {
              const isSelected = route.id === selectedRouteId
              const isAI = route.isAIRecommended
              const maxElev = route.elevationProfile
                ? Math.max(...route.elevationProfile.map((p) => p.elevationMeters))
                : 750
              const maxSlope = route.elevationProfile
                ? Math.max(...route.elevationProfile.map((p) => p.slope))
                : 7.4

              return (
                <tr
                  key={route.id}
                  onClick={() => handleSelect(route)}
                  className={cn(
                    'transition-colors cursor-pointer',
                    isSelected ? 'bg-primary/10' : 'hover:bg-white/5'
                  )}
                >
                  {/* Route Label */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0">
                        <div className="font-bold text-white flex items-center gap-1.5 truncate">
                          <span>{route.label.split('—')[0].trim()}</span>
                          {isAI && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-success/15 text-success border border-success/30 font-bold">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-text-muted truncate max-w-[180px]">
                          {route.label.split('—')[1]?.trim() || route.via.join(' → ')}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Distance & ETA */}
                  <td className="py-3 px-3">
                    <div className="text-white font-semibold">{route.distance} km</div>
                    <div className="text-[10px] text-text-muted">
                      {Math.floor(route.duration / 60)}h {route.duration % 60}m
                    </div>
                  </td>

                  {/* Hazard Risk */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-surface-3 h-2 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            route.riskScore >= 75
                              ? 'bg-danger'
                              : route.riskScore >= 50
                              ? 'bg-warning'
                              : 'bg-success'
                          )}
                          style={{ width: `${route.riskScore}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          'font-bold text-[11px]',
                          route.riskScore >= 75
                            ? 'text-danger'
                            : route.riskScore >= 50
                            ? 'text-warning'
                            : 'text-success'
                        )}
                      >
                        {route.riskScore}%
                      </span>
                    </div>
                    <div className="text-[9px] text-text-dim mt-0.5">
                      {route.riskScore < 30 ? 'Minimal Exposure' : route.riskScore < 60 ? 'Moderate Alert' : 'Critical Hazard'}
                    </div>
                  </td>

                  {/* Topography & Slope */}
                  <td className="py-3 px-3">
                    <div className="text-white text-[11px] font-semibold">
                      {maxElev}m <span className="text-text-muted font-normal">peak</span>
                    </div>
                    <div className={cn('text-[10px] font-medium', maxSlope > 15 ? 'text-danger' : 'text-success')}>
                      {maxSlope}° slope {maxSlope > 15 ? '(Risk)' : '(Safe)'}
                    </div>
                  </td>

                  {/* Bridges & Infrastructure */}
                  <td className="py-3 px-3 text-2xs">
                    {isAI ? (
                      <div className="text-success flex items-center gap-1">
                        <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>All Bridges Tagged Green</span>
                      </div>
                    ) : route.riskScore > 80 ? (
                      <div className="text-danger flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Debris Obstruction</span>
                      </div>
                    ) : (
                      <div className="text-warning flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>Freight Congestion</span>
                      </div>
                    )}
                  </td>

                  {/* Active Hazards */}
                  <td className="py-3 px-3 text-2xs text-text-muted max-w-[200px]">
                    {route.avoidedHazards && route.avoidedHazards.length > 0 ? (
                      <div className="text-success font-medium truncate">
                        ✓ Avoids {route.avoidedHazards[0]}
                      </div>
                    ) : (
                      <div className="text-danger font-medium truncate">
                        ⚠️ NH-415 Km 42 Mudslide Active
                      </div>
                    )}
                  </td>

                  {/* Action Button */}
                  <td className="py-3 px-3 text-right">
                    <Button
                      size="sm"
                      variant={isAI ? 'default' : 'outline'}
                      className="h-7 px-3 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDispatch(route)
                      }}
                    >
                      <Send className="h-3 w-3" />
                      <span>{isAI ? 'Dispatch AI' : 'Select'}</span>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
