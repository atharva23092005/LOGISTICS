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
        'glass-panel rounded-2xl p-4 border border-white/10 shadow-2xl bg-[#0D1626]/95 backdrop-blur-xl text-text space-y-3.5',
        className
      )}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Trip Replay & GPS Playback</span>
              <span className="text-[10px] text-primary font-semibold">
                {vehicle.registrationNo}
              </span>
            </div>
            <div className="text-[10px] text-text-muted">
              {vehicle.origin} → {vehicle.destination} • Driver: {vehicle.driver}
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Telemetry Strip at Scrubbed Timestamp ─────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
          <div className="text-[10px] text-text-muted flex items-center gap-1">
            <Gauge className="h-3 w-3 text-primary" /> Speed at Point
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {currentSpeed} <span className="text-2xs font-normal text-text-dim">km/h</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
          <div className="text-[10px] text-text-muted flex items-center gap-1">
            <Fuel className="h-3 w-3 text-warning" /> Fuel Level
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {currentFuel}%
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
          <div className="text-[10px] text-text-muted flex items-center gap-1">
            <Clock className="h-3 w-3 text-success" /> Continuous Driving
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {drivingHours} <span className="text-2xs font-normal text-text-dim">/ 8.0 hrs max</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
          <div className="text-[10px] text-text-muted flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-info" /> Driver Fatigue
          </div>
          <div className="text-xs font-semibold text-success mt-1">
            Optimal (Green)
          </div>
        </div>
      </div>

      {/* ── Timeline Slider & Playback Controls ───────────────────────────── */}
      <div className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-2xs text-text-muted">
          <span>08:00 AM (Start)</span>
          <span className="font-bold text-white">{currentMilestone.time}</span>
          <span>Current Position ({Math.round(scrubPct)}%)</span>
        </div>

        {/* Range Scrubber */}
        <input
          type="range"
          min={0}
          max={100}
          value={scrubPct}
          onChange={(e) => setScrubPct(Number(e.target.value))}
          className="w-full accent-primary cursor-pointer h-1.5 bg-surface-3 rounded-lg appearance-none"
        />

        {/* Controls Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-xs bg-white/5"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Replay'}</span>
            </Button>

            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => setScrubPct(0)}
              title="Restart from origin"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[10px] text-text-muted mr-1">Speed:</span>
            {[1, 2, 4].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaySpeed(spd as 1 | 2 | 4)}
                className={cn(
                  'px-2 py-0.5 rounded text-[10px] font-bold transition-colors',
                  playSpeed === spd
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-text-muted hover:text-white'
                )}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active Milestone Card ─────────────────────────────────────────── */}
      <div className="bg-surface-2 border border-border/80 p-2.5 rounded-xl space-y-1 text-2xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            {currentMilestone.title}
          </span>
          <span className="text-[10px] text-text-muted">
            {currentMilestone.time}
          </span>
        </div>
        <p className="text-text-muted pl-5">{currentMilestone.note}</p>
      </div>
    </div>
  )
}
