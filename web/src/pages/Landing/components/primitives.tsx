import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/* ──────────────────────────────────────────────────────────────────────────
   Landing design primitives — topographic-minimal system.
   One accent (spruce), map-paper ground, ink type. Amber/rose = risk only.
   ────────────────────────────────────────────────────────────────────────── */

/* Shared CTA styles — rock solid high-contrast buttons in light and dark mode */
export const btnPrimary =
  'group inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0E5F54] hover:bg-[#0B4C43] px-5 text-sm font-medium tracking-tight !text-white shadow-sm transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5F54]/50 focus-visible:ring-offset-2'

export const btnSecondary =
  'inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 text-sm font-medium tracking-tight text-slate-800 shadow-2xs transition-all hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E5F54]/40 dark:border-white/20 dark:bg-ink-800 dark:text-white dark:hover:bg-ink-700'

/* Section wrapper — the single source of vertical rhythm + column width */
export function Section({
  id,
  children,
  className,
  bleed,
}: {
  id?: string
  children: ReactNode
  className?: string
  bleed?: boolean
}) {
  return (
    <section id={id} className={cn('relative py-20 sm:py-28', className)}>
      {bleed ? (
        children
      ) : (
        <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-8">{children}</div>
      )}
    </section>
  )
}

/* Eyebrow — a survey-marker label. Optional index only where order is real. */
export function Eyebrow({
  children,
  index,
  tone = 'spruce',
  className,
}: {
  children: ReactNode
  index?: string
  tone?: 'spruce' | 'rose' | 'amber' | 'muted'
  className?: string
}) {
  const toneCls = {
    spruce: 'text-spruce dark:text-spruce-400',
    rose: 'text-rose-700 dark:text-rose-400',
    amber: 'text-amber-700 dark:text-amber-400',
    muted: 'text-slate-500 dark:text-slate-400',
  }[tone]
  const rule = {
    spruce: 'bg-spruce/50',
    rose: 'bg-rose-500/50',
    amber: 'bg-amber-500/50',
    muted: 'bg-slate-400/50',
  }[tone]
  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      {index ? (
        <span className={cn('font-mono text-[11px] font-medium tabular-nums', toneCls)}>{index}</span>
      ) : (
        <span className={cn('h-px w-6', rule)} />
      )}
      <span className={cn('font-mono text-[11px] font-medium uppercase tracking-[0.22em]', toneCls)}>
        {children}
      </span>
    </div>
  )
}

/* Display heading with tuned scale */
export function Heading({
  children,
  className,
  as: Tag = 'h2',
}: {
  children: ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}) {
  return (
    <Tag
      className={cn(
        'font-display font-semibold tracking-tight text-ink dark:text-white [text-wrap:balance]',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

/* Elevation-tick divider — reads as a contour reference line between sections */
export function ContourRule({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-6xl px-6 sm:px-8', className)}>
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-300 dark:to-white/10" />
        {label && (
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">
            {label}
          </span>
        )}
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-300 dark:to-white/10" />
      </div>
    </div>
  )
}

/* A single gentle elevation line — low amplitude topographic wave */
function ridge(y: number, w = 1440) {
  return `M0 ${y} C ${w * 0.22} ${y - 32}, ${w * 0.48} ${y + 28}, ${w * 0.72} ${y - 12} S ${w * 0.92} ${y + 18}, ${w} ${y}`
}

/* Strictly equidistant parallel periodic sine wave pattern — thin, crisp, architectural wave texture */
export function WavyPatternField({
  className,
  rows = 18,
  step = 42,
  amplitude = 16,
  wavelength = 240,
  strokeWidth = 0.85,
  fadeEdges = true,
}: {
  className?: string
  rows?: number
  step?: number
  amplitude?: number
  wavelength?: number
  strokeWidth?: number
  fadeEdges?: boolean
}) {
  const generateWave = (y: number, width = 1440) => {
    let path = `M 0 ${y}`
    const cycles = Math.ceil(width / wavelength) + 1
    for (let i = 0; i < cycles; i++) {
      const x0 = i * wavelength
      const xMid = x0 + wavelength / 2
      const xEnd = x0 + wavelength
      // First crest (upward)
      path += ` C ${x0 + wavelength * 0.18} ${y - amplitude * 1.3}, ${x0 + wavelength * 0.32} ${y - amplitude * 1.3}, ${xMid} ${y}`
      // Second trough (downward)
      path += ` C ${xMid + wavelength * 0.18} ${y + amplitude * 1.3}, ${xMid + wavelength * 0.32} ${y + amplitude * 1.3}, ${xEnd} ${y}`
    }
    return path
  }

  // Strictly equidistant Y positions
  const yPositions = Array.from({ length: rows }, (_, i) => i * step)

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 1440 ${rows * step}`}
      preserveAspectRatio="none"
      className={cn('pointer-events-none absolute inset-0 h-full w-full select-none', className)}
    >
      {fadeEdges ? (
        <>
          <defs>
            <linearGradient id="waveMaskGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.25" />
              <stop offset="20%" stopColor="#fff" stopOpacity="1" />
              <stop offset="80%" stopColor="#fff" stopOpacity="1" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0.25" />
            </linearGradient>
            <mask id="equidistantWaveMask">
              <rect width="1440" height={rows * step} fill="url(#waveMaskGrad)" />
            </mask>
          </defs>
          <g mask="url(#equidistantWaveMask)">
            {yPositions.map((y, idx) => (
              <path
                key={idx}
                d={generateWave(y, 1440)}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            ))}
          </g>
        </>
      ) : (
        <g>
          {yPositions.map((y, idx) => (
            <path
              key={idx}
              d={generateWave(y, 1440)}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          ))}
        </g>
      )}
    </svg>
  )
}

/* Ambient single wavy line backdrop */
export function SingleWavyLine({ className, y = 240 }: { className?: string; y?: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 480"
      preserveAspectRatio="none"
      className={cn('pointer-events-none absolute inset-0 h-full w-full opacity-50', className)}
    >
      <path
        d={ridge(y)}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ContourField alias */
export function ContourField({ className, lines = 16 }: { className?: string; lines?: number }) {
  return <WavyPatternField className={className} rows={lines} strokeWidth={0.85} />
}
