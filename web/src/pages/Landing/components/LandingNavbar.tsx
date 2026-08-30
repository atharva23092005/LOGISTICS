import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, ArrowRight, ShieldCheck, Activity, Menu, X, Compass,
  Layers, Radio
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

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
          ? 'bg-[#080E1A]/90 backdrop-blur-md border-b border-white/10 shadow-2xl py-3'
          : 'bg-transparent py-4 md:py-5 border-b border-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* ── Logo & Title ── */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center text-primary group-hover:border-primary/70 transition-all shadow-glow-sm">
            <Zap className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-white tracking-wider">NERA</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30">
                PROTOTYPE
              </span>
            </div>
            <span className="text-[10px] text-text-muted hidden sm:inline tracking-tight font-medium">
              Logistics & Accessibility Intelligence
            </span>
          </div>
        </Link>

        {/* ── Center Links (Desktop) ── */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-2/60 border border-white/5 px-3 py-1 rounded-full backdrop-blur-md">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-medium text-text-muted hover:text-white px-3 py-1.5 rounded-full transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── Right Actions ── */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-2xs text-text-muted font-medium pr-2">
            <span className="status-dot status-dot-green flex-shrink-0 animate-status-pulse" />
            <span>Grid Operational</span>
          </div>

          <Button
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="h-8 md:h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-3.5"
          >
            <span>Launch Command Center</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-text-muted hover:text-white md:hidden border border-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu Dropdown ── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#080E1A]/98 border-b border-white/10 px-4 py-4 space-y-3 animate-fade-in backdrop-blur-xl">
          <nav className="flex flex-col space-y-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-text-muted hover:text-white py-1.5 border-b border-white/5"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 flex items-center justify-between text-xs text-text-muted">
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
