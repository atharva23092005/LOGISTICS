import { Zap, ShieldCheck, Github, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export function LandingFooter() {
  return (
    <footer className="bg-[#050811] border-t border-white/10 text-xs text-text-muted py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand & Purpose Column */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center text-primary">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <span className="text-base font-bold text-white tracking-wider">NERA</span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed max-w-sm">
              North Eastern Region Logistics & Accessibility Intelligence.
              Predicting disruptions, protecting essential supply lines, and keeping the North East moving.
            </p>
            <div className="text-[11px] text-text-dim">
              Designed for SIH 2024 / 2025 Disaster Resilience & Logistics Track.
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider text-[11px] block">
              Platform Modules
            </span>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Command Center</Link></li>
              <li><Link to="/map" className="hover:text-white transition-colors">Live Map HUD</Link></li>
              <li><Link to="/routes" className="hover:text-white transition-colors">Route Intelligence</Link></li>
              <li><Link to="/fleet" className="hover:text-white transition-colors">Fleet Telemetry</Link></li>
              <li><Link to="/alerts" className="hover:text-white transition-colors">Incident Triage</Link></li>
              <li><Link to="/emergency" className="hover:text-white transition-colors">Emergency Protocol</Link></li>
            </ul>
          </div>

          {/* Resources & Tech */}
          <div className="md:col-span-4 space-y-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider text-[11px] block">
              Intelligence & Data Architecture
            </span>
            <ul className="space-y-1.5 text-xs text-text-muted">
              <li>• XGBoost v2.4 Landslide Prediction Engine</li>
              <li>• ISRO Bhuvan High-Resolution Terrain DEM</li>
              <li>• IMD Doppler Rain Radar & Soil Saturation Ingestion</li>
              <li>• Offline-First IndexedDB Cryptographic Sync</li>
              <li>• MapLibre GL 3D Vector Elevation Layers</li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-dim">
          <div>
            © 2026 NERA Intelligence Platform. Built for resilient logistics across North East India.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-amber-400/80 font-medium">Prototype Demonstration Environment</span>
          </div>
        </div>

      </div>
    </footer>
  )
}
