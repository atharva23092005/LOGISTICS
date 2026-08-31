import { ShieldCheck, UserCheck, ScrollText, WifiOff, GitBranch, Lock } from 'lucide-react'
import { Section, Eyebrow, Heading } from './primitives'

const SOURCES = [
  { name: 'IMD', detail: 'Doppler radar, rainfall & soil saturation' },
  { name: 'ISRO Bhuvan', detail: '0.5 m elevation DEM & terrain layers' },
  { name: 'Vehicle telematics', detail: 'Live GPS & OBD convoy telemetry' },
  { name: 'Field officer PWA', detail: 'Ground-truth incident reports' },
  { name: 'NHAI / BRO', detail: 'Road status, closures & bridge ratings' },
  { name: 'State disaster cells', detail: 'SDMA alerts & relief priorities' },
]

const TRUST = [
  { icon: UserCheck, title: 'Human-in-the-loop AI', desc: 'Every reroute needs an operator sign-off — the model advises, people decide.' },
  { icon: ShieldCheck, title: 'Role-based access', desc: 'Scoped permissions per command tier, from field to control room.' },
  { icon: ScrollText, title: 'Immutable audit log', desc: 'Every decision timestamped and traceable, after the fact.' },
  { icon: GitBranch, title: 'Data provenance', desc: 'Every value on screen carries its source and time of capture.' },
  { icon: WifiOff, title: 'Offline-first resilience', desc: 'Keeps operating through signal blackouts, then reconciles on reconnect.' },
  { icon: Lock, title: 'Encrypted pipelines', desc: 'Field-to-core telemetry encrypted end to end, in transit and at rest.' },
]

export function DataTrustSection() {
  return (
    <Section id="data" className="border-t border-slate-200 dark:border-white/10">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Sources */}
        <div className="lg:col-span-5">
          <Eyebrow>Data &amp; trust</Eyebrow>
          <Heading className="mt-6 text-3xl sm:text-4xl">
            Grounded in official data. Governed like infrastructure.
          </Heading>
          <p className="mt-5 text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
            Six authoritative feeds fuse into one live model — no scraped estimates, no black boxes.
            What the map shows can always be traced back to who reported it, and when.
          </p>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-slate-200 bg-paper-deep px-4 py-2.5 dark:border-white/10 dark:bg-white/[0.03]">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Live sources
              </span>
              <span className="font-mono text-[10.5px] text-spruce dark:text-spruce-400">06</span>
            </div>
            <ul className="divide-y divide-slate-200 dark:divide-white/10">
              {SOURCES.map((s) => (
                <li key={s.name} className="flex items-center gap-3.5 px-4 py-3">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-spruce-500" />
                  <span className="w-36 flex-shrink-0 font-mono text-[12px] font-medium text-ink dark:text-slate-200">
                    {s.name}
                  </span>
                  <span className="text-[12.5px] text-slate-500 dark:text-slate-400">{s.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Governance */}
        <div className="lg:col-span-7">
          <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
            {TRUST.map((t) => {
              const Icon = t.icon
              return (
                <div key={t.title}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-spruce dark:border-white/10 dark:bg-white/5 dark:text-spruce-400">
                    <Icon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <h3 className="mt-4 font-display text-[16px] font-medium tracking-tight text-ink dark:text-white">
                    {t.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                    {t.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </Section>
  )
}
