/**
 * RouteWhyPanel — Explainable AI Route Recommendation
 * Shows WHY ROUTE C was chosen: ranked bullet reasons, comparison table,
 * and a Human-in-the-Loop Accept / Override flow with reason capture.
 */
import { useState, useCallback } from 'react'
import { CheckCircle, AlertTriangle, Shield, Cpu, ChevronDown, ChevronUp, Edit3 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { RouteOption } from '@/types'

// ── Override reasons ─────────────────────────────────────────────────────────
const OVERRIDE_REASONS = [
  'Faster delivery required — time-critical cargo',
  'Vehicle constraint — route incompatible',
  'Local knowledge — road conditions differ',
  'Emergency instruction from senior officer',
  'Driver reports alternate is clear',
  'Other reason',
]

interface Props {
  recommended: RouteOption
  alternatives: RouteOption[]
  onAccept:   (route: RouteOption) => void
  onOverride: (route: RouteOption, reason: string) => void
}

export function RouteWhyPanel({ recommended, alternatives, onAccept, onOverride }: Props) {
  const [expanded,       setExpanded]       = useState(true)
  const [overrideModal,  setOverrideModal]  = useState(false)
  const [selectedAlt,    setSelectedAlt]    = useState<RouteOption | null>(null)
  const [overrideReason, setOverrideReason] = useState('')
  const [customReason,   setCustomReason]   = useState('')
  const [decided,        setDecided]        = useState<'accepted' | 'overridden' | null>(null)

  const handleAccept = useCallback(() => {
    setDecided('accepted')
    onAccept(recommended)
    toast.success('✅ AI recommendation accepted', {
      description: `${recommended.label} dispatched. Driver notified.`,
      duration: 5000,
    })
  }, [recommended, onAccept])

  const handleOpenOverride = useCallback((alt: RouteOption) => {
    setSelectedAlt(alt)
    setOverrideReason('')
    setCustomReason('')
    setOverrideModal(true)
  }, [])

  const handleConfirmOverride = useCallback(() => {
    if (!selectedAlt) return
    const reason = overrideReason === 'Other reason' ? customReason : overrideReason
    if (!reason.trim()) { toast.error('Please select a reason'); return }
    setDecided('overridden')
    setOverrideModal(false)
    onOverride(selectedAlt, reason)
    toast.warning(`⚠️ AI recommendation overridden`, {
      description: `Selected: ${selectedAlt.label} · Reason: ${reason}`,
      duration: 6000,
    })
  }, [selectedAlt, overrideReason, customReason, onOverride])

  const riskColor = (score: number) =>
    score >= 75 ? 'text-danger' : score >= 50 ? 'text-warning' : 'text-success'
  const riskBg = (score: number) =>
    score >= 75 ? 'bg-danger/10 border-danger/30' : score >= 50 ? 'bg-warning/10 border-warning/30' : 'bg-success/10 border-success/30'

  return (
    <>
      <div className="bg-surface border border-success/30 rounded-xl overflow-hidden">
        {/* Header — collapsible */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center gap-3 p-3 hover:bg-surface-2 transition-colors"
        >
          <div className="p-1.5 rounded-lg bg-success/10 border border-success/20 flex-shrink-0">
            <Cpu className="h-3.5 w-3.5 text-success" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs font-bold text-success">WHY AI RECOMMENDS {recommended.label.split('—')[0].trim().toUpperCase()}</div>
            <div className="text-[10px] text-text-muted">Explainable AI Decision · {recommended.riskScore}% risk score</div>
          </div>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-text-muted" /> : <ChevronDown className="h-3.5 w-3.5 text-text-muted" />}
        </button>

        {expanded && (
          <div className="border-t border-border">
            {/* Why reasons — ranked bullets */}
            <div className="p-3 border-b border-border">
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Reasoning</div>
              <div className="space-y-1.5">
                {recommended.whyReasons.map((reason, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-success flex-shrink-0 mt-0.5" />
                    <span className="text-xs text-text-muted leading-snug">{reason}</span>
                  </div>
                ))}
                {recommended.avoidedHazards.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <div className="text-[10px] font-semibold text-text-muted mb-1">Hazards Avoided</div>
                    {recommended.avoidedHazards.map((h, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-success flex-shrink-0" />
                        <span className="text-xs text-success">{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Comparison table */}
            <div className="p-3 border-b border-border">
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Route Comparison</div>
              <div className="space-y-1.5">
                {/* AI recommended route */}
                <div className={cn('p-2 rounded-lg border', riskBg(recommended.riskScore))}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-success mr-1.5">🏆 AI PICK</span>
                      <span className="text-xs text-text">{recommended.via.join(' → ')}</span>
                    </div>
                    <span className={cn('text-xs font-bold', riskColor(recommended.riskScore))}>
                      {recommended.riskScore}% risk
                    </span>
                  </div>
                  <div className="flex gap-3 mt-1 text-[10px] text-text-muted">
                    <span>📍 {recommended.distance}km</span>
                    <span>⏱ {Math.floor(recommended.duration/60)}h {recommended.duration%60}m</span>
                  </div>
                </div>

                {/* Alternative routes */}
                {alternatives.map(alt => (
                  <div key={alt.id} className={cn('p-2 rounded-lg border', riskBg(alt.riskScore))}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-text-muted mr-1.5 capitalize">{alt.type}</span>
                        <span className="text-xs text-text">{alt.via.join(' → ')}</span>
                      </div>
                      <span className={cn('text-xs font-bold', riskColor(alt.riskScore))}>
                        {alt.riskScore}% risk
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex gap-3 text-[10px] text-text-muted">
                        <span>📍 {alt.distance}km</span>
                        <span>⏱ {Math.floor(alt.duration/60)}h {alt.duration%60}m</span>
                      </div>
                      {!decided && (
                        <button
                          onClick={() => handleOpenOverride(alt)}
                          className="text-[10px] text-text-muted hover:text-warning flex items-center gap-0.5 transition-colors"
                        >
                          <Edit3 className="h-2.5 w-2.5" /> Override
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Accept / Override action area */}
            <div className="p-3">
              {!decided ? (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    variant="success"
                    onClick={handleAccept}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept AI Recommendation
                  </Button>
                  <p className="text-[10px] text-text-subtle text-center">
                    Or click Override on any route above to select a different path
                  </p>
                </div>
              ) : decided === 'accepted' ? (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-success/10 border border-success/30">
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-success">AI Recommendation Accepted</div>
                    <div className="text-[10px] text-text-muted">Route confirmed · Driver notified · GPS tracking active</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-warning/10 border border-warning/30">
                  <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-warning">AI Override — Manual Decision</div>
                    <div className="text-[10px] text-text-muted">Override logged for audit. Driver notified of new route.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Override Modal */}
      <Modal
        open={overrideModal}
        onClose={() => setOverrideModal(false)}
        title="Override AI Recommendation"
        description={`Selecting: ${selectedAlt?.label ?? ''}`}
        size="sm"
      >
        <div className="space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-warning/10 border border-warning/30">
            <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-xs text-text-muted leading-relaxed">
              <span className="text-warning font-semibold">You are overriding the AI recommendation.</span>{' '}
              This decision will be logged for audit and review. Please provide a valid reason.
            </div>
          </div>

          {/* Reason selection */}
          <div>
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-2">Override Reason *</div>
            <div className="space-y-1.5">
              {OVERRIDE_REASONS.map(reason => (
                <button
                  key={reason}
                  onClick={() => setOverrideReason(reason)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg border text-xs transition-all',
                    overrideReason === reason
                      ? 'border-warning/50 bg-warning/10 text-warning font-semibold'
                      : 'border-border bg-surface-2 text-text-muted hover:border-border/80 hover:text-text'
                  )}
                >
                  {overrideReason === reason ? '● ' : '○ '}{reason}
                </button>
              ))}
            </div>
          </div>

          {/* Custom reason if "Other" */}
          {overrideReason === 'Other reason' && (
            <div>
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1">Specify Reason *</div>
              <textarea
                className="w-full h-16 px-3 py-2 rounded-md border border-border bg-surface-2 text-xs text-text placeholder:text-text-subtle resize-none focus:outline-none focus:ring-2 focus:ring-warning/50"
                placeholder="Describe your reason for overriding…"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
              />
            </div>
          )}

          {/* Route comparison summary */}
          {selectedAlt && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-success/5 border border-success/20 text-center">
                <div className="text-[9px] text-text-muted mb-0.5">AI Recommended</div>
                <div className="font-bold text-success">{recommended.riskScore}% risk</div>
                <div className="text-text-muted">{Math.floor(recommended.duration/60)}h {recommended.duration%60}m</div>
              </div>
              <div className={cn('p-2 rounded-lg text-center border', riskBg(selectedAlt.riskScore))}>
                <div className="text-[9px] text-text-muted mb-0.5">Your Selection</div>
                <div className={cn('font-bold', riskColor(selectedAlt.riskScore))}>{selectedAlt.riskScore}% risk</div>
                <div className="text-text-muted">{Math.floor(selectedAlt.duration/60)}h {selectedAlt.duration%60}m</div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOverrideModal(false)}>Cancel</Button>
            <Button
              variant="warning"
              className="flex-1"
              onClick={handleConfirmOverride}
              disabled={!overrideReason || (overrideReason === 'Other reason' && !customReason.trim())}
            >
              <Edit3 className="h-4 w-4" /> Confirm Override
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
