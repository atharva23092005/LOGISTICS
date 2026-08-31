import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { btnPrimary } from './primitives'

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Approach', href: '#approach' },
  { label: 'Impact', href: '#impact' },
  { label: 'Data', href: '#data' },
]

/* Compact contour mark — a peak read through stacked elevation lines */
function Mark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg bg-spruce text-white',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 15 L9 8 L13 12 L21 4" opacity="0.9" />
        <path d="M3 19 L9 12.5 L13 16 L21 8.5" opacity="0.5" />
      </svg>
    </span>
  )
}

export function LandingNavbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-slate-200/80 bg-paper/80 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/80'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[17px] font-semibold tracking-tight text-ink dark:text-white">
              NERA
            </span>
            <span className="mt-0.5 hidden text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400 sm:block">
              Logistics Intelligence
            </span>
          </span>
        </Link>

        {/* Center links */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-md px-3 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:text-ink dark:text-slate-300 dark:hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden rounded-md px-2.5 py-2 text-[13px] font-medium text-slate-600 transition-colors hover:text-ink dark:text-slate-300 dark:hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <button onClick={() => navigate('/dashboard')} className={cn(btnPrimary, 'h-9 px-4 text-[13px]')}>
            <span className="hidden sm:inline">Launch</span>
            <span className="sm:hidden">Enter</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="animate-fade-in border-b border-slate-200 bg-paper/95 px-6 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-ink-900/95 md:hidden">
          <nav className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-slate-100 py-2.5 text-sm font-medium text-slate-600 last:border-0 dark:border-white/5 dark:text-slate-300"
              >
                {l.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
