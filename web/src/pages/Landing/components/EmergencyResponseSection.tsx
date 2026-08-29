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
  { rank: 'Priority 1', category: 'Medical & Life Support', icon: HeartPulse, count: '3 Ambulances Active', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  { rank: 'Priority 2', category: 'Food Grains & Dry Rations', icon: Truck, count: '8 Heavy Trucks En Route', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
  { rank: 'Priority 3', category: 'Water Purification Plants', icon: Droplets, count: '2 Emergency Units', color: 'text-info border-info/30 bg-info/10' },
]

export function EmergencyResponseSection() {
  const navigate = useNavigate()
  const [emergencyActive, setEmergencyActive] = useState(true)

  return (
    <section className="py-16 md:py-24 bg-[#080D18] relative overflow-hidden border-t border-rose-500/20">
      {/* Subtle Red Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-rose-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold animate-pulse">
            <AlertOctagon className="h-4 w-4" />
            <span>DISASTER RESPONSE PROTOCOL (LEVEL 3)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            When Disaster Strikes, Switch From Monitoring to Response.
          </h2>
          <p className="text-sm text-text-muted leading-relaxed">
            One-touch operational escalation instantly re-allocates road capacity, broadcasts alternate corridor mandates,
            and prioritizes emergency medical convoys across regional jurisdictions.
          </p>
        </div>

        {/* Emergency Terminal Mockup */}
        <div className="rounded-2xl border border-rose-500/40 bg-[#0F0A12] p-6 lg:p-8 shadow-2xl space-y-6">
          
          {/* Top Emergency Status Strip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-rose-500/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center animate-bounce-sm">
                <Siren className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-white">
                    🚨 EMERGENCY MODE: FLASH FLOOD WARNING — BRAHMAPUTRA BASIN
                  </h3>
                </div>
                <p className="text-xs text-text-muted">
                  Brahmaputra Inundation Protocol Active • Kaziranga Corridor Severed • 13 Convoys In Transit
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="danger" className="text-xs font-black py-1 px-2.5">
                ● ESCALATED LEVEL 3
              </Badge>
            </div>
          </div>

          {/* 3 Priority Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PRIORITIES.map((p) => {
              const Icon = p.icon
              return (
                <div key={p.rank} className={cn('p-4 rounded-2xl border space-y-2', p.color)}>
                  <div className="flex items-center justify-between">
                    <span className="text-2xs uppercase font-mono font-bold tracking-wider">{p.rank}</span>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-bold text-white">{p.category}</div>
                  <div className="text-2xs text-text-muted">{p.count}</div>
                  <div className="pt-2 border-t border-white/10 text-[10px] text-emerald-400 font-semibold">
                    ✓ Cleared for Priority Green Corridor
                  </div>
                </div>
              )
            })}
          </div>

          {/* Command Action Buttons */}
          <div className="pt-4 border-t border-rose-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="text-xs text-text-muted">
              Live Fleet: <strong className="text-white">3 Ambulances</strong> • <strong className="text-white">8 Supply Trucks</strong> • <strong className="text-white">2 Rescue Teams</strong>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-bold border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                onClick={() => navigate('/emergency')}
              >
                Broadcast Highway Alert
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-bold border-primary/40 text-primary hover:bg-primary/10"
                onClick={() => navigate('/emergency')}
              >
                Reroute All Inbound Fleet
              </Button>
              <Button
                size="sm"
                className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
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
