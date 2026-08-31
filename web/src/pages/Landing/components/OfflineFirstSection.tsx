import { useState } from 'react'
import {
  WifiOff, Wifi, Camera, MapPin, CheckCircle2, ArrowRight,
  Smartphone, Database, RefreshCw, Upload, ShieldCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

const STEPS = [
  {
    step: '1',
    title: 'Offline Field Terminal Boot',
    status: 'OFFLINE MODE',
    statusColor: 'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10',
    desc: 'Officer stationed at zero-connectivity hill pass opens terminal without signal.',
    mockContent: {
      screenTitle: 'FIELD OPERATIONS TERMINAL',
      district: 'East Siang Sector (Km 42 Pass)',
      gps: '28.0624° N, 95.3271° E',
      action: 'Tap to Report Road Hazard',
    },
  },
  {
    step: '2',
    title: 'Incident Ground Capture',
    status: 'OFFLINE CAPTURE',
    statusColor: 'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10',
    desc: 'Captures incident category, camera photos, and high-precision GPS coordinates.',
    mockContent: {
      screenTitle: 'INCIDENT DATA CAPTURE',
      type: 'Debris Flow / 200m Landslide',
      photos: '2 Field Photos Compressed (WebP)',
      action: 'Save to Encrypted Local Queue',
    },
  },
  {
    step: '3',
    title: 'Local Cryptographic Queue',
    status: 'SAVED IN INDEXEDDB',
    statusColor: 'text-sky-700 dark:text-cyan-400 border-sky-200 dark:border-cyan-500/30 bg-sky-50 dark:bg-cyan-500/10',
    desc: 'Timestamped and queued in client-side IndexedDB with hash verification.',
    mockContent: {
      screenTitle: 'QUEUE STATUS: 1 PENDING SYNC',
      checks: ['✓ GPS Geotag Verified (0.8m accuracy)', '✓ 2 Images Compressed & Signed', '✓ SHA-256 Audit Timestamp Locked'],
      action: 'Standing By for Cellular / Satellite Signal',
    },
  },
  {
    step: '4',
    title: 'Auto-Sync to Command Cockpit',
    status: 'ONLINE & SYNCED',
    statusColor: 'text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10',
    desc: 'The instant vehicle enters cell range, background worker auto-syncs payload to HQ.',
    mockContent: {
      screenTitle: 'SYNC COMPLETE (28ms)',
      checks: ['✓ Payload Broadcasted to HQ Socket', '✓ Landslide Risk Model Recalibrated', '✓ 7 Inbound Convoys Notified'],
      action: 'Command Center Cockpit Updated',
    },
  },
]

export function OfflineFirstSection() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-semibold">
            <WifiOff className="h-3.5 w-3.5" />
            <span>OFFLINE-FIRST RESILIENCE ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Connectivity Shouldn&apos;t Decide Whether an Incident Gets Reported.
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-muted leading-relaxed">
            Remote Himalayan gorges frequently experience zero cellular coverage. NERA&apos;s offline PWA engine
            stores reports locally in encrypted IndexedDB and automatically synchronizes with headquarters the instant signal returns.
          </p>
        </div>

        {/* 4-Step Interactive Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Step Selector Buttons */}
          <div className="lg:col-span-6 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block mb-2 font-mono">
              The 4-Stage Offline Sync Protocol (Click to Step Through)
            </span>
            {STEPS.map((s, idx) => {
              const isSelected = activeStep === idx
              return (
                <div
                  key={s.step}
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    'p-4 rounded-2xl border transition-all cursor-pointer space-y-1 shadow-sm',
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-surface-2/95 border-blue-500 dark:border-primary ring-1 ring-blue-500/50 dark:ring-primary/50 scale-[1.01]'
                      : 'bg-white dark:bg-surface/60 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="h-6 w-6 rounded-full bg-blue-100 dark:bg-primary/15 text-blue-700 dark:text-primary text-xs font-bold font-mono flex items-center justify-center border border-blue-200 dark:border-primary/30">
                        {s.step}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{s.title}</h3>
                    </div>
                    <span className={cn('text-[10px] font-bold font-mono px-2 py-0.5 rounded border', s.statusColor)}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-text-muted pl-8 leading-relaxed">{s.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Right: Phone Terminal Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-[310px] sm:w-[350px] rounded-[40px] p-4 bg-slate-900 dark:bg-[#080E1A] border-2 border-slate-700 dark:border-white/20 shadow-xl relative">
              
              {/* Speaker Notch */}
              <div className="h-4 w-28 bg-slate-700 dark:bg-white/10 rounded-full mx-auto mb-3" />

              {/* Phone Display Canvas */}
              <div className="rounded-[28px] bg-slate-950 dark:bg-[#060A12] border border-slate-800 dark:border-white/10 p-4 min-h-[420px] flex flex-col justify-between text-xs space-y-4">
                
                {/* Mobile Top Status Bar */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 dark:border-white/10 font-mono text-[11px]">
                  <span className="font-bold text-white">NERA Field Terminal</span>
                  <div className="flex items-center gap-1.5">
                    {activeStep === 3 ? (
                      <Badge variant="success" className="text-[10px] py-0 px-1.5 flex items-center gap-1 font-mono">
                        <Wifi className="h-3 w-3" />
                        Online (LTE)
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[10px] py-0 px-1.5 flex items-center gap-1 font-mono">
                        <WifiOff className="h-3 w-3" />
                        Offline Mode
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Mobile Dynamic Screen Content */}
                <div className="space-y-3 my-auto">
                  <div className="p-3.5 bg-slate-900 dark:bg-surface-2 rounded-xl border border-slate-800 dark:border-white/5 space-y-2 text-center">
                    <span className="text-[9px] uppercase font-bold text-slate-400 dark:text-text-dim tracking-wider font-mono">
                      {STEPS[activeStep].mockContent.screenTitle}
                    </span>
                    {STEPS[activeStep].mockContent.type && (
                      <div className="text-sm font-bold text-rose-400">
                        {STEPS[activeStep].mockContent.type}
                      </div>
                    )}
                    {STEPS[activeStep].mockContent.district && (
                      <div className="text-sm font-bold text-white">
                        {STEPS[activeStep].mockContent.district}
                      </div>
                    )}
                    {STEPS[activeStep].mockContent.gps && (
                      <div className="text-2xs font-mono text-sky-400">
                        GPS: {STEPS[activeStep].mockContent.gps}
                      </div>
                    )}
                    {STEPS[activeStep].mockContent.photos && (
                      <div className="text-2xs text-blue-400 dark:text-primary font-semibold flex items-center justify-center gap-1">
                        <Camera className="h-3 w-3" />
                        <span>{STEPS[activeStep].mockContent.photos}</span>
                      </div>
                    )}
                    {STEPS[activeStep].mockContent.checks && (
                      <div className="text-left text-2xs space-y-1.5 pt-1.5 text-emerald-400 font-medium font-mono">
                        {STEPS[activeStep].mockContent.checks.map((c) => (
                          <div key={c} className="flex items-center gap-1.5">{c}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Bottom Action Pill */}
                <div className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-center font-bold text-xs shadow-md font-mono">
                  {STEPS[activeStep].mockContent.action}
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

