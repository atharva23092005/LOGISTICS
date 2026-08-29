import {
  CloudRain, Satellite, Navigation, Smartphone, Shield,
  Layers, Database, ArrowRight, CheckCircle2, Clock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

const SOURCES = [
  {
    name: 'India Meteorological Dept (IMD)',
    role: 'Doppler Weather Radar & Monsoonal Precipitation',
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
    role: 'Real-Time Convoy Coordinates, Speed & Cargo Sensor',
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
    status: 'Prototype Feed',
    statusType: 'warning',
    icon: Shield,
  },
  {
    name: 'State Disaster Cells (SDMA)',
    role: 'District Flood Warnings & Relief Mandates',
    status: 'Planned Integration',
    statusType: 'muted',
    icon: Database,
  },
]

export function DataIntegrationSection() {
  return (
    <section id="technology" className="py-16 md:py-24 bg-[#080D18] relative overflow-hidden border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Layers className="h-3.5 w-3.5" />
            <span>INTEROPERABLE DATA FABRIC</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Designed to Connect With the Existing Ecosystem.
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
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
                className="app-card p-5 bg-[#0D1626] border border-white/10 rounded-2xl space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <Badge
                      variant={s.statusType === 'success' ? 'success' : s.statusType === 'warning' ? 'warning' : 'outline'}
                      className="text-[10px] font-bold"
                    >
                      {s.status}
                    </Badge>
                  </div>

                  <h3 className="text-sm font-bold text-white">{s.name}</h3>
                  <p className="text-xs text-text-muted leading-relaxed">{s.role}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-text-dim">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
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
