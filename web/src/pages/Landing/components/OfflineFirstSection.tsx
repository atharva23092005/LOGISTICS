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
    title: 'Offline Field Terminal',
    status: 'OFFLINE',
    statusColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    desc: 'Officer stationed at zero-connectivity hill pass opens terminal.',
    mockContent: {
      screenTitle: 'FIELD OPERATIONS',
      district: 'East Siang Sector',
      gps: '28.06° N, 95.32° E',
      action: 'Report Road Incident',
    },
  },
  {
    step: '2',
    title: 'Incident Data Capture',
    status: 'OFFLINE',
    statusColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    desc: 'Captures incident type, camera photos, and high-precision GPS offline.',
    mockContent: {
      screenTitle: 'REPORT INCIDENT',
      type: 'Landslide / 200m Mudslide',
      photos: '2 Photos Compressed (WebP)',
      action: 'Save to Local IndexedDB',
    },
  },
  {
    step: '3',
    title: 'Local Cryptographic Storage',
    status: 'SAVED LOCALLY',
    statusColor: 'text-info border-info/30 bg-info/10',
    desc: 'Timestamped and queued in encrypted IndexedDB client storage.',
    mockContent: {
      screenTitle: 'QUEUE STATUS: 1 PENDING',
      checks: ['✓ GPS Coordinates Captured', '✓ 2 Photos Compressed', '✓ Timestamp Locked'],
      action: 'Awaiting Cellular Handshake',
    },
  },
  {
    step: '4',
    title: 'Auto-Sync to Command Center',
    status: 'ONLINE & SYNCED',
    statusColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    desc: 'As truck or officer enters cell range, background worker auto-syncs payload to HQ.',
    mockContent: {
      screenTitle: 'SYNC COMPLETE',
      checks: ['✓ Payload Broadcasted', '✓ Incident Triage Active', '✓ 7 Convoys Notified'],
      action: 'HQ Cockpit Updated (42ms)',
    },
  },
]

export function OfflineFirstSection() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section className="py-16 md:py-24 bg-[#0A101D] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <WifiOff className="h-3.5 w-3.5" />
            <span>OFFLINE-FIRST RESILIENCE ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            Connectivity Shouldn&apos;t Decide Whether an Incident Gets Reported.
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            Remote Himalayan gorges frequently experience zero cellular coverage. NERA&apos;s offline PWA engine
            stores reports locally and automatically synchronizes with headquarters the instant signal returns.
          </p>
        </div>

        {/* 4-Step Interactive Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Step Selector Buttons */}
          <div className="lg:col-span-6 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider text-[11px] block mb-2">
              The 4-Stage Offline Sync Protocol
            </span>
            {STEPS.map((s, idx) => {
              const isSelected = activeStep === idx
              return (
                <div
                  key={s.step}
                  onClick={() => setActiveStep(idx)}
                  className={cn(
                    'p-4 rounded-2xl border transition-all cursor-pointer space-y-1',
                    isSelected
                      ? 'bg-[#0D1626] border-primary/50 shadow-xl shadow-primary/5'
                      : 'bg-surface-2/40 border-white/5 hover:border-white/20'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary/15 text-primary text-2xs font-bold flex items-center justify-center">
                        {s.step}
                      </span>
                      <h3 className="text-sm font-bold text-white">{s.title}</h3>
                    </div>
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border', s.statusColor)}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted pl-7">{s.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Right: Phone Terminal Mockup */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-[300px] sm:w-[340px] rounded-[36px] p-3.5 bg-[#050811] border-2 border-white/15 shadow-2xl relative">
              
              {/* Speaker Notch */}
              <div className="h-4 w-28 bg-white/10 rounded-full mx-auto mb-3" />

              {/* Phone Display Canvas */}
              <div className="rounded-[24px] bg-[#0A101D] border border-white/10 p-4 min-h-[420px] flex flex-col justify-between text-xs space-y-4">
                
                {/* Mobile Top Status Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="font-bold text-white text-[11px]">NERA Field Terminal</span>
                  <div className="flex items-center gap-1.5">
                    {activeStep === 3 ? (
                      <Badge variant="success" className="text-[10px] py-0 px-1.5 flex items-center gap-1">
                        <Wifi className="h-3 w-3" />
                        Online
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[10px] py-0 px-1.5 flex items-center gap-1">
                        <WifiOff className="h-3 w-3" />
                        Offline
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Mobile Dynamic Screen Content */}
                <div className="space-y-3 my-auto">
                  <div className="app-card p-3 bg-surface-2 space-y-1.5 text-center">
                    <span className="text-[10px] uppercase font-bold text-text-dim tracking-wider">
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
                      <div className="text-2xs font-mono text-text-muted">
                        GPS: {STEPS[activeStep].mockContent.gps}
                      </div>
                    )}
                    {STEPS[activeStep].mockContent.photos && (
                      <div className="text-2xs text-primary font-semibold">
                        📷 {STEPS[activeStep].mockContent.photos}
                      </div>
                    )}
                    {STEPS[activeStep].mockContent.checks && (
                      <div className="text-left text-2xs space-y-1 pt-1 text-emerald-400 font-medium">
                        {STEPS[activeStep].mockContent.checks.map((c) => (
                          <div key={c}>{c}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Bottom Action Pill */}
                <div className="p-2.5 rounded-xl bg-primary text-white text-center font-bold text-xs shadow-lg shadow-primary/25">
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
