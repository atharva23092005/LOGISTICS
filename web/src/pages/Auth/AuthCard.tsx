import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Zap, Eye, EyeOff, Shield, MapPin, Truck, ArrowRight,
  Globe, Mail, Lock, User as UserIcon, Building2,
  CheckCircle2, KeyRound, Radio, ShieldCheck, ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/utils/cn'
import type { User, UserRole } from '@/types'

const STATES_AND_DISTRICTS: Record<string, string[]> = {
  'Assam': ['Guwahati', 'Jorhat', 'Dibrugarh', 'Silchar', 'Tezpur', 'Nagaon', 'Tinsukia'],
  'Arunachal Pradesh': ['East Siang', 'Papum Pare', 'Tawang', 'West Kameng', 'Changlang'],
  'Meghalaya': ['East Khasi Hills', 'West Garo Hills', 'Ri-Bhoi', 'Jaintia Hills'],
  'Manipur': ['Imphal West', 'Imphal East', 'Churachandpur', 'Senapati', 'Ukhrul'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Champhai', 'Kolasib', 'Serchhip'],
  'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung', 'Mon', 'Wokha'],
  'Tripura': ['West Tripura', 'Dhalai', 'Gomati', 'North Tripura'],
  'Sikkim': ['East Sikkim', 'West Sikkim', 'North Sikkim', 'South Sikkim'],
}

const DEPARTMENTS = [
  'State Disaster Management Authority (SDMA)',
  'Border Roads Organisation (BRO / NHAI)',
  'Health & Family Welfare (Medical Lifelines)',
  'Food & Civil Supplies (Rations & Relief)',
  'Regional Transport Authority (RTA)',
  'State Emergency Operation Center (SEOC)',
]

const DEMO_ACCOUNTS: { label: string; role: string; roleKey: UserRole; user: User; password: string }[] = [
  {
    label: 'Logistics Coordinator',
    role: 'Guwahati HQ',
    roleKey: 'dispatcher',
    password: 'demo',
    user: { id: 'u1', name: 'Rajesh Kumar', email: 'dispatcher@ner-logistics.in', role: 'dispatcher', district: 'Guwahati' },
  },
  {
    label: 'District Admin',
    role: 'East Siang',
    roleKey: 'district_admin',
    password: 'demo',
    user: { id: 'u2', name: 'Tsering Norbu', email: 'district.admin@ner-logistics.in', role: 'district_admin', district: 'East Siang' },
  },
  {
    label: 'Field Officer',
    role: 'Pasighat Sector',
    roleKey: 'field_officer',
    password: 'demo',
    user: { id: 'u4', name: 'Priya Das', email: 'field.officer@ner-logistics.in', role: 'field_officer', district: 'East Siang' },
  },
  {
    label: 'Convoy Driver',
    role: 'AR-01-GH-2345',
    roleKey: 'driver',
    password: 'demo',
    user: { id: 'u5', name: 'Sanjay Taye', email: 'driver@ner-logistics.in', role: 'driver', district: 'Dibrugarh', assignedVehicleId: 'v4' },
  },
  {
    label: 'Senior Analyst',
    role: 'Statewide HQ',
    roleKey: 'senior_official',
    password: 'demo',
    user: { id: 'u3', name: 'Dr. Amit Sharma', email: 'senior.official@ner-logistics.in', role: 'senior_official', district: 'Statewide HQ' },
  },
]

interface AuthCardProps {
  initialMode?: 'login' | 'register'
}

