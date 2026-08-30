import { useState, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, Wifi, WifiOff, User, ChevronDown,
  LogOut, Settings, AlertOctagon, Play,
  Cpu, Menu, X, Zap, PanelLeftClose, PanelLeftOpen, PanelLeft,
  Navigation, Building2, BarChart3, Smartphone, Truck, Globe,
  Sun, Moon
} from 'lucide-react'
import { cn } from '@/utils/cn'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, Tooltip
} from '@/components/ui'
import { useAppStore }   from '@/stores/appStore'
import { useAlertStore } from '@/stores/alertStore'
import { useThemeStore } from '@/stores/themeStore'
import { formatDateTime } from '@/utils/format'
import { toast } from 'sonner'
import { NotificationPanel } from './NotificationPanel'

// Module-level selectors
const selUser             = (s: ReturnType<typeof useAppStore.getState>)   => s.user
const selEmergency        = (s: ReturnType<typeof useAppStore.getState>)   => s.emergency
const selDeactivate       = (s: ReturnType<typeof useAppStore.getState>)   => s.deactivateEmergency
const selLogout           = (s: ReturnType<typeof useAppStore.getState>)   => s.logout
const selNetworkOnline    = (s: ReturnType<typeof useAppStore.getState>)   => s.networkOnline
const selDemoMode         = (s: ReturnType<typeof useAppStore.getState>)   => s.demoMode
const selSidebarCollapsed = (s: ReturnType<typeof useAppStore.getState>)   => s.sidebarCollapsed
const selSetSidebarCollapsed = (s: ReturnType<typeof useAppStore.getState>) => s.setSidebarCollapsed
const selAlertActiveCount = (s: ReturnType<typeof useAlertStore.getState>) =>
  s.alerts.filter(a => a.status === 'active').length

// Lazy-load copilot (heavy)
const CopilotChatLazy = lazy(() =>
  import('@/components/ai/CopilotChat').then(m => ({ default: m.CopilotChat }))
)

interface TopBarProps {
  onMenuToggle: () => void
  mobileMenuOpen: boolean
}

