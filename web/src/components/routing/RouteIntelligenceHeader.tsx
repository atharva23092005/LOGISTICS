import { useState } from 'react'
import {
  Navigation, MapPin, ArrowRightLeft, Cpu, Shield, ShieldAlert,
  Package, Fuel, HeartPulse, Wheat, Layers, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

interface RouteIntelligenceHeaderProps {
  origin: string
  destination: string
  cargo: string
  priority: string
  isCalculating: boolean
  onOriginChange: (val: string) => void
  onDestinationChange: (val: string) => void
  onCargoChange: (val: string) => void
  onPriorityChange: (val: string) => void
  onCalculate: () => void
  onSwapLocations: () => void
}

const DISTRICT_OPTIONS = [
  { value: 'Guwahati',   label: 'Guwahati Sector HQ' },
  { value: 'Jorhat',     label: 'Jorhat Hub' },
  { value: 'Dibrugarh',  label: 'Dibrugarh Depot' },
  { value: 'East Siang', label: 'East Siang Sector' },
  { value: 'Itanagar',   label: 'Itanagar District Hospital' },
  { value: 'Tawang',     label: 'Tawang Forward Base' },
  { value: 'Shillong',   label: 'Shillong Central Hub' },
]

const CARGO_OPTIONS = [
  { value: 'Medical Supplies',   label: 'Medical Supplies & Vaccines' },
  { value: 'Food Grains',        label: 'Food Grains & Rations' },
  { value: 'Water Purification', label: 'Water Purification Units' },
  { value: 'Fuel',               label: 'POL / Diesel Fuel' },
  { value: 'Construction',       label: 'Heavy Construction & NDRF Gear' },
  { value: 'Other',              label: 'General Freight' },
]

const PRIORITY_OPTIONS = [
  { value: 'emergency', label: 'Emergency (Disaster Protocol)' },
  { value: 'high',      label: 'High Priority (Urgent Convoy)' },
  { value: 'medium',    label: 'Medium Priority (Scheduled)' },
  { value: 'low',       label: 'Standard Freight Transit' },
]

export function RouteIntelligenceHeader({
  origin,
  destination,
  cargo,
  priority,
  isCalculating,
  onOriginChange,
  onDestinationChange,
  onCargoChange,
  onPriorityChange,
  onCalculate,
  onSwapLocations,
}: RouteIntelligenceHeaderProps) {
  const isEmergency = priority === 'emergency'

  return (
    <div className="p-3.5 border-b border-border/80 space-y-3 bg-surface-2/60">
      {/* ── Visual Corridor Journey Track ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-2xs font-semibold text-text-muted uppercase tracking-wider">
            <Navigation className="h-3 w-3 text-primary" />
            <span>Corridor Endpoints</span>
          </div>
          <Badge
            variant={isEmergency ? 'danger' : 'outline'}
            className="text-[10px] py-0 px-2 font-mono uppercase"
          >
            {isEmergency ? 'Emergency Dispatch Active' : 'Multi-Modal Route Mode'}
          </Badge>
        </div>

        <div className="relative bg-surface rounded-xl p-2.5 border border-border/70 shadow-sm space-y-2">
          {/* Origin */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold text-emerald-400 uppercase block leading-none">Origin Hub</span>
              <select
                value={origin}
                onChange={(e) => onOriginChange(e.target.value)}
                className="w-full bg-transparent font-semibold text-xs text-text border-none p-0 focus:ring-0 focus:outline-none cursor-pointer truncate"
              >
                {DISTRICT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-surface text-text">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Connected track line with swap button */}
          <div className="relative flex items-center justify-center py-0.5 my-[-2px]">
            <div className="absolute inset-x-8 h-px bg-border/80 border-dashed" />
            <button
              type="button"
              onClick={onSwapLocations}
              title="Swap Origin and Destination"
              className="relative z-10 p-1 rounded-full bg-surface-2 hover:bg-surface-3 border border-border text-text-muted hover:text-white transition-all shadow-sm hover:scale-105 active:scale-95"
            >
              <ArrowRightLeft className="h-3 w-3" />
            </button>
          </div>

          {/* Destination */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <MapPin className="h-3 w-3 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-bold text-primary uppercase block leading-none">Destination Target</span>
              <select
                value={destination}
                onChange={(e) => onDestinationChange(e.target.value)}
                className="w-full bg-transparent font-semibold text-xs text-text border-none p-0 focus:ring-0 focus:outline-none cursor-pointer truncate"
              >
                {DISTRICT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value} className="bg-surface text-text">
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cargo & Priority Selectors ── */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Package className="h-3 w-3 text-text-subtle" /> Cargo Payload
          </label>
          <Select
            options={CARGO_OPTIONS}
            value={cargo}
            onChange={(e) => onCargoChange(e.target.value)}
          />
        </div>
        <div>
          <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider block mb-1 flex items-center gap-1">
            <ShieldAlert className={cn("h-3 w-3", isEmergency ? "text-danger" : "text-text-subtle")} /> Protocol Priority
          </label>
          <Select
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
          />
        </div>
      </div>

      {/* ── Primary Optimize CTA ── */}
      <Button
        className="w-full h-8 text-xs font-semibold shadow-md gap-1.5"
        size="sm"
        loading={isCalculating}
        onClick={onCalculate}
      >
        <Sparkles className="h-3.5 w-3.5 text-warning" />
        {isCalculating ? 'Computing Topographic AI Routes…' : 'Optimize Multi-Modal AI Routes'}
      </Button>
    </div>
  )
}
