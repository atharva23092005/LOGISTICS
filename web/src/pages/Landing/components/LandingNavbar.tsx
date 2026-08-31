import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, ArrowRight, ShieldCheck, Activity, Menu, X, Compass,
  Layers, Radio
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const NAV_LINKS = [
  { label: 'Platform', href: '#platform' },
  { label: 'Intelligence', href: '#intelligence' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Technology', href: '#technology' },
]

export function LandingNavbar() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/85 dark:bg-[#040811]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-2xl py-3'
          : 'bg-transparent py-4 md:py-5 border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* ── Logo & Title ── */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-primary/15 border border-blue-200 dark:border-primary/40 flex items-center justify-center text-blue-600 dark:text-primary group-hover:border-blue-400 dark:group-hover:border-primary/70 transition-all shadow-sm">
            <Zap className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-wider">NERA</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-primary/20 text-blue-700 dark:text-primary border border-blue-200 dark:border-primary/30 font-mono">
                AI GEO-ENGINE
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-text-muted hidden sm:inline tracking-tight font-medium">
              Logistics & Accessibility Intelligence
            </span>
          </div>
        </Link>

        {/* ── Center Links (Desktop) ── */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-surface-2/70 border border-slate-200/70 dark:border-white/10 px-3.5 py-1 rounded-full backdrop-blur-md">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-medium text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-full transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── Right Actions & Theme Toggle ── */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden lg:flex items-center gap-2 text-2xs text-slate-500 dark:text-text-muted font-medium pr-1 font-mono">
            <span className="status-dot status-dot-green flex-shrink-0 animate-status-pulse" />
            <span>Grid Live (24 Districts)</span>
          </div>

          {/* Theme Toggle (Light Default) */}
          <ThemeToggle />

          <Link
            to="/login"
            className="hidden sm:inline-flex items-center text-xs font-semibold text-slate-700 dark:text-text-muted hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Sign In
          </Link>

          <Button
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="h-8 md:h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm dark:shadow-lg dark:shadow-primary/20 px-3.5 rounded-lg"
          >
            <span>Command Center</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-white md:hidden border border-slate-200 dark:border-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Dropdown ── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-[#080E1A]/98 border-b border-slate-200 dark:border-white/10 px-4 py-4 space-y-3 animate-fade-in backdrop-blur-xl">
          <nav className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-white py-1.5 border-b border-slate-100 dark:border-white/5"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-text-muted font-mono">
            <span className="flex items-center gap-1.5">
              <span className="status-dot status-dot-green" />
              <span>System Live: 24 Districts Monitored</span>
            </span>
          </div>
        </div>
      )}
    </header>
  )
}