export function AuthCard({ initialMode = 'login' }: AuthCardProps) {
  const navigate = useNavigate()
  const login = useAppStore((s) => s.login)

  const [mode, setMode] = useState<'login' | 'register'>(initialMode)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('dispatcher@ner-logistics.in')
  const [loginPassword, setLoginPassword] = useState('demo')
  const [rememberMe, setRememberMe] = useState(true)
  const [showLoginPass, setShowLoginPass] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)

  // Register form state
  const [fullName, setFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showRegPass, setShowRegPass] = useState(false)
  const [department, setDepartment] = useState(DEPARTMENTS[0])
  const [selectedRole, setSelectedRole] = useState<UserRole>('dispatcher')
  const [selectedState, setSelectedState] = useState('Assam')
  const [selectedDistrict, setSelectedDistrict] = useState(STATES_AND_DISTRICTS['Assam'][0])
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [regLoading, setRegLoading] = useState(false)

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  // Password strength calculation
  const passStrength = useMemo(() => {
    if (!regPassword) return { score: 0, text: 'Empty', color: 'bg-slate-200 dark:bg-slate-700' }
    let score = 0
    if (regPassword.length >= 8) score += 1
    if (/[A-Z]/.test(regPassword)) score += 1
    if (/[0-9]/.test(regPassword)) score += 1
    if (/[^A-Za-z0-9]/.test(regPassword)) score += 1

    if (score <= 1) return { score: 25, text: 'Weak', color: 'bg-rose-500' }
    if (score === 2) return { score: 50, text: 'Fair', color: 'bg-amber-500' }
    if (score === 3) return { score: 75, text: 'Good', color: 'bg-blue-500' }
    return { score: 100, text: 'Strong', color: 'bg-emerald-500' }
  }, [regPassword])

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName)
    setSelectedDistrict(STATES_AND_DISTRICTS[stateName][0] || '')
  }

  const navigateAfterAuth = (role: UserRole) => {
    if (role === 'driver') navigate('/driver')
    else if (role === 'field_officer') navigate('/field-officer')
    else navigate('/dashboard')
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    await new Promise((r) => setTimeout(r, 400))

    const acc = DEMO_ACCOUNTS.find(
      (a) => a.user.email.toLowerCase() === loginEmail.trim().toLowerCase() && (a.password === loginPassword || loginPassword === 'demo')
    )

    if (acc) {
      login(acc.user)
      toast.success(`Welcome, ${acc.user.name}`)
      navigateAfterAuth(acc.user.role)
    } else if (loginEmail.includes('@') && loginPassword.length >= 4) {
      const customUser: User = {
        id: `user-${Date.now()}`,
        name: loginEmail.split('@')[0].replace('.', ' '),
        email: loginEmail,
        role: 'dispatcher',
        district: 'Guwahati',
      }
      login(customUser)
      toast.success(`Signed in as ${customUser.name}`)
      navigateAfterAuth('dispatcher')
    } else {
      toast.error('Invalid credentials', {
        description: 'Please check your email and password or tap a quick demo role below.',
      })
    }
    setLoginLoading(false)
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      toast.error('Full Name is required')
      return
    }
    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      toast.error('Please enter a valid email address')
      return
    }
    if (regPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (regPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!agreeTerms) {
      toast.error('Please accept the mission protocol terms')
      return
    }

    setRegLoading(true)
    await new Promise((r) => setTimeout(r, 500))

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: fullName.trim(),
      email: regEmail.trim(),
      role: selectedRole,
      district: selectedDistrict,
    }

    login(newUser)
    toast.success(`Account created! Welcome, ${newUser.name}`)
    setRegLoading(false)
    navigateAfterAuth(selectedRole)
  }

  const handleQuickLogin = (acc: typeof DEMO_ACCOUNTS[0]) => {
    login(acc.user)
    toast.success(`Logged in as ${acc.user.name} (${acc.label})`)
    navigateAfterAuth(acc.user.role)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060A14] text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 relative overflow-hidden transition-colors duration-200">
      
      {/* ── Soft Lighter Gradient & Ambient Grid Shell ──────────────────── */}
      <div className="absolute inset-0 bg-tactical-grid opacity-25 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-b from-blue-100/60 via-sky-50/30 to-transparent dark:from-primary/10 dark:via-blue-900/5 dark:to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-gradient-to-t from-emerald-100/40 to-transparent dark:from-emerald-500/5 dark:to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between relative z-10">
        <Link
          to="/"
          className="text-xs font-medium text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors group px-2.5 py-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/5"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
          <span>Back to Landing</span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* ── Centered Minimal Auth Box ──────────────────────────────────── */}
      <div className="w-full max-w-lg mx-auto my-auto relative z-10 py-6">
        
        {/* Card Frame */}
        <div className="bg-white/95 dark:bg-[#080E1A]/95 border border-slate-200/90 dark:border-white/10 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          
          {/* Header Brand */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-blue-600 dark:bg-primary text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-wider">
                NERA
              </span>
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {mode === 'login' ? 'Sign in to Command Center' : 'Create an Account'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-text-muted">
              {mode === 'login'
                ? 'Access real-time logistics and terrain intelligence'
                : 'Register your official operational clearance credentials'}
            </p>
          </div>

          {/* Minimal Mode Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-surface border border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={cn(
                'py-1.5 px-3 rounded-lg text-xs font-bold transition-all',
                mode === 'login'
                  ? 'bg-white dark:bg-surface-2 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={cn(
                'py-1.5 px-3 rounded-lg text-xs font-bold transition-all',
                mode === 'register'
                  ? 'bg-white dark:bg-surface-2 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-text-muted hover:text-slate-900 dark:hover:text-white'
              )}
            >
              Register
            </button>
          </div>

          {/* ══════════════ TAB 1: SIGN IN ══════════════ */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-text-muted">
                  Email address
                </label>
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="dispatcher@ner-logistics.in"
                  className="h-10 rounded-xl bg-slate-50 dark:bg-surface text-slate-900 dark:text-white border-slate-200 dark:border-white/15 text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-text-muted">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(true)}
                    className="text-2xs font-semibold text-blue-600 dark:text-primary hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showLoginPass ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-10 rounded-xl bg-slate-50 dark:bg-surface text-slate-900 dark:text-white border-slate-200 dark:border-white/15 text-xs pr-10 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 p-1"
                  >
                    {showLoginPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-text-muted">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-surface"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-2xs text-slate-400 dark:text-text-dim font-mono">TLS 256-bit</span>
              </div>

              <Button
                type="submit"
                size="lg"
                loading={loginLoading}
                className="w-full h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm mt-2"
              >
                <span>Sign In</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </form>
          )}

          {/* ══════════════ TAB 2: REGISTER ══════════════ */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-text-muted">Full Name</label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Inspector R. Lyngdoh"
                    className="h-9 rounded-xl bg-slate-50 dark:bg-surface text-slate-900 dark:text-white border-slate-200 dark:border-white/15 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-text-muted">Official Email</label>
                  <Input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="r.lyngdoh@sdma.gov.in"
                    className="h-9 rounded-xl bg-slate-50 dark:bg-surface text-slate-900 dark:text-white border-slate-200 dark:border-white/15 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-text-muted">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-surface text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-text-muted">Operational Role</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-surface text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="dispatcher">Logistics Coordinator (Dispatcher)</option>
                    <option value="district_admin">District Disaster Supervisor</option>
                    <option value="field_officer">Field Response Officer</option>
                    <option value="driver">Convoy Fleet Driver</option>
                    <option value="senior_official">Senior Policy / Analyst</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-text-muted">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-surface text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {Object.keys(STATES_AND_DISTRICTS).map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-text-muted">District Sector</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-surface text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {STATES_AND_DISTRICTS[selectedState]?.map((dst) => (
                      <option key={dst} value={dst}>{dst}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-text-muted">Password</label>
                  <div className="relative">
                    <Input
                      type={showRegPass ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="h-9 rounded-xl bg-slate-50 dark:bg-surface text-slate-900 dark:text-white border-slate-200 dark:border-white/15 text-xs pr-9 font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPass(!showRegPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                    >
                      {showRegPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-text-muted">Confirm Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="h-9 rounded-xl bg-slate-50 dark:bg-surface text-slate-900 dark:text-white border-slate-200 dark:border-white/15 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              {/* Compact Strength Bar */}
              {regPassword && (
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px] text-slate-500 dark:text-text-dim">
                    <span>Password Strength:</span>
                    <span className="font-semibold text-slate-700 dark:text-white">{passStrength.text}</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <div className={cn('h-full transition-all', passStrength.color)} style={{ width: `${passStrength.score}%` }} />
                  </div>
                </div>
              )}

              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer text-2xs text-slate-600 dark:text-text-muted">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-surface"
                    required
                  />
                  <span>I agree to the operational emergency dispatch and mission data mandates.</span>
                </label>
              </div>

              <Button
                type="submit"
                size="lg"
                loading={regLoading}
                className="w-full h-10 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm mt-2"
              >
                <span>Create Account</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </form>
          )}

          {/* ══════════════ DEMO LOGINS BELOW FORM ══════════════ */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-text-muted uppercase tracking-wider font-mono">
                1-Tap Demo Access
              </span>
              <span className="text-[10px] text-slate-400 dark:text-text-dim">No password needed</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.user.id}
                  type="button"
                  onClick={() => handleQuickLogin(acc)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-surface hover:bg-blue-50 dark:hover:bg-surface-2 hover:border-blue-300 dark:hover:border-primary/40 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {acc.label}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-text-muted truncate font-mono">
                    {acc.role}
                  </div>
                </button>
              ))}
            </div>

            {/* Public Citizen Portal */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => navigate('/public')}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-surface-2 hover:bg-slate-200 dark:hover:bg-surface-3 text-slate-700 dark:text-text text-xs font-semibold flex items-center justify-between transition-colors border border-slate-200 dark:border-white/10"
              >
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-primary" />
                  <span>Public Citizen Road Safety Portal</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="w-full max-w-lg mx-auto text-center text-2xs text-slate-400 dark:text-text-dim font-mono relative z-10">
        NERA Logistics Intelligence • Built for SIH 2024 / 2025
      </div>

      {/* ── FORGOT PASSWORD MODAL ────────────────────────────────────── */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#080E1A] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-2xl space-y-3.5">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-xs">
                <KeyRound className="h-3.5 w-3.5 text-blue-600 dark:text-primary" />
                <span>Password Recovery</span>
              </div>
              <button
                type="button"
                onClick={() => { setForgotOpen(false); setForgotSent(false); }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {!forgotSent ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!forgotEmail) {
                    toast.error('Please enter your email')
                    return
                  }
                  setForgotSent(true)
                  toast.success('Reset token sent to your email.')
                }}
                className="space-y-3 text-xs"
              >
                <p className="text-slate-600 dark:text-text-muted">
                  Enter your registered official email to receive a recovery token.
                </p>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="officer@ner-logistics.in"
                  className="h-9 rounded-xl bg-slate-50 dark:bg-surface text-slate-900 dark:text-white border-slate-200 dark:border-white/15 text-xs font-mono"
                  required
                />
                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setForgotOpen(false)}
                    className="h-8 text-xs border-slate-200 dark:border-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Send Token
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 py-2 text-center text-xs">
                <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-slate-900 dark:text-white">Token Dispatched</h4>
                  <p className="text-2xs text-slate-500 dark:text-text-muted">
                    Check <strong className="text-slate-800 dark:text-white">{forgotEmail}</strong>. (Demo password is <code className="font-mono text-blue-600 dark:text-primary">demo</code>).
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => { setForgotOpen(false); setForgotSent(false); }}
                  className="w-full h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  Back to Sign In
                </Button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
