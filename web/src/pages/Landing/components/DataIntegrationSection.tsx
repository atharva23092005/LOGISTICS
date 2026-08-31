import {
  CloudRain, Satellite, Navigation, Smartphone, Shield,
  Layers, Database, ArrowRight, CheckCircle2, Clock, Globe
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

const SOURCES = [
  {
    name: 'India Meteorological Dept (IMD)',
    role: 'Doppler Weather Radar & Monsoonal Precipitation Feeds',
    status: 'Connected (API)',
    statusType: 'success',
    icon: CloudRain,
  },
  {
    name: 'ISRO / Bhuvan Geospatial',
    role: 'High-Res Terrain Elevation (DEM) & Slope Vectors',
    status: 'Connected (Raster)',
    statusType: 'success',
    icon: Satellite,
  },
  {
    name: 'Vehicle Telematics & GPS',
    role: 'Real-Time Convoy Coordinates, Speed & Cargo Sensors',
    status: 'Connected (MQTT)',
    statusType: 'success',
    icon: Navigation,
  },
  {
    name: 'Field Officer PWA Reports',
    role: 'Ground Truth Incident Verification (Offline Sync)',
    status: 'Connected (PWA)',
    statusType: 'success',
    icon: Smartphone,
  },
  {
    name: 'NHAI / BRO Road Authorities',
    role: 'Structural Bridge Ratings & Highway Works Feeds',
    status: 'Live Feed',
    statusType: 'warning',
    icon: Shield,
  },
  {
    name: 'State Disaster Cells (SDMA)',
    role: 'District Flood Warnings & Relief Mandates',
    status: 'Active Feed',
    statusType: 'success',
    icon: Database,
  },
]

export function DataIntegrationSection() {
  return (
    <section id="technology" className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/25 text-blue-700 dark:text-primary text-xs font-semibold">
            <Layers className="h-3.5 w-3.5" />
            <span>INTEROPERABLE DATA FABRIC</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Designed to Connect With the Existing Ecosystem.
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-muted leading-relaxed">
            NERA ingests multi-source geospatial, meteorological, and telematics streams to build
            an authoritative, real-time ground truth data model across the North Eastern Region.
          </p>
        </div>

        {/* 6 Integration Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SOURCES.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.name}
                className="p-5 bg-white dark:bg-surface/80 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all rounded-2xl space-y-3.5 flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-primary/15 border border-blue-200 dark:border-primary/30 text-blue-600 dark:text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge
                      variant={s.statusType === 'success' ? 'success' : s.statusType === 'warning' ? 'warning' : 'outline'}
                      className="text-[10px] font-bold font-mono py-0.5 px-2"
                    >
                      {s.status}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{s.name}</h3>
                  <p className="text-xs text-slate-600 dark:text-text-muted leading-relaxed">{s.role}</p>
                </div>

                <div className="pt-2.5 border-t border-slate-100 dark:border-white/10 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-text-dim font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-primary" />
                  <span>Feeds NERA Geo-AI Inference Engine</span>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

