import { useState } from 'react'
import { Cpu, TrendingUp, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import { cn } from '@/utils/cn'
import { RiskBar } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FreshnessIndicator, DataConfidenceBadge } from '@/components/feedback/FreshnessIndicator'
import type { AIPrediction } from '@/types'
import { timeAgo } from '@/utils/format'

interface RiskCardProps {
  prediction: AIPrediction
  compact?: boolean
  showTimeline?: boolean
}

const riskLevelConfig = {
  critical: { color: 'text-danger',  bg: 'bg-danger/5  border-danger/30',  chartColor: '#EF4444' },
  high:     { color: 'text-warning', bg: 'bg-warning/5 border-warning/30', chartColor: '#F59E0B' },
  medium:   { color: 'text-info',    bg: 'bg-info/5    border-info/30',    chartColor: '#06B6D4' },
  low:      { color: 'text-success', bg: 'bg-success/5 border-success/30', chartColor: '#10B981' },
}

const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#1E293B',
  border: '1px solid #334155',
  borderRadius: '6px',
  color: '#F8FAFC',
  fontSize: '11px',
  padding: '4px 8px',
}

export function RiskCard({ prediction: p, compact = false, showTimeline = true }: RiskCardProps) {
  const cfg            = riskLevelConfig[p.riskLevel]
  const [expanded, setExpanded] = useState(!compact)
  const currentHour    = new Date().getHours()
  const currentLabel   = `${currentHour.toString().padStart(2,'0')}:00`

  return (
    <div className={cn('border rounded-xl overflow-hidden transition-all', cfg.bg)}>
      {/* Header — always visible */}
      <button
        className="w-full flex items-start gap-3 p-3 hover:bg-black/5 transition-colors text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={cn('p-1.5 rounded-md flex-shrink-0',
          p.riskLevel === 'critical' ? 'bg-danger/20' :
          p.riskLevel === 'high'     ? 'bg-warning/20' : 'bg-info/20')}>
          <Cpu className={cn('h-4 w-4', cfg.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-text truncate">{p.roadName}</div>
          <FreshnessIndicator
            lastUpdated={p.dataLastUpdated}
            confidence={p.dataConfidence}
            compact
            className="mt-0.5"
          />
        </div>
        <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
          <div className={cn('text-lg font-bold tabular-nums', cfg.color)}>{p.riskScore}%</div>
          <Badge variant={
            p.riskLevel === 'critical' || p.riskLevel === 'high' ? 'danger' :
            p.riskLevel === 'medium' ? 'warning' : 'success'}
            className="text-[9px]">
            {p.riskLevel.toUpperCase()}
          </Badge>
        </div>
        <div className="ml-1 flex-shrink-0 self-center">
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-text-subtle" />
                    : <ChevronDown className="h-3.5 w-3.5 text-text-subtle" />}
        </div>
      </button>

      {/* Risk bar — always visible */}
      <div className="px-3 pb-2">
        <RiskBar score={p.riskScore} />
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border/50 space-y-3 p-3">

          {/* Risk timeline chart */}
          {showTimeline && p.riskTimeline?.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Risk Trend (Today)
              </div>
              <ResponsiveContainer width="100%" height={80}>
                <AreaChart data={p.riskTimeline} margin={{ top: 2, right: 2, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`rg-${p.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={cfg.chartColor} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={cfg.chartColor} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#1E293B" />
                  <XAxis dataKey="label" tick={{ fill: '#64748B', fontSize: 9 }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 9 }} tickLine={false} />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(v: number) => [`${v}%`, 'Risk']}
                  />
                  {/* Threshold lines */}
                  <ReferenceLine y={75} stroke="#EF4444" strokeDasharray="3 2" strokeOpacity={0.5} />
                  <ReferenceLine y={50} stroke="#F59E0B" strokeDasharray="3 2" strokeOpacity={0.4} />
                  <Area
                    type="monotone" dataKey="risk"
                    stroke={cfg.chartColor} fill={`url(#rg-${p.id})`}
                    strokeWidth={2} dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-3 mt-1 text-[9px] text-text-subtle">
                <span className="flex items-center gap-1"><span className="h-px w-4 bg-danger/60 inline-block" /> Critical (75%)</span>
                <span className="flex items-center gap-1"><span className="h-px w-4 bg-warning/60 inline-block" /> High (50%)</span>
              </div>
            </div>
          )}

          {/* Factor breakdown */}
          <div>
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Contributing Factors</div>
            <div className="space-y-1.5">
              {p.factors.map(f => (
                <div key={f.name} className="flex items-center gap-2">
                  <span className="text-[10px] text-text-muted w-28 flex-shrink-0">{f.name}</span>
                  <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-700',
                        f.value >= 75 ? 'bg-danger' : f.value >= 50 ? 'bg-warning' : 'bg-info')}
                      style={{ width: `${f.value}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold w-7 text-right
                    ${f.value >= 75 ? 'text-danger' : f.value >= 50 ? 'text-warning' : 'text-info'}">
                    {f.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-2/80">
            <AlertTriangle className={cn('h-3.5 w-3.5 flex-shrink-0 mt-0.5', cfg.color)} />
            <p className="text-[10px] text-text-muted leading-relaxed">{p.recommendation}</p>
          </div>

          {/* Meta footer */}
          <div className="flex items-center justify-between text-[9px] text-text-subtle pt-1 border-t border-border/50">
            <span>Generated {timeAgo(p.generatedAt)}</span>
            <DataConfidenceBadge confidence={p.dataConfidence} />
          </div>
        </div>
      )}
    </div>
  )
}