export function TopBar({ onMenuToggle, mobileMenuOpen }: TopBarProps) {
  const navigate          = useNavigate()
  const user              = useAppStore(selUser)
  const emergency         = useAppStore(selEmergency)
  const deactivate        = useAppStore(selDeactivate)
  const logout            = useAppStore(selLogout)
  const networkOnline     = useAppStore(selNetworkOnline)
  const demoMode          = useAppStore(selDemoMode)
  const sidebarCollapsed  = useAppStore(selSidebarCollapsed)
  const setSidebarCollapsed = useAppStore(selSetSidebarCollapsed)
  const alertActive       = useAlertStore(selAlertActiveCount)
  const theme             = useThemeStore((s) => s.theme)
  const toggleTheme       = useThemeStore((s) => s.toggleTheme)

  const [notifOpen,   setNotifOpen]   = useState(false)
  const [userMenuOpen,setUserMenuOpen]= useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)

  const now = new Date()

  return (
    <>
      <header className={cn(
        'h-topbar flex items-center justify-between gap-2 px-3 md:px-4 flex-shrink-0 z-20',
        'border-b transition-colors duration-300',
        emergency.active
          ? 'bg-danger/10 border-danger/40'
          : 'bg-surface border-border',
        'shadow-inner-top'
      )}>

        {/* ── Left ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile menu toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors flex-shrink-0"
          >
            {mobileMenuOpen
              ? <X className="h-5 w-5" />
              : <Menu className="h-5 w-5" />
            }
          </button>

          {/* Desktop sidebar collapse toggle */}
          <Tooltip content={sidebarCollapsed ? "Expand Navigation (Ctrl+B)" : "Collapse Navigation (Ctrl+B)"} side="bottom">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors flex-shrink-0"
              title={sidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4 text-primary" />
              ) : (
                <PanelLeft className="h-4 w-4" />
              )}
            </button>
          </Tooltip>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-text tracking-tight">NER</span>
          </div>

          {/* Emergency banner — desktop */}
          {emergency.active && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-danger/15 border border-danger/40">
              <AlertOctagon className="h-4 w-4 text-danger animate-bounce-sm flex-shrink-0" />
              <span className="text-xs font-bold text-danger">EMERGENCY ACTIVE</span>
              <button
                onClick={deactivate}
                className="ml-1 text-2xs font-semibold text-danger/70 hover:text-danger border border-danger/30 hover:border-danger/60 px-2 py-0.5 rounded-md transition-colors"
              >
                Deactivate
              </button>
            </div>
          )}

          {/* Datetime — hidden on mobile */}
          {!emergency.active && (
            <div className="hidden md:flex items-center gap-2 text-xs text-text-muted">
              <span className="font-semibold text-text">NER LOGISTICS</span>
              <span className="text-border">|</span>
              <span>{formatDateTime(now)}</span>
            </div>
          )}
        </div>

        {/* ── Right ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 md:gap-1.5 flex-shrink-0">

          {/* Demo badge */}
          {demoMode && (
            <span className="hidden sm:flex badge-warning items-center gap-1 text-2xs">
              <Play className="h-2.5 w-2.5" /> DEMO
            </span>
          )}

          {/* Theme Toggle */}
          <Tooltip content={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'} side="bottom">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors flex-shrink-0"
              aria-label="Toggle theme"
            >
              {theme === 'dark'
                ? <Sun className="h-4 w-4" />
                : <Moon className="h-4 w-4" />
              }
            </button>
          </Tooltip>

          {/* AI Copilot */}
          <button
            onClick={() => { setCopilotOpen(o => !o); setNotifOpen(false); setUserMenuOpen(false) }}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border',
              copilotOpen
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
            )}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Copilot</span>
          </button>

          {/* Network */}
          <div className={cn(
            'hidden sm:flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg',
            networkOnline ? 'text-success' : 'text-danger bg-danger/10 border border-danger/20'
          )}>
            {networkOnline
              ? <Wifi className="h-3.5 w-3.5" />
              : <WifiOff className="h-3.5 w-3.5" />
            }
            <span className="hidden md:inline">{networkOnline ? 'Live' : 'Offline'}</span>
          </div>

          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(o => !o); setUserMenuOpen(false); setCopilotOpen(false) }}
              className="relative p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-4.5 w-4.5" />
              {alertActive > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-danger text-white text-2xs font-bold flex items-center justify-center leading-none">
                  {alertActive > 9 ? '9+' : alertActive}
                </span>
              )}
            </button>

            {notifOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <NotificationPanel onClose={() => setNotifOpen(false)} />
              </>
            )}
          </div>

          {/* User Dropdown Menu (shadcn / Radix) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-lg hover:bg-surface-2 transition-colors outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-xs font-semibold text-text truncate max-w-[100px]">{user?.name ?? 'Operator'}</div>
                  <div className="text-2xs text-text-muted capitalize">{user?.role?.replace('_', ' ')}</div>
                </div>
                <ChevronDown className="h-3 w-3 text-text-muted hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-1.5">
              <DropdownMenuLabel className="px-2 py-1.5">
                <div className="text-xs font-semibold text-text">{user?.name}</div>
                <div className="text-2xs text-text-muted normal-case font-normal">{user?.email}</div>
                <div className="text-2xs text-text-dim normal-case font-normal">{user?.district} Sector</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Surface / Role Switcher for Demo & Presentation */}
              <div className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Switch Operational Role
              </div>
              <DropdownMenuItem
                onClick={() => {
                  useAppStore.getState().login({ id: 'u1', name: 'Rajesh Kumar', email: 'dispatcher@ner-logistics.in', role: 'dispatcher', district: 'Guwahati' })
                  toast.success('Switched to: Dispatcher (Command Center)')
                  navigate('/dashboard')
                }}
                className="gap-2.5 text-xs py-2"
              >
                <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                  <Navigation className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text">Dispatcher</div>
                  <div className="text-[10px] text-text-muted">Full Live Map & Dispatch</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  useAppStore.getState().login({ id: 'u2', name: 'Tsering Norbu', email: 'district.admin@ner-logistics.in', role: 'district_admin', district: 'East Siang' })
                  toast.success('Switched to: District Admin (East Siang)')
                  navigate('/dashboard')
                }}
                className="gap-2.5 text-xs py-2"
              >
                <div className="h-6 w-6 rounded-md bg-warning/10 border border-warning/20 flex items-center justify-center flex-shrink-0 text-warning">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text">District Admin</div>
                  <div className="text-[10px] text-text-muted">District Verification Queue</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  useAppStore.getState().login({ id: 'u3', name: 'Dr. Amit Sharma', email: 'senior.official@ner-logistics.in', role: 'senior_official', district: 'Statewide HQ' })
                  toast.success('Switched to: Senior Official (Read-Only)')
                  navigate('/dashboard')
                }}
                className="gap-2.5 text-xs py-2"
              >
                <div className="h-6 w-6 rounded-md bg-info/10 border border-info/20 flex items-center justify-center flex-shrink-0 text-info">
                  <BarChart3 className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text">Senior Official</div>
                  <div className="text-[10px] text-text-muted">Read-Only Analytics & Trends</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  useAppStore.getState().login({ id: 'u4', name: 'Priya Das', email: 'field.officer@ner-logistics.in', role: 'field_officer', district: 'East Siang' })
                  toast.success('Switched to: Field Officer (Offline App)')
                  navigate('/dashboard')
                }}
                className="gap-2.5 text-xs py-2"
              >
                <div className="h-6 w-6 rounded-md bg-success/10 border border-success/20 flex items-center justify-center flex-shrink-0 text-success">
                  <Smartphone className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text">Field Officer App</div>
                  <div className="text-[10px] text-text-muted">Offline Reports & Sync</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  useAppStore.getState().login({ id: 'u5', name: 'Sanjay Taye', email: 'driver@ner-logistics.in', role: 'driver', district: 'Dibrugarh', assignedVehicleId: 'v4' })
                  toast.success('Switched to: Driver App')
                  navigate('/driver')
                }}
                className="gap-2.5 text-xs py-2"
              >
                <div className="h-6 w-6 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-400">
                  <Truck className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-text">Driver / Transporter</div>
                  <div className="text-[10px] text-text-muted">Live Reroute & SMS Alert</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('/public')}
                className="gap-2.5 text-xs py-2 text-primary hover:text-primary"
              >
                <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 text-primary">
                  <Globe className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">Public Citizen Portal</div>
                  <div className="text-[10px] text-text-muted">Anonymous Road Status</div>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-2">
                <Settings className="h-3.5 w-3.5 text-text-muted" />
                <span>Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => { logout(); navigate('/login') }}
                className="gap-2 text-danger focus:text-danger focus:bg-danger/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* ── Floating Copilot ────────────────────────────────────────────── */}
      {copilotOpen && (
        <>
          <div className="fixed inset-0 z-[45] lg:hidden" onClick={() => setCopilotOpen(false)} />
          <div className={cn(
            'fixed z-[46] animate-scale-in',
            // Mobile: full screen bottom sheet
            'inset-x-2 bottom-2 top-[calc(var(--topbar-h)+8px)]',
            // Desktop: floating panel
            'lg:inset-auto lg:right-4 lg:top-[calc(var(--topbar-h)+8px)] lg:w-[420px] lg:h-[620px]',
          )}>
            <div className="h-full rounded-xl overflow-hidden shadow-modal border border-border">
              <Suspense fallback={
                <div className="h-full bg-surface flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Cpu className="h-8 w-8 text-primary mx-auto animate-status-pulse" />
                    <p className="text-xs text-text-muted">Loading Copilot…</p>
                  </div>
                </div>
              }>
                <CopilotChatLazy onClose={() => setCopilotOpen(false)} />
              </Suspense>
            </div>
          </div>
        </>
      )}
    </>
  )
}
