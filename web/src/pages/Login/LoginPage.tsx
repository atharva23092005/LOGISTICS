import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, Eye, EyeOff, Shield, ArrowRight, Lock, Mail,
  CheckCircle2, KeyRound, Radio, Cpu, ChevronRight,
  Truck, Building2, BarChart3, Smartphone, Sparkles, ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Modal } from '@/components/ui/modal'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/utils/cn'
import type { User, UserRole } from '@/types'

interface DemoAccount {
  label: string
  roleName: string
  roleKey: UserRole
  district: string
  icon: React.ElementType
  color: string
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
    color: 'text-primary bg-primary/10 border-primary/30',
    password: 'demo',
    user: { id: 'u1', name: 'Rajesh Kumar', email: 'dispatcher@ner-logistics.in', role: 'dispatcher', district: 'Guwahati' },
  },
  {
    label: 'District Magistrate',
    roleName: 'Verification & Escalations',
    roleKey: 'district_admin',
    district: 'East Siang Sector',
    icon: Building2,
    color: 'text-warning bg-warning/10 border-warning/30',
    password: 'demo',
    user: { id: 'u2', name: 'Tsering Norbu', email: 'district.admin@ner-logistics.in', role: 'district_admin', district: 'East Siang' },
  },
  {
    label: 'Senior Policy Analyst',
    roleName: 'Disruption Trends & ML Studio',
    roleKey: 'senior_official',
    district: 'Statewide HQ',
    icon: BarChart3,
    color: 'text-info bg-info/10 border-info/30',
    password: 'demo',
    user: { id: 'u3', name: 'Dr. Amit Sharma', email: 'senior.official@ner-logistics.in', role: 'senior_official', district: 'Statewide HQ' },
  },
  {
    label: 'Field Ops Officer',
    roleName: 'Offline SQLite Incident Sync',
    roleKey: 'field_officer',
    district: 'Pasighat Sector',
    icon: Smartphone,
    color: 'text-success bg-success/10 border-success/30',
    password: 'demo',
    user: { id: 'u4', name: 'Priya Das', email: 'field.officer@ner-logistics.in', role: 'field_officer', district: 'East Siang' },
  },
  {
    label: 'Convoy Transporter',
    roleName: 'In-Cab HUD & Mid-Trip Reroutes',
    roleKey: 'driver',
    district: 'Dibrugarh Corridor',
    icon: Truck,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
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
        description: 'Please use one of the demo accounts or enter a valid email.',
      })
      setLoading(false)
    }
  }

  const handleSelectDemo = (acc: DemoAccount) => {
    setEmail(acc.user.email)
    setPassword(acc.password)
    toast.info(`Loaded ${acc.label} credentials`)
  }

  const handleInstantLogin = (acc: DemoAccount) => {
    login(acc.user)
    toast.success(`Direct Access: ${acc.label}`, {
      description: `Logged in as ${acc.user.name}`
    })
    navigateAfterAuth(acc.user.role)
  }

  return (
    <div className="min-h-dvh w-full flex flex-col lg:flex-row bg-background text-text selection:bg-primary/20 selection:text-primary font-sans antialiased overflow-x-hidden">

      {/* ── LEFT HALF: MISSION INTELLIGENCE & DEMO ACCOUNTS ── */}
      <div className="lg:w-5/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-border bg-surface-2/40 relative overflow-hidden">
        
        {/* Subtle tactical background pattern */}
        <div className="absolute inset-0 bg-tactical-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 ambient-glow-blue pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 text-xs font-semibold text-text-muted hover:text-text transition-colors group"
            >
              <div className="h-7 w-7 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-primary/40 transition-colors shadow-sm">
                <ArrowLeft className="h-3.5 w-3.5" />
              </div>
              <span>Back to Overview</span>
            </Link>

            <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1.5 py-1 px-2.5 bg-surface border-border text-2xs font-mono text-text-muted">
              <Radio className="h-2.5 w-2.5 text-success animate-status-pulse" />
              <span>LIVE TELEMETRY V2.5</span>
            </Badge>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">NER LOGISTICS</h1>
                <p className="text-xs text-text-muted">Critical Terrain Transport Intelligence System</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-lg pt-1">
              Real-time multi-hazard routing, proactive landslide prediction, and resilient offline fleet dispatch across the 8 North Eastern states.
            </p>
          </div>
        </div>

        {/* Demo Fast-Switch Cards */}
        <div className="relative z-10 my-8 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted font-mono flex items-center gap-1.5">
              <KeyRound className="h-3 w-3 text-primary" /> Fast Demo Authentication
            </span>
            <span className="text-[10px] text-text-dim">Click card to autofill • Click arrow to jump</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon
              const isSelected = email === acc.user.email
              return (
                <div
                  key={acc.roleKey}
                  onClick={() => handleSelectDemo(acc)}
                  className={cn(
                    'p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group',
                    isSelected
                      ? 'bg-surface border-primary ring-1 ring-primary/30 shadow-sm'
                      : 'bg-surface/70 hover:bg-surface border-border hover:border-border-subtle shadow-none'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn('h-8 w-8 rounded-lg border flex items-center justify-center flex-shrink-0', acc.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text truncate">{acc.label}</span>
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-text-muted truncate">{acc.district} • {acc.roleName}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleInstantLogin(acc)
                    }}
                    title={`Instant login as ${acc.label}`}
                    className="p-1.5 rounded-lg bg-surface-2 hover:bg-primary hover:text-white text-text-muted border border-border transition-all flex-shrink-0 opacity-80 group-hover:opacity-100"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="relative z-10 pt-4 border-t border-border/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-text-dim">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-success" />
            <span>NDMA & MoRTH Compliant Telemetry Gateway</span>
          </div>
          <div className="font-mono text-2xs">AES-256 GCM • TLS 1.3</div>
        </div>
      </div>

      {/* ── RIGHT HALF: MINIMAL LOGIN FORM ── */}
      <div className="lg:w-7/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-16 bg-background relative">
        
        {/* Top bar controls */}
        <div className="flex items-center justify-between pb-6 sm:pb-8">
          <div className="text-xs text-text-muted">
            Need an official account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register Corridor ID
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto my-auto space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-text">Operator Sign In</h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Enter your authorized department email to access the command dashboard.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-text">
                Official Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@ner-logistics.in"
                  className="pl-9 text-xs h-10 bg-surface border-border focus-visible:ring-primary"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-text">
                  Security Passkey / Password
                </Label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-2xs text-primary hover:underline font-medium"
                >
                  Forgot passkey?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-10 text-xs h-10 bg-surface border-border focus-visible:ring-primary"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Terms Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span className="text-xs text-text-muted">Keep terminal session active</span>
              </label>

              <Badge variant="outline" className="text-[10px] text-text-dim border-border bg-surface-2">
                Demo Pass: <span className="font-mono text-primary font-bold ml-1">demo</span>
              </Badge>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 text-xs font-semibold gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Authorization…</span>
                </div>
              ) : (
                <>
                  <span>Authenticate & Launch Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>

          {/* Quick Public Portal Access Link */}
          <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-info/10 border border-info/30 flex items-center justify-center text-info flex-shrink-0">
                <Cpu className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold text-text">Public Citizen Portal</div>
                <div className="text-[11px] text-text-muted">Anonymous highway status & travel advisories</div>
              </div>
            </div>
            <Link
              to="/public"
              className="text-2xs font-semibold px-2.5 py-1.5 rounded-lg bg-surface-2 hover:bg-surface-3 border border-border text-text transition-colors flex-shrink-0"
            >
              View Public
            </Link>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 text-center text-2xs text-text-dim">
          North East Regional Logistics Optimization Engine • State Emergency Response System
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL ── */}
      <Modal
        open={forgotOpen}
        onClose={() => { setForgotOpen(false); setForgotSent(false) }}
        title="Reset Operator Passkey"
        description="Verify your registered disaster response nodal email address"
        size="sm"
      >
        <div className="space-y-4 pt-1">
          {!forgotSent ? (
            <div className="space-y-3">
              <p className="text-xs text-text-muted">
                Enter your department email address and we will generate an emergency cryptographic one-time passkey.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-xs">Nodal Email Address</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="officer@ner-logistics.in"
                  className="text-xs bg-surface border-border"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setForgotOpen(false)} className="text-xs">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    if (forgotEmail.includes('@')) {
                      setForgotSent(true)
                      toast.success('Reset link dispatched')
                    } else {
                      toast.error('Enter a valid email')
                    }
                  }}
                  className="text-xs bg-primary text-white"
                >
                  Send Reset Token
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="h-10 w-10 text-success mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-text">Dispatch Link Sent</h3>
                <p className="text-xs text-text-muted mt-1">
                  Instructions dispatched to <span className="font-mono text-text">{forgotEmail}</span>.
                </p>
              </div>
              <Button size="sm" onClick={() => { setForgotOpen(false); setForgotSent(false) }} className="w-full text-xs">
                Back to Sign In
              </Button>
            </div>
          )}
        </div>
      </Modal>

    </div>
  )
}
