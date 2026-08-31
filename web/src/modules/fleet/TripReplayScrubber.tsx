import { useState, useEffect, useRef } from 'react'
import {
  Play, Pause, RotateCcw, FastForward, Clock, Gauge, Fuel,
  MapPin, AlertTriangle, ShieldCheck, CheckCircle2, ChevronRight, X
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { useMapStore } from '@/stores/mapStore'
import type { Vehicle } from '@/types'

interface TripReplayProps {
  vehicle: Vehicle
  onClose?: () => void
  className?: string
}

interface Milestone {
  time: string
  pct: number
  title: string
  speed: number
  fuel: number
  status: 'normal' | 'caution' | 'critical'
  note?: string
}

export function TripReplayScrubber({ vehicle, onClose, className }: TripReplayProps) {
  const flyTo = useMapStore((s) => s.flyTo)

  // Scrubber percentage (0 to 100)
  const [scrubPct, setScrubPct] = useState(vehicle.progress || 50)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState<1 | 2 | 4>(1)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Milestones for this trip
  const milestones: Milestone[] = [
    {
      time: '08:00 AM',
      pct: 0,
      title: `Departed ${vehicle.origin} Hub`,
      speed: 45,
      fuel: 100,
      status: 'normal',
      note: 'Pre-trip safety inspection cleared. Green tag verified.',
    },
    {
      time: '10:15 AM',
      pct: 25,
      title: 'Major Highway Junction Cleared',
      speed: 58,
      fuel: 88,
      status: 'normal',
      note: 'Traffic flow smooth at 60 km/h average speed.',
    },
    {
      time: '12:30 PM',
      pct: 50,
      title: 'Rainfall Zone Encountered',
      speed: 38,
      fuel: 75,
      status: 'caution',
      note: 'Rainfall 22mm/hr. Speed reduced for safety.',
    },
    {
      time: '02:45 PM',
      pct: 75,
      title: 'Safe Corridor Waypoint',
      speed: 52,
      fuel: 64,
      status: 'normal',
      note: 'Bypassed high-risk landslide zone smoothly.',
    },
    {
      time: 'Current',
      pct: 100,
      title: `Approaching ${vehicle.destination}`,
      speed: vehicle.speed,
      fuel: vehicle.fuelLevel,
      status: vehicle.status === 'delayed' ? 'caution' : vehicle.status === 'stopped' ? 'critical' : 'normal',
      note: `In-transit with ${vehicle.cargo}.`,
    },
  ]

  // Find nearest milestone to current scrub
  const currentMilestone =
    milestones.slice().reverse().find((m) => scrubPct >= m.pct) ?? milestones[0]

  // Interpolated metrics
  const currentSpeed = Math.round(
    currentMilestone.speed + (Math.sin((scrubPct / 100) * Math.PI) * 12)
  )
  const currentFuel = Math.max(
    15,
    Math.round(100 - (scrubPct / 100) * (100 - vehicle.fuelLevel))
  )
  const drivingHours = ((scrubPct / 100) * 6.5).toFixed(1)

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setScrubPct((prev) => {
        if (prev >= 100) {
          setIsPlaying(false)
          return 100
        }
        return Math.min(100, prev + 1.2 * playSpeed)
      })
    }, 150)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying, playSpeed])

  // Sync with route coordinate if routePoints available
  useEffect(() => {
    if (!vehicle.routePoints || vehicle.routePoints.length < 2) return
    const idx = Math.min(
      vehicle.routePoints.length - 1,
      Math.floor((scrubPct / 100) * (vehicle.routePoints.length - 1))
    )
    const pt = vehicle.routePoints[idx]
    if (pt) {
      flyTo(pt, 12)
    }
  }, [scrubPct, vehicle.routePoints, flyTo])

  return (
    <div
      className={cn(
        'rounded-2xl p-4 border border-slate-200/90 dark:border-border shadow-2xl bg-white/95 dark:bg-surface/95 backdrop-blur-xl text-text space-y-3.5 ring-1 ring-black/5 dark:ring-white/10',
        className
      )}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between border-b border-slate-200 dark:border-border pb-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-primary/15 border border-blue-200 dark:border-primary/30 text-primary shadow-2xs flex-shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text truncate">Trip Replay</span>
              <span className="text-[10px] text-primary font-mono font-bold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-primary/10 border border-blue-200 dark:border-primary/20 flex-shrink-0">
                {vehicle.registrationNo}
              </span>
            </div>
            <div className="text-2xs text-text-muted truncate mt-0.5">
              {vehicle.origin} → {vehicle.destination} • {vehicle.driver}
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-slate-100 dark:hover:bg-surface-2 transition-colors flex-shrink-0"
            title="Close Replay"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Telemetry Grid (Balanced 2x2 layout) ───────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Speed */}
        <div className="bg-slate-50 dark:bg-surface-2 border border-slate-200/90 dark:border-border/80 p-2.5 rounded-xl shadow-2xs">
          <div className="text-[11px] font-medium text-text-muted flex items-center gap-1.5 truncate">
            <Gauge className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span>Speed at Point</span>
          </div>
          <div className="text-base font-bold text-text mt-1">
            {currentSpeed} <span className="text-xs font-normal text-text-muted">km/h</span>
          </div>
        </div>

        {/* Fuel */}
        <div className="bg-slate-50 dark:bg-surface-2 border border-slate-200/90 dark:border-border/80 p-2.5 rounded-xl shadow-2xs">
          <div className="text-[11px] font-medium text-text-muted flex items-center gap-1.5 truncate">
            <Fuel className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
            <span>Fuel Level</span>
          </div>
          <div className="text-base font-bold text-text mt-1">
            {currentFuel}%
          </div>
        </div>

        {/* Continuous Driving */}
        <div className="bg-slate-50 dark:bg-surface-2 border border-slate-200/90 dark:border-border/80 p-2.5 rounded-xl shadow-2xs">
          <div className="text-[11px] font-medium text-text-muted flex items-center gap-1.5 truncate">
            <Clock className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
            <span>Continuous Drive</span>
          </div>
          <div className="text-base font-bold text-text mt-1">
            {drivingHours} <span className="text-xs font-normal text-text-muted">/ 8.0 hrs</span>
          </div>
        </div>

        {/* Fatigue */}
        <div className="bg-slate-50 dark:bg-surface-2 border border-slate-200/90 dark:border-border/80 p-2.5 rounded-xl shadow-2xs">
          <div className="text-[11px] font-medium text-text-muted flex items-center gap-1.5 truncate">
            <ShieldCheck className="h-3.5 w-3.5 text-sky-500 flex-shrink-0" />
            <span>Driver Fatigue</span>
          </div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span>Optimal (Safe)</span>
          </div>
        </div>
      </div>

      {/* ── Timeline Slider & Playback Controls ───────────────────────────── */}
      <div className="bg-slate-50 dark:bg-surface-2 border border-slate-200/90 dark:border-border/80 p-3 rounded-xl space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between text-2xs">
          <span className="text-text-muted font-mono">08:00 AM</span>
          <div className="flex items-center gap-1 font-bold text-text bg-white dark:bg-surface px-2 py-0.5 rounded-md border border-slate-200 dark:border-border shadow-2xs">
            <span>{currentMilestone.time}</span>
            <span className="text-primary font-mono">({Math.round(scrubPct)}%)</span>
          </div>
          <span className="text-text-muted font-mono">04:30 PM</span>
        </div>

        {/* Range Scrubber */}
        <input
          type="range"
          min={0}
          max={100}
          value={scrubPct}
          onChange={(e) => setScrubPct(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer h-1.5 bg-slate-200 dark:bg-surface-3 rounded-lg appearance-none"
        />

        {/* Controls Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-3 text-xs bg-white hover:bg-slate-100 dark:bg-surface dark:hover:bg-surface-3 text-text border border-slate-200 dark:border-border shadow-2xs"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Replay'}</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-text-muted hover:text-text hover:bg-slate-200 dark:hover:bg-surface-3"
              onClick={() => setScrubPct(0)}
              title="Restart from origin"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium text-text-muted mr-1">Speed:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaySpeed(spd as 1 | 2 | 4)}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold transition-all shadow-2xs',
                  playSpeed === spd
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white dark:bg-surface border border-slate-200 dark:border-border text-text-muted hover:text-text'
                )}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active Milestone Card ─────────────────────────────────────────── */}
      <div className="bg-blue-50/70 dark:bg-surface-2 border border-blue-200/90 dark:border-border p-3 rounded-xl space-y-1 text-2xs shadow-2xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-text flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <span className="truncate">{currentMilestone.title}</span>
          </span>
          <span className="text-[10px] font-mono text-text-muted flex-shrink-0 bg-white dark:bg-surface px-1.5 py-0.5 rounded border border-slate-200 dark:border-border">
            {currentMilestone.time}
          </span>
        </div>
        <p className="text-text-muted pl-5 leading-relaxed">{currentMilestone.note}</p>
      </div>
    </div>
  )
}
