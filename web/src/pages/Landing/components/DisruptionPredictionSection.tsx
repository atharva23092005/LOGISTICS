import { useNavigate } from 'react-router-dom'
import {
  Cpu, TrendingUp, AlertTriangle, ArrowRight, ShieldCheck,
  CloudRain, Mountain, Droplets, History, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const TIMELINE = [
  { time: '12:00 PM', risk: 42, label: 'Nominal', color: 'bg-emerald-500', text: 'text-emerald-400' },
  { time: '02:00 PM', risk: 51, label: 'Caution', color: 'bg-amber-500', text: 'text-amber-400' },
  { time: '04:00 PM', risk: 63, label: 'Elevated', color: 'bg-amber-500', text: 'text-amber-400' },
  { time: '06:00 PM', risk: 78, label: 'CRITICAL', color: 'bg-rose-500', text: 'text-rose-400' },
  { time: '08:00 PM', risk: 84, label: 'IMPASSABLE', color: 'bg-rose-500', text: 'text-rose-400' },
]

const FACTORS = [
  { name: 'Monsoonal Rainfall (IMD Radar)', score: 84, icon: CloudRain, color: 'text-primary' },
  { name: 'Topographic Slope Gradient (DEM)', score: 76, icon: Mountain, color: 'text-warning' },
  { name: 'Subsoil Moisture Saturation', score: 69, icon: Droplets, color: 'text-info' },
  { name: 'GSI Historical Landslide Frequency', score: 73, icon: History, color: 'text-rose-400' },
]

export function DisruptionPredictionSection() {
  const navigate = useNavigate()

  return (
    <section className="py-16 md:py-24 bg-[#080D18] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Cpu className="h-3.5 w-3.5" />
            <span>XGBOOST GEOTECHNICAL RISK ENGINE (v2.4)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Know Where the Network Will Fail Before It Does.
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Multi-factor machine learning analyzes Doppler weather radar, digital elevation models,
            and soil saturation to forecast mudslides and washouts 6–12 hours before highway failure.
          </p>
        </div>

        {/* Prediction Intelligence Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0D1626] p-6 lg:p-8 shadow-2xl space-y-8">
          
          {/* Card Top: Highway Target & Risk Gauge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg sm:text-xl font-black text-white">NH-415 / East Siang Sector</h3>
                <Badge variant="danger" className="text-xs font-bold">RISK: 78% (HIGH)</Badge>
              </div>
              <p className="text-xs text-text-muted">
                Km 42 Pasighat Corridor • Monitored Critical Lifeline Corridor
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xs text-text-muted block">Forecast Horizon</span>
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Next 6–12 Hours
                </span>
              </div>
              <Button
                size="sm"
                onClick={() => navigate('/routes')}
                className="h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-white"
              >
                <span>Explore AI Risk Engine</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>

          {/* Card Middle: 5-Hour Risk Progression Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white uppercase tracking-wider text-[11px]">
                Predicted Disruption Probability Timeline
              </span>
              <span className="text-2xs text-text-muted">Threshold: 70% Triggers Auto-Reroute</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {TIMELINE.map((t) => (
                <div key={t.time} className="app-card p-3 bg-surface-2 space-y-1.5 text-center">
                  <div className="text-2xs font-mono text-text-muted">{t.time}</div>
                  <div className={`text-xl font-black ${t.text}`}>{t.risk}%</div>
                  <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                    <div className={`h-full ${t.color}`} style={{ width: `${t.risk}%` }} />
                  </div>
                  <div className="text-[10px] font-bold text-text-dim uppercase">{t.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card Bottom: 4 Contributing Factor Gauges */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <div className="text-xs font-bold text-white uppercase tracking-wider text-[11px]">
              Geospatial Contributing Risk Factors
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {FACTORS.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.name} className="app-card p-3.5 bg-surface-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`h-4 w-4 ${f.color}`} />
                        <span className="text-xs font-bold text-white">{f.score}%</span>
                      </div>
                      <span className="text-2xs font-mono text-text-muted">Gain: {Math.round(f.score * 0.35)}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${f.score}%` }} />
                    </div>
                    <div className="text-2xs text-text-muted leading-tight">{f.name}</div>
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
