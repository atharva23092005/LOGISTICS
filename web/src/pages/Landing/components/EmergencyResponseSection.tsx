import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertOctagon, Radio, ShieldAlert, Siren, Flame, Waves,
  Truck, Cross, Droplets, HeartPulse, Send, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

const PRIORITIES = [
  { rank: 'Priority 1', category: 'Medical & Life Support', icon: HeartPulse, count: '3 Ambulances Active', color: 'text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-500/10' },
  { rank: 'Priority 2', category: 'Food Grains & Dry Rations', icon: Truck, count: '8 Heavy Trucks En Route', color: 'text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-500/10' },
  { rank: 'Priority 3', category: 'Water Purification Plants', icon: Droplets, count: '2 Emergency Units', color: 'text-sky-700 dark:text-cyan-400 border-sky-200 dark:border-cyan-500/30 bg-sky-50/70 dark:bg-cyan-500/10' },
]

export function EmergencyResponseSection() {
  const navigate = useNavigate()

  return (
    <section className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200 dark:border-rose-500/25">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-bold">
            <AlertOctagon className="h-4 w-4" />
            <span>DISASTER RESPONSE PROTOCOL (LEVEL 3)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            When Disaster Strikes, Switch From Monitoring to Response.
          </h2>
          <p className="text-sm text-slate-600 dark:text-text-muted leading-relaxed">
            One-touch operational escalation instantly re-allocates road capacity, broadcasts alternate corridor mandates,
            and prioritizes emergency medical convoys across regional jurisdictions.
          </p>
        </div>

        {/* Emergency Terminal Mockup */}
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/40 bg-white dark:bg-[#080E1A]/95 p-6 lg:p-8 shadow-sm dark:shadow-2xl space-y-6 backdrop-blur-xl">
          
          {/* Top Emergency Status Strip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-rose-100 dark:border-rose-500/20">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/40 flex items-center justify-center flex-shrink-0">
                <Siren className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    EMERGENCY MODE: FLASH FLOOD WARNING — BRAHMAPUTRA BASIN
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-text-muted mt-0.5">
                  Brahmaputra Inundation Protocol Active • Kaziranga Corridor Severed • 13 Convoys In Transit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="danger" className="text-xs font-black font-mono py-1 px-3">
                ● ESCALATED LEVEL 3
              </Badge>
            </div>
          </div>

          {/* 3 Priority Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRIORITIES.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.rank} className={cn('p-5 rounded-2xl border space-y-2.5 shadow-sm', p.color)}>
                  <div className="flex items-center justify-between">
                    <span className="text-2xs uppercase font-mono font-bold tracking-wider">{p.rank}</span>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{p.category}</div>
                  <div className="text-2xs text-slate-600 dark:text-text-muted font-mono">{p.count}</div>
                  <div className="pt-2 border-t border-rose-200/60 dark:border-white/10 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold font-mono">
                    ✓ Cleared for Priority Green Corridor
                  </div>
                </div>
              )
            })}
          </div>

          {/* Command Action Buttons */}
          <div className="pt-4 border-t border-rose-100 dark:border-rose-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600 dark:text-text-muted font-mono">
              Live Fleet: <strong className="text-slate-900 dark:text-white">3 Ambulances</strong> • <strong className="text-slate-900 dark:text-white">8 Supply Trucks</strong> • <strong className="text-slate-900 dark:text-white">2 Rescue Teams</strong>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs font-bold border-rose-200 dark:border-rose-500/40 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                onClick={() => navigate('/emergency')}
              >
                Broadcast Highway Alert
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 text-xs font-bold border-slate-200 dark:border-primary/40 text-blue-700 dark:text-primary hover:bg-slate-50 dark:hover:bg-primary/10"
                onClick={() => navigate('/emergency')}
              >
                Reroute Inbound Fleet
              </Button>
              <Button
                size="sm"
                className="h-9 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                onClick={() => navigate('/emergency')}
              >
                <span>Prioritize Dispatch Corridor</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}

