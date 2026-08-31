import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, Eye, EyeOff, Shield, ArrowRight, ArrowLeft,
  Building2, Lock, Mail, User as UserIcon, CheckCircle2,
  MapPin, Smartphone, Truck, BarChart3, Radio
} from 'lucide-react'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAppStore } from '@/stores/appStore'
import { cn } from '@/utils/cn'
import { WavyPatternField, Eyebrow, btnPrimary } from '../Landing/components/primitives'
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
  'Health & Family Welfare (Emergency Lifelines)',
  'Food & Civil Supplies (Relief Distribution)',
  'Regional Transport Authority (RTA)',
  'State Emergency Operation Center (SEOC)',
]

const ROLE_OPTIONS: { role: UserRole; title: string; desc: string; icon: React.ElementType }[] = [
  { role: 'dispatcher', title: 'Dispatcher / Coordinator', desc: 'Full live routing, convoy dispatch & multi-district monitoring', icon: Zap },
  { role: 'district_admin', title: 'District Admin / Supervisor', desc: 'District incident verification, highway patrol & state escalations', icon: Building2 },
  { role: 'field_officer', title: 'Field Officer (Offline App)', desc: 'Mobile incident reporting with SQLite offline cache & GPS sync', icon: Smartphone },
  { role: 'driver', title: 'Driver / Transporter', desc: 'In-cab turn HUD, offline passkey QR & reroute alerts', icon: Truck },
  { role: 'senior_official', title: 'Senior Official / Analyst', desc: 'Disruption analytics, macro bottlenecks & predictive AI studio', icon: BarChart3 },
]

