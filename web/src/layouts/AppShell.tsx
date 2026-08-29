import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar }  from './Sidebar'
import { TopBar }   from './TopBar'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/utils/cn'

const selEmergency = (s: ReturnType<typeof useAppStore.getState>) => s.emergency

interface AppShellProps { children: React.ReactNode }

export function AppShell({ children }: AppShellProps) {
  const user      = useAppStore(s => s.user)
  const emergency = useAppStore(selEmergency)
  const location  = useLocation()

  // For Mobile Apps (Field Officer & Driver HUD), bypass desktop TopBar & Sidebar
  if (user?.role === 'field_officer' || user?.role === 'driver') {
    return <div className="h-dvh w-full overflow-hidden bg-[#070B14]">{children}</div>
  }

  // Mobile: drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const toggleMobile = useCallback(() => setMobileOpen(o => !o), [])

  return (
    <div className={cn(
      'h-dvh flex flex-col overflow-hidden bg-background',
      emergency.active && 'ring-2 ring-danger/50 ring-inset'
    )}>
      {/* ── TopBar ──────────────────────────────────────────────────────── */}
      <TopBar onMenuToggle={toggleMobile} mobileMenuOpen={mobileOpen} />

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── Mobile overlay backdrop ─────────────────────────────────────── */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        {/* Mobile: absolute drawer; Desktop: fixed sidebar */}
        <div className={cn(
          // Mobile
          'fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-out lg:relative lg:translate-x-0 lg:z-auto',
          // Add topbar offset on mobile
          'top-[var(--topbar-h)]',
          // Show/hide on mobile
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        )}>
          <Sidebar onMobileClose={() => setMobileOpen(false)} />
        </div>

        {/* ── Main content ───────────────────────────────────────────────── */}
        <main className="flex-1 overflow-auto bg-background min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
