import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const MODULES = [
  { label: 'Command center', to: '/dashboard' },
  { label: 'Live map', to: '/map' },
  { label: 'Route intelligence', to: '/routes' },
  { label: 'Fleet telemetry', to: '/fleet' },
  { label: 'Incident triage', to: '/alerts' },
  { label: 'Emergency protocol', to: '/emergency' },
]

const STACK = [
  'XGBoost risk engine',
  'ISRO Bhuvan terrain DEM',
  'IMD Doppler radar ingest',
  'Offline-first PWA sync',
  'MapLibre GL vector layers',
]

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-paper text-slate-600 dark:border-white/10 dark:bg-ink-900 dark:text-slate-400">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-spruce text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 15 L9 8 L13 12 L21 4" opacity="0.9" />
                  <path d="M3 19 L9 12.5 L13 16 L21 8.5" opacity="0.5" />
                </svg>
              </span>
              <span className="font-display text-[17px] font-semibold tracking-tight text-ink dark:text-white">
                NERA
              </span>
            </div>
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed">
              North Eastern Region Logistics &amp; Accessibility intelligence — predicting geotechnical
              disruptions and safeguarding lifeline supply routes.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
              SIH 2024 / 2025 · Disaster Resilience &amp; Lifeline Logistics Track
            </p>
          </div>

          {/* Modules */}
          <div className="md:col-span-3">
            <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Platform
            </span>
            <ul className="mt-4 space-y-2.5 text-[13.5px]">
              {MODULES.map((m) => (
                <li key={m.to}>
                  <Link to={m.to} className="transition-colors hover:text-ink dark:hover:text-white">
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stack */}
          <div className="md:col-span-4">
            <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              Built with
            </span>
            <ul className="mt-4 space-y-2.5 font-mono text-[12.5px] text-slate-500 dark:text-slate-400">
              {STACK.map((s) => (
                <li key={s} className="flex items-center gap-2.5">
                  <span className="h-1 w-1 flex-shrink-0 rounded-full bg-spruce-500" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 dark:border-white/10 sm:flex-row sm:items-center">
          <p className="font-mono text-[11px] text-slate-400 dark:text-slate-500">
            © 2026 NERA · Built for resilient logistics across North East India
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 font-mono text-[11px] text-spruce dark:text-spruce-400">
              <span className="h-1.5 w-1.5 rounded-full bg-spruce-500" />
              8 states active
            </span>
            <ThemeToggle variant="segmented" />
          </div>
        </div>
      </div>
    </footer>
  )
}