export function RegisterPage() {
  const navigate = useNavigate()
  const login = useAppStore((s) => s.login)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState(DEPARTMENTS[0])
  const [role, setRole] = useState<UserRole>('dispatcher')
  const [selectedState, setSelectedState] = useState('Assam')
  const [selectedDistrict, setSelectedDistrict] = useState(STATES_AND_DISTRICTS['Assam'][0])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)

  // Password strength calculation
  const passStrength = useMemo(() => {
    if (!password) return { score: 0, text: 'Empty', color: 'bg-slate-200 dark:bg-white/10' }
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 1) return { score: 25, text: 'Weak', color: 'bg-rose-500' }
    if (score === 2) return { score: 50, text: 'Fair', color: 'bg-amber-500' }
    if (score === 3) return { score: 75, text: 'Good', color: 'bg-spruce' }
    return { score: 100, text: 'Strong', color: 'bg-emerald-500' }
  }, [password])

  const handleStateChange = (stateName: string) => {
    setSelectedState(stateName)
    setSelectedDistrict(STATES_AND_DISTRICTS[stateName][0] || '')
  }

  const navigateAfterAuth = (userRole: UserRole) => {
    if (userRole === 'driver') navigate('/driver')
    else if (userRole === 'field_officer') navigate('/field-officer')
    else navigate('/dashboard')
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName.trim()) {
      toast.error('Full Name is required')
      return
    }
    if (!email.includes('@') || !email.includes('.')) {
      toast.error('Please enter a valid official email address')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (!agreeTerms) {
      toast.error('Please accept the mission clearance terms')
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 450))

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      role: role,
      district: selectedDistrict,
    }

    login(newUser)
    toast.success(`Account Registered: ${newUser.name}`, {
      description: `Role assigned: ${role.replace('_', ' ').toUpperCase()} • District: ${selectedDistrict}`
    })
    navigateAfterAuth(role)
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-paper font-sans text-ink antialiased selection:bg-spruce/20 selection:text-spruce-700 dark:bg-ink-900 dark:text-slate-200 dark:selection:bg-spruce-400/25 dark:selection:text-white">
      
      {/* Thin equidistant wave pattern backdrop — darkened */}
      <WavyPatternField className="text-slate-900/[0.22] dark:text-white/[0.16]" rows={22} step={42} strokeWidth={1} />
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
              STATE ENROLLMENT ACTIVE
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main Registration Content ── */}
      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 sm:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
          
          {/* ── Left Column: Operational Role Selection & Context (5 cols) ── */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <Eyebrow tone="spruce">Enrollment Portal</Eyebrow>
              <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink dark:text-white sm:text-4xl">
                Register Operational Corridor ID
              </h1>
              <p className="mt-3 text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                Authorize departmental access for multi-hazard terrain tracking, emergency routing, and field synchronizations.
              </p>
            </div>

            {/* Role selection cards */}
            <div className="rounded-2xl border border-slate-200/90 bg-paper-deep p-5 shadow-2xs dark:border-white/10 dark:bg-ink-800/60 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-white/10">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Select Command Role
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Defines access scope
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = role === opt.role

                  return (
                    <div
                      key={opt.role}
                      onClick={() => setRole(opt.role)}
                      className={cn(
                        'group flex items-start gap-3 rounded-xl border p-3 transition-all cursor-pointer select-none',
                        isSelected
                          ? 'border-spruce bg-white shadow-xs ring-1 ring-spruce/30 dark:border-spruce-400 dark:bg-ink-900 dark:ring-spruce-400/30'
                          : 'border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-white/5 dark:bg-ink-800/40 dark:hover:border-white/15 dark:hover:bg-ink-800/80'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border transition-colors mt-0.5',
                          isSelected
                            ? 'border-spruce/30 bg-spruce/10 text-spruce dark:border-spruce-400/30 dark:bg-spruce-400/15 dark:text-spruce-300'
                            : 'border-slate-200 bg-paper text-slate-500 group-hover:text-ink dark:border-white/10 dark:bg-ink-900 dark:text-slate-400 dark:group-hover:text-white'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs sm:text-sm text-ink dark:text-white">
                            {opt.title}
                          </span>
                          {isSelected && (
                            <span className="flex h-1.5 w-1.5 rounded-full bg-spruce-500 dark:bg-spruce-400" />
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          {opt.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Compliance footer */}
            <div className="flex items-center gap-2 border-t border-slate-200/80 pt-4 font-mono text-[11px] text-slate-500 dark:border-white/10 dark:text-slate-400">
              <Shield className="h-3.5 w-3.5 text-spruce dark:text-spruce-400" />
              <span>NDMA & MoRTH Encrypted State Gateway</span>
            </div>
          </div>

          {/* ── Right Column: Registration Form (7 cols) ── */}
          <div className="lg:col-span-7">
            <div className="relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-ink-800/80 sm:p-8">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-white/10">
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight text-ink dark:text-white">
                    Operator Credentials
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Complete your official field registration
                  </p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-spruce/10 text-spruce dark:bg-spruce-400/10 dark:text-spruce-300">
                  <UserIcon className="h-4 w-4" />
                </span>
              </div>

              <form onSubmit={handleRegisterSubmit} className="mt-6 space-y-4">
                
                {/* Full Name & Email Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="fullname" className="block text-[12px] font-medium text-slate-700 dark:text-slate-300">
                      Full Legal Name
                    </label>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="fullname"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Tenzing Norbu"
                        className="w-full rounded-lg border border-slate-200 bg-paper px-3.5 py-2 pl-9 text-sm text-ink placeholder:text-slate-400 focus:border-spruce focus:outline-none focus:ring-2 focus:ring-spruce/20 dark:border-white/10 dark:bg-ink-900 dark:text-white dark:focus:border-spruce-400 dark:focus:ring-spruce-400/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reg-email" className="block text-[12px] font-medium text-slate-700 dark:text-slate-300">
                      Official Email Address
                    </label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="officer@ner-logistics.in"
                        className="w-full rounded-lg border border-slate-200 bg-paper px-3.5 py-2 pl-9 text-sm text-ink placeholder:text-slate-400 focus:border-spruce focus:outline-none focus:ring-2 focus:ring-spruce/20 dark:border-white/10 dark:bg-ink-900 dark:text-white dark:focus:border-spruce-400 dark:focus:ring-spruce-400/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Department Selector */}
                <div className="space-y-1.5">
                  <label htmlFor="dept" className="block text-[12px] font-medium text-slate-700 dark:text-slate-300">
                    Department / Agency
                  </label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      id="dept"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-paper px-3.5 py-2 pl-9 text-sm text-ink focus:border-spruce focus:outline-none focus:ring-2 focus:ring-spruce/20 dark:border-white/10 dark:bg-ink-900 dark:text-white dark:focus:border-spruce-400 dark:focus:ring-spruce-400/20 transition-all cursor-pointer"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d} className="dark:bg-ink-900">
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* State & District Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="state" className="block text-[12px] font-medium text-slate-700 dark:text-slate-300">
                      Operational State
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select
                        id="state"
                        value={selectedState}
                        onChange={(e) => handleStateChange(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-paper px-3.5 py-2 pl-9 text-sm text-ink focus:border-spruce focus:outline-none focus:ring-2 focus:ring-spruce/20 dark:border-white/10 dark:bg-ink-900 dark:text-white dark:focus:border-spruce-400 dark:focus:ring-spruce-400/20 transition-all cursor-pointer"
                      >
                        {Object.keys(STATES_AND_DISTRICTS).map((st) => (
                          <option key={st} value={st} className="dark:bg-ink-900">
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="district" className="block text-[12px] font-medium text-slate-700 dark:text-slate-300">
                      Nodal District / Sector
                    </label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <select
                        id="district"
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-paper px-3.5 py-2 pl-9 text-sm text-ink focus:border-spruce focus:outline-none focus:ring-2 focus:ring-spruce/20 dark:border-white/10 dark:bg-ink-900 dark:text-white dark:focus:border-spruce-400 dark:focus:ring-spruce-400/20 transition-all cursor-pointer"
                      >
                        {(STATES_AND_DISTRICTS[selectedState] || []).map((dst) => (
                          <option key={dst} value={dst} className="dark:bg-ink-900">
                            {dst}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password Row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="reg-pass" className="block text-[12px] font-medium text-slate-700 dark:text-slate-300">
                      Password / Access Key
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="reg-pass"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-slate-200 bg-paper px-3.5 py-2 pl-9 pr-9 text-sm text-ink placeholder:text-slate-400 focus:border-spruce focus:outline-none focus:ring-2 focus:ring-spruce/20 dark:border-white/10 dark:bg-ink-900 dark:text-white dark:focus:border-spruce-400 dark:focus:ring-spruce-400/20 transition-all"
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

                  <div className="space-y-1.5">
                    <label htmlFor="reg-confirm" className="block text-[12px] font-medium text-slate-700 dark:text-slate-300">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        id="reg-confirm"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-lg border border-slate-200 bg-paper px-3.5 py-2 pl-9 text-sm text-ink placeholder:text-slate-400 focus:border-spruce focus:outline-none focus:ring-2 focus:ring-spruce/20 dark:border-white/10 dark:bg-ink-900 dark:text-white dark:focus:border-spruce-400 dark:focus:ring-spruce-400/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Password Strength</span>
                      <span className="font-medium text-ink dark:text-white">{passStrength.text}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div
                        className={cn('h-full transition-all duration-300', passStrength.color)}
                        style={{ width: `${passStrength.score}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Terms Agreement Checkbox */}
                <div className="flex items-start gap-2.5 pt-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-spruce focus:ring-spruce dark:border-white/20 dark:bg-ink-900"
                  />
                  <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                    I acknowledge that I am an authorized logistics or emergency responder operating under NDMA / State Emergency Protocol guidelines.
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={cn(btnPrimary, 'w-full py-2.5 text-[14px] disabled:opacity-70 shadow-xs')}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Enrolling Operator...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Register Command Account
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {/* Login Callout */}
              <div className="mt-6 rounded-xl border border-slate-200/80 bg-paper p-3.5 text-center text-xs text-slate-600 dark:border-white/10 dark:bg-ink-900/60 dark:text-slate-400">
                Already hold an authorized corridor ID?{' '}
                <Link to="/login" className="font-semibold text-spruce hover:underline dark:text-spruce-400">
                  Operator Sign In →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
