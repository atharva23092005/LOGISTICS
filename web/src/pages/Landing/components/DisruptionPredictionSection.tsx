import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Cpu, TrendingUp, AlertTriangle, ArrowRight, ShieldCheck,
  CloudRain, Mountain, Droplets, History, Clock, Activity, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

const TIMELINE = [
  { time: '12:00 PM', risk: 42, label: 'Nominal', color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', rain: '14 mm/h', slope: 'Stable', action: 'Standard monitoring' },
  { time: '02:00 PM', risk: 51, label: 'Caution', color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', rain: '38 mm/h', slope: 'Minor runoff', action: 'Speed advisory 40 km/h' },
  { time: '04:00 PM', risk: 63, label: 'Elevated', color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', rain: '62 mm/h', slope: 'Soil shifting', action: 'Pre-alerting nearby convoys' },
  { time: '06:00 PM', risk: 78, label: 'CRITICAL', color: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-400', rain: '84 mm/h', slope: 'Mudflow imminent', action: 'AUTO-REROUTE DISPATCH TRIGGERED' },
  { time: '08:00 PM', risk: 84, label: 'IMPASSABLE', color: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-400', rain: '96 mm/h', slope: 'Corridor severed', action: 'BRO excavators dispatched' },
]

const FACTORS = [
  { name: 'Monsoonal Rainfall (IMD Radar)', score: 84, icon: CloudRain, color: 'text-blue-600 dark:text-primary', desc: 'Doppler precipitation intensity' },
  { name: 'Topographic Slope Gradient (DEM)', score: 76, icon: Mountain, color: 'text-amber-600 dark:text-amber-400', desc: 'ISRO 0.5m digital elevation slope' },
  { name: 'Subsoil Moisture Saturation', score: 69, icon: Droplets, color: 'text-sky-600 dark:text-cyan-400', desc: 'Hydrological pore pressure index' },
  { name: 'GSI Historical Landslide Recurrence', score: 73, icon: History, color: 'text-rose-600 dark:text-rose-400', desc: 'Geological Survey historical polygons' },
]

export function DisruptionPredictionSection() {
  const navigate = useNavigate()
  const [selectedHour, setSelectedHour] = useState(3) // 06:00 PM default

  const currentHour = TIMELINE[selectedHour]

  return (
    <section className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/25 text-blue-700 dark:text-primary text-xs font-semibold">
            <Cpu className="h-3.5 w-3.5" />
            <span>XGBOOST GEOTECHNICAL RISK ENGINE (v2.4)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Know Where the Network Will Fail Before It Does.
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-muted leading-relaxed">
            Multi-factor machine learning analyzes Doppler weather radar, digital elevation models,
            and soil saturation to forecast mudslides and washouts 6–12 hours before highway failure.
          </p>
        </div>

        {/* Prediction Intelligence Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#080E1A]/95 p-6 lg:p-8 shadow-sm dark:shadow-2xl space-y-8 backdrop-blur-xl">
          
          {/* Card Top: Highway Target & Risk Gauge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">NH-415 / East Siang Sector</h3>
                <Badge variant="danger" className="text-xs font-bold font-mono">RISK: 78% (HIGH)</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-text-muted">
                Km 42 Pasighat Corridor • Critical Strategic Arterial Route
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xs text-slate-500 dark:text-text-muted block">Forecast Horizon</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 font-mono">
                  <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-primary" />
                  Next 6–12 Hours
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/routes')}
                className="h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                <span>Explore AI Risk Engine</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>

          {/* Card Middle: Interactive Hourly Risk Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono">
                Predicted Disruption Probability Timeline (Click Hour to Inspect)
              </span>
              <span className="text-2xs text-slate-500 dark:text-text-muted font-mono">Threshold: 70% Triggers Auto-Reroute</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {TIMELINE.map((t, idx) => {
                const isSelected = selectedHour === idx
                return (
                  <div
                    key={t.time}
                    onClick={() => setSelectedHour(idx)}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 text-center shadow-sm',
                      isSelected
                        ? 'bg-blue-50 dark:bg-surface-2 border-blue-500 dark:border-primary ring-1 ring-blue-500 dark:ring-primary scale-[1.02]'
                        : 'bg-white dark:bg-surface/70 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                    )}
                  >
                    <div className="text-2xs font-mono text-slate-500 dark:text-text-muted">{t.time}</div>
                    <div className={cn('text-2xl font-black font-mono', t.text)}>{t.risk}%</div>
                    <div className="h-1.5 bg-slate-200 dark:bg-surface-3 rounded-full overflow-hidden">
                      <div className={cn('h-full', t.color)} style={{ width: `${t.risk}%` }} />
                    </div>
                    <div className="text-[10px] font-bold text-slate-600 dark:text-text-dim uppercase font-mono">{t.label}</div>
                  </div>
                )
              })}
            </div>

            {/* Selected Hour Details Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-surface-2/90 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600 dark:text-primary" />
                <span className="text-slate-900 dark:text-white font-bold">{currentHour.time} Status:</span>
                <span className={cn('font-semibold', currentHour.text)}>{currentHour.label} ({currentHour.risk}% Risk)</span>
                <span className="text-slate-600 dark:text-text-muted">• Rain: {currentHour.rain} • Slope: {currentHour.slope}</span>
              </div>
              <div className="text-emerald-700 dark:text-emerald-400 font-semibold text-2xs font-mono">
                ✓ {currentHour.action}
              </div>
            </div>
          </div>

          {/* Card Bottom: 4 Contributing Factor Gauges */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono">
              Geospatial Contributing Risk Factors (XGBoost Feature Importance)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FACTORS.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.name} className="p-4 rounded-xl bg-slate-50/70 dark:bg-surface/70 border border-slate-200 dark:border-white/10 space-y-2.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${f.color}`} />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{f.score}%</span>
                      </div>
                      <span className="text-2xs font-mono text-slate-500 dark:text-text-muted">Gain: {Math.round(f.score * 0.35)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-surface-3 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 dark:bg-primary" style={{ width: `${f.score}%` }} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-text leading-tight">{f.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-text-dim mt-0.5">{f.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

