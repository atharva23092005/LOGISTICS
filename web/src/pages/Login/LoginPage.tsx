import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, Eye, EyeOff, Shield, ArrowRight, Lock, Mail,
  CheckCircle2, KeyRound, Radio, Smartphone, Truck,
  Building2, BarChart3, ArrowLeft, Compass
} from 'lucide-react'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Modal } from '@/components/ui/modal'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/utils/cn'
import { WavyPatternField, Eyebrow, btnPrimary, btnSecondary } from '../Landing/components/primitives'
import type { User, UserRole } from '@/types'

interface DemoAccount {
  label: string
  roleName: string
  roleKey: UserRole
  district: string
  icon: React.ElementType
  user: User
  password: string
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: 'Logistics Coordinator',
    roleName: 'Live Command & Dispatch',
    roleKey: 'dispatcher',
    district: 'Guwahati HQ',
    icon: Zap,
    password: 'demo',
    user: { id: 'u1', name: 'Rajesh Kumar', email: 'dispatcher@ner-logistics.in', role: 'dispatcher', district: 'Guwahati' },
  },
  {
    label: 'District Magistrate',
    roleName: 'Verification & Escalations',
    roleKey: 'district_admin',
    district: 'East Siang Sector',
    icon: Building2,
    password: 'demo',
    user: { id: 'u2', name: 'Tsering Norbu', email: 'district.admin@ner-logistics.in', role: 'district_admin', district: 'East Siang' },
  },
  {
    label: 'Senior Policy Analyst',
    roleName: 'Disruption Trends & ML Studio',
    roleKey: 'senior_official',
    district: 'Statewide HQ',
    icon: BarChart3,
    password: 'demo',
    user: { id: 'u3', name: 'Dr. Amit Sharma', email: 'senior.official@ner-logistics.in', role: 'senior_official', district: 'Statewide HQ' },
  },
  {
    label: 'Field Ops Officer',
    roleName: 'Offline SQLite Incident Sync',
    roleKey: 'field_officer',
    district: 'Pasighat Sector',
    icon: Smartphone,
    password: 'demo',
    user: { id: 'u4', name: 'Priya Das', email: 'field.officer@ner-logistics.in', role: 'field_officer', district: 'East Siang' },
  },
  {
    label: 'Convoy Transporter',
    roleName: 'In-Cab HUD & Mid-Trip Reroutes',
    roleKey: 'driver',
    district: 'Dibrugarh Corridor',
    icon: Truck,
    password: 'demo',
    user: { id: 'u5', name: 'Sanjay Taye', email: 'driver@ner-logistics.in', role: 'driver', district: 'Dibrugarh', assignedVehicleId: 'v4' },
  },
]

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAppStore((s) => s.login)

  const [email, setEmail] = useState('dispatcher@ner-logistics.in')
  const [password, setPassword] = useState('demo')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const navigateAfterAuth = (role: UserRole) => {
    if (role === 'driver') navigate('/driver')
    else if (role === 'field_officer') navigate('/field-officer')
    else navigate('/dashboard')
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 350))

    const acc = DEMO_ACCOUNTS.find(
      (a) => a.user.email.toLowerCase() === email.trim().toLowerCase() && (a.password === password || password === 'demo')
    )

    if (acc) {
      login(acc.user)
      toast.success(`Welcome back, ${acc.user.name}`, {
        description: `Authenticated as ${acc.label} (${acc.district})`
      })
      navigateAfterAuth(acc.user.role)
    } else if (email.includes('@') && password.length >= 4) {
      const customUser: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0].replace('.', ' '),
        email: email,
        role: 'dispatcher',
        district: 'Guwahati',
      }
      login(customUser)
      toast.success(`Signed in as ${customUser.name}`)
      navigateAfterAuth('dispatcher')
    } else {
      toast.error('Invalid Credentials', {
        description: 'Please select one of the demo profiles or enter a valid email.',
      })
      setLoading(false)
    }
  }

  const handleSelectDemo = (acc: DemoAccount) => {
    setEmail(acc.user.email)
    setPassword(acc.password)
    toast.info(`Loaded credentials for ${acc.label}`)
  }

  const handleInstantLogin = (acc: DemoAccount) => {
    login(acc.user)
    toast.success(`Direct Access: ${acc.label}`, {
      description: `Logged in as ${acc.user.name}`
    })
    navigateAfterAuth(acc.user.role)
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-paper font-sans text-ink antialiased selection:bg-spruce/20 selection:text-spruce-700 dark:bg-ink-900 dark:text-slate-200 dark:selection:bg-spruce-400/25 dark:selection:text-white">
      
      {/* Thin equidistant wave pattern backdrop — darkened */}
      <WavyPatternField className="text-slate-900/[0.22] dark:text-white/[0.16]" rows={20} step={42} strokeWidth={1} />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-spruce/20 to-transparent" />

      {/* ── Top Navigation Bar ── */}
      <header className="relative z-20 border-b border-slate-200/80 bg-paper/80 backdrop-blur-md dark:border-white/10 dark:bg-ink-900/80">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/80 px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs transition-colors hover:border-slate-300 hover:text-ink dark:border-white/10 dark:bg-ink-800/70 dark:text-slate-300 dark:hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Overview</span>
            </Link>

            <div className="hidden h-4 w-px bg-slate-200 dark:bg-white/10 sm:block" />

            <div className="hidden sm:flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-spruce text-white font-display font-bold text-xs">
                N
              </span>
              <span className="font-display font-semibold tracking-tight text-ink dark:text-white text-sm">
                NERA Logistics Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-md bg-spruce/10 px-2.5 py-1 font-mono text-[10px] font-semibold text-spruce dark:bg-spruce-400/10 dark:text-spruce-300">
              <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
              TELEMETRY GATEWAY ACTIVE
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Auth Portal Content ── */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 sm:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
          
          {/* ── Left Column: Demo Profiles & System Context (7 cols) ── */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <Eyebrow tone="spruce">Command Portal</Eyebrow>
              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink dark:text-white sm:text-4xl">
                Authorized Personnel Sign In
              </h1>
              <p className="mt-3 text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400 max-w-xl">
                Access real-time multi-hazard routing, landslide telemetry, and offline fleet synchronization across the 8 North Eastern states.
              </p>
            </div>

            {/* Demo Fast-Switch Section */}
            <div className="rounded-2xl border border-slate-200/90 bg-paper-deep p-5 shadow-2xs dark:border-white/10 dark:bg-ink-800/60 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-spruce dark:text-spruce-400" />
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Fast Demo Accounts
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Click card to load · Arrow for instant access
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {DEMO_ACCOUNTS.map((acc) => {
                  const Icon = acc.icon
                  const isSelected = email.toLowerCase() === acc.user.email.toLowerCase()

                  return (
                    <div
                      key={acc.roleKey}
                      onClick={() => handleSelectDemo(acc)}
                      className={cn(
                        'group flex items-center justify-between gap-3.5 rounded-xl border p-3 transition-all cursor-pointer select-none',
                        isSelected
                          ? 'border-spruce bg-white shadow-xs ring-1 ring-spruce/30 dark:border-spruce-400 dark:bg-ink-900 dark:ring-spruce-400/30'
                          : 'border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-white/5 dark:bg-ink-800/40 dark:hover:border-white/15 dark:hover:bg-ink-800/80'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border transition-colors',
                            isSelected
                              ? 'border-spruce/30 bg-spruce/10 text-spruce dark:border-spruce-400/30 dark:bg-spruce-400/15 dark:text-spruce-300'
                              : 'border-slate-200 bg-paper text-slate-500 group-hover:text-ink dark:border-white/10 dark:bg-ink-900 dark:text-slate-400 dark:group-hover:text-white'
                          )}
                        >
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs sm:text-sm text-ink dark:text-white truncate">
                              {acc.label}
                            </span>
                            {isSelected && (
                              <span className="flex h-1.5 w-1.5 rounded-full bg-spruce-500 dark:bg-spruce-400" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {acc.district} · {acc.roleName}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleInstantLogin(acc)
                        }}
                        title={`Instant login as ${acc.label}`}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-spruce hover:bg-spruce hover:text-white dark:border-white/10 dark:bg-ink-900 dark:text-slate-400 dark:hover:bg-spruce-500 dark:hover:text-white shadow-2xs"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Security & Protocol notice */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4 font-mono text-[11px] text-slate-500 dark:border-white/10 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-spruce dark:text-spruce-400" />
                <span>NDMA & MoRTH Compliant Gateway</span>
              </div>
              <div>AES-256 GCM · TLS 1.3</div>
            </div>
          </div>

          {/* ── Right Column: Sign In Form (5 cols) ── */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-800/80 sm:p-8">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight text-ink dark:text-white">
                    Operator Login
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Enter departmental credentials
                  </p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-spruce/10 text-spruce dark:bg-spruce-400/10 dark:text-spruce-300">
                  <Lock className="h-4 w-4" />
                </span>
              </div>

              <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-[12px] font-medium text-slate-700 dark:text-slate-300">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer@ner-logistics.in"
                      className="w-full rounded-lg border border-slate-200 bg-paper px-3.5 py-2.5 pl-9 text-sm text-ink placeholder:text-slate-400 focus:border-spruce focus:outline-none focus:ring-2 focus:ring-spruce/20 dark:border-white/10 dark:bg-ink-900 dark:text-white dark:focus:border-spruce-400 dark:focus:ring-spruce-400/20 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="pass" className="block text-[12px] font-medium text-slate-700 dark:text-slate-300">
                      Secret Key / Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-[11px] font-medium text-spruce hover:underline dark:text-spruce-400"
                    >
                      Forgot key?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="pass"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-lg border border-slate-200 bg-paper px-3.5 py-2.5 pl-9 pr-10 text-sm text-ink placeholder:text-slate-400 focus:border-spruce focus:outline-none focus:ring-2 focus:ring-spruce/20 dark:border-white/10 dark:bg-ink-900 dark:text-white dark:focus:border-spruce-400 dark:focus:ring-spruce-400/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink dark:hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me option */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-spruce focus:ring-spruce dark:border-white/20 dark:bg-ink-900"
                  />
                  <label htmlFor="remember" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                    Remember terminal session on this hardware
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={cn(btnPrimary, 'w-full py-2.5 text-[14px] disabled:opacity-70 shadow-xs')}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Authenticating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In to Command Center
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {/* Register Callout */}
              <div className="mt-6 rounded-xl border border-slate-200/80 bg-paper p-3.5 text-center text-xs text-slate-600 dark:border-white/10 dark:bg-ink-900/60 dark:text-slate-400">
                Need an authorized department account?{' '}
                <Link to="/register" className="font-semibold text-spruce hover:underline dark:text-spruce-400">
                  Register Corridor ID →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      <Modal
        open={forgotOpen}
        onClose={() => {
          setForgotOpen(false)
          setForgotSent(false)
          setForgotEmail('')
        }}
        title="Reset Operator Key"
        description="Departmental Security Verification"
      >
        <div className="space-y-4 text-xs sm:text-sm">
          {!forgotSent ? (
            <>
              <p className="text-slate-600 dark:text-slate-400">
                Enter your registered official email address. An emergency security verification link will be routed to your nodal coordinator.
              </p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Registered Official Email
                </label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="officer@ner-logistics.in"
                  className="w-full rounded-lg border border-slate-200 bg-paper px-3 py-2 text-sm text-ink focus:border-spruce focus:outline-none focus:ring-1 focus:ring-spruce dark:border-white/10 dark:bg-ink-900 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-ink-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (forgotEmail.includes('@')) {
                      setForgotSent(true)
                      toast.success('Security dispatch code dispatched to nodal desk')
                    } else {
                      toast.error('Please enter a valid email')
                    }
                  }}
                  className={cn(btnPrimary, 'h-8 px-4 text-xs')}
                >
                  Send Reset Request
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-sm text-ink dark:text-white">Security Request Dispatched</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                A verification token has been routed to <strong>{forgotEmail}</strong>. Please check your official inbox.
              </p>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className={cn(btnPrimary, 'h-8 px-4 text-xs mt-2')}
              >
                Return to Login
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
