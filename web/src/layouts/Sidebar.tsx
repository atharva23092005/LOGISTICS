import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Map, Route, Truck, Bell, BarChart3,
  AlertOctagon, Settings, ChevronLeft, ChevronRight,
  Zap, Radio, X,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAppStore }   from '@/stores/appStore'
import { useAlertStore } from '@/stores/alertStore'
import { Tooltip }       from '@/components/ui/tooltip'

// Module-level stable selectors
const selCollapsed     = (s: ReturnType<typeof useAppStore.getState>)   => s.sidebarCollapsed
const selSetCollapsed  = (s: ReturnType<typeof useAppStore.getState>)   => s.setSidebarCollapsed
const selEmergency     = (s: ReturnType<typeof useAppStore.getState>)   => s.emergency
const selCriticalCount = (s: ReturnType<typeof useAlertStore.getState>) =>
  s.alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length

function getNavItems(role: string) {
  if (role === 'district_admin') {
    return [
      { to: '/dashboard', icon: LayoutDashboard, label: 'District Portal' },
      { to: '/map',       icon: Map,             label: 'District Map' },
      { to: '/alerts',    icon: Bell,            label: 'Incident Queue', badge: true },
      { to: '/emergency', icon: AlertOctagon,    label: 'State Escalation', special: true },
    ]
  }

  if (role === 'senior_official' || role === 'analyst') {
    return [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Executive Cockpit' },
      { to: '/map',       icon: Map,             label: 'Strategic Map' },
      { to: '/analytics', icon: BarChart3,       label: 'Disruption & ML Studio' },
      { to: '/alerts',    icon: Bell,            label: 'Historical Logs', badge: true },
    ]
  }

  // Dispatcher / Default Command Center
  return [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Command Center' },
    { to: '/map',       icon: Map,             label: 'Live Map' },
    { to: '/routes',    icon: Route,           label: 'Route Intelligence' },
    { to: '/fleet',     icon: Truck,           label: 'Fleet' },
    { to: '/alerts',    icon: Bell,            label: 'Alerts', badge: true },
    { to: '/analytics', icon: BarChart3,       label: 'Analytics' },
    { to: '/emergency', icon: AlertOctagon,    label: 'Emergency', special: true },
  ]
}

interface SidebarProps { onMobileClose?: () => void }

export function Sidebar({ onMobileClose }: SidebarProps) {
  const user             = useAppStore(s => s.user)
  const collapsed        = useAppStore(selCollapsed)
  const setSidebarCollapsed = useAppStore(selSetCollapsed)
  const emergency        = useAppStore(selEmergency)
  const criticalCount    = useAlertStore(selCriticalCount)
  const location         = useLocation()

  const role = user?.role ?? 'dispatcher'
  const navItems = getNavItems(role)

  return (
    <aside className={cn(
      'h-full flex flex-col transition-all duration-300 ease-out',
      'bg-surface border-r border-border',
      // Desktop: use collapsed state; Mobile: always full width
      collapsed ? 'lg:w-sidebar-sm w-sidebar' : 'w-sidebar',
    )}>
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div className={cn(
        'flex items-center h-topbar flex-shrink-0 border-b border-border px-3 gap-3',
        collapsed && 'lg:justify-center lg:px-0'
      )}>
        {/* Logo mark */}
        <div className="flex-shrink-0">
          <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center text-primary">
            <Zap className="h-4 w-4" />
          </div>
        </div>

        {(!collapsed) && (
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-text tracking-tight leading-tight">NER LOGISTICS</div>
            <div className="text-2xs text-text-subtle leading-tight">Intelligence Platform</div>
          </div>
        )}

        {/* Mobile close */}
        {onMobileClose && (
          <button
            className="ml-auto lg:hidden p-1 rounded-md text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
            onClick={onMobileClose}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Nav items ────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 hide-scrollbar">
        {navItems.map(item => {
          const Icon         = item.icon
          const isActive     = location.pathname.startsWith(item.to)
          const isEmergency  = item.special && emergency.active
          const badge        = item.badge ? criticalCount : 0
          const label        = item.label

          const itemContent = (
            <NavLink
              to={item.to}
              className={cn(
                'nav-item',
                isActive    && 'active',
                isEmergency && '!text-danger !bg-danger/10 border border-danger/30 animate-pulse-border',
                collapsed   && 'lg:justify-center lg:px-0 lg:w-10 lg:mx-auto'
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0',
                isActive    ? 'text-primary' :
                isEmergency ? 'text-danger'  : 'text-text-muted'
              )} />

              {/* Label — hidden when collapsed on desktop */}
              <span className={cn('truncate flex-1 text-sm', collapsed && 'lg:hidden')}>
                {label}
              </span>

              {/* Badge count */}
              {badge > 0 && !collapsed && (
                <span className="ml-auto badge-critical text-2xs min-w-[18px] text-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
              {badge > 0 && collapsed && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-danger rounded-full lg:block hidden" />
              )}
            </NavLink>
          )

          return collapsed ? (
            <Tooltip key={item.to} content={label} side="right">
              <div className="relative">{itemContent}</div>
            </Tooltip>
          ) : (
            <div key={item.to}>{itemContent}</div>
          )
        })}
      </nav>

      {/* ── Bottom section ───────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-border p-2 space-y-0.5">
        {/* Demo badge */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-1.5 mb-1">
            <Radio className="h-3 w-3 text-warning animate-status-pulse" />
            <span className="text-2xs font-semibold text-warning tracking-wider uppercase">Demo Mode</span>
          </div>
        )}

        {/* Settings */}
        {collapsed ? (
          <Tooltip content="Settings" side="right">
            <NavLink to="/settings" className={cn('nav-item', 'lg:justify-center lg:px-0 lg:w-10 lg:mx-auto')}>
              <Settings className="h-4 w-4 text-text-muted" />
              <span className="lg:hidden text-sm">Settings</span>
            </NavLink>
          </Tooltip>
        ) : (
          <NavLink to="/settings" className="nav-item">
            <Settings className="h-4 w-4 text-text-muted" />
            <span className="text-sm">Settings</span>
          </NavLink>
        )}

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className="nav-item w-full hidden lg:flex"
        >
          {collapsed
            ? <ChevronRight className="h-4 w-4 text-text-muted mx-auto" />
            : <>
                <ChevronLeft className="h-4 w-4 text-text-muted flex-shrink-0" />
                <span className="text-sm text-text-muted">Collapse</span>
              </>
          }
        </button>
      </div>
    </aside>
  )
}
