import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Zap, Eye, EyeOff, Shield, ArrowRight, ArrowLeft,
  Building2, Lock, Mail, User as UserIcon, CheckCircle2,
  MapPin, ShieldCheck, Check, Smartphone, Truck, BarChart3
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  { role: 'senior_official', title: 'Senior Official / Analyst', desc: 'Read-only disruption analytics, macro bottlenecks & AI models', icon: BarChart3 },
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
    if (!password) return { score: 0, text: 'Empty', color: 'bg-border' }
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 1) return { score: 25, text: 'Weak', color: 'bg-rose-500' }
    if (score === 2) return { score: 50, text: 'Fair', color: 'bg-amber-500' }
    if (score === 3) return { score: 75, text: 'Good', color: 'bg-blue-500' }
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
      toast.error('Please accept the mission protocol terms')
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
    <div className="min-h-dvh w-full flex flex-col lg:flex-row bg-background text-text selection:bg-primary/20 selection:text-primary font-sans antialiased overflow-x-hidden">

      {/* ── LEFT HALF: REGISTRATION CONTEXT & PROTOCOLS ── */}
      <div className="lg:w-5/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 border-b lg:border-b-0 lg:border-r border-border bg-surface-2/40 relative overflow-hidden">
        
        <div className="absolute inset-0 bg-tactical-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/3 -left-20 w-96 h-96 ambient-glow-cyan pointer-events-none" />

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
              <ShieldCheck className="h-3 w-3 text-primary" />
              <span>OFFICIAL REGISTRATION</span>
            </Badge>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text">Department Enrollment</h1>
                <p className="text-xs text-text-muted">NER Multi-Agency Disaster Logistics Network</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-lg pt-1">
              Join state emergency responders, transit authorities, and highway logistics teams coordinating lifelines across challenging terrain.
            </p>
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="relative z-10 my-8 space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-text-muted font-mono">
            Platform Capabilities Included
          </div>

          <div className="space-y-2.5">
            {[
              { title: '8-State Geographic Coverage', desc: 'Assam, Arunachal Pradesh, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Sikkim' },
              { title: 'Offline-First SQLite Cache', desc: 'Continue field reporting and barcode scans even in remote valley dead-zones' },
              { title: 'Proactive XGBoost Hazard AI', desc: '72-hour landslide risk forecasting powered by live rainfall radar and slope telemetry' },
            ].map((f, i) => (
              <div key={i} className="p-3 rounded-xl border border-border bg-surface/70 flex items-start gap-3">
                <div className="h-5 w-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                  <Check className="h-3 w-3" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-text">{f.title}</div>
                  <div className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-4 border-t border-border/80 flex items-center justify-between text-[11px] text-text-dim">
          <span>Protected under Disaster Management Act, 2005</span>
          <span className="font-mono text-2xs">E-GOV PROTOCOL</span>
        </div>
      </div>

      {/* ── RIGHT HALF: REGISTRATION FORM ── */}
      <div className="lg:w-7/12 xl:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-background relative overflow-y-auto">
        
        {/* Top Controls */}
        <div className="flex items-center justify-between pb-6">
          <div className="text-xs text-text-muted">
            Already authorized?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In to Terminal
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-lg mx-auto my-auto space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-text">Create Department Account</h2>
            <p className="text-xs text-text-muted">
              Select your agency, assign your operational role, and setup your secure credentials.
            </p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            
            {/* Full Name & Official Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="fullname" className="text-xs font-medium text-text">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                  <Input
                    id="fullname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Officer Name"
                    className="pl-9 text-xs h-9 bg-surface border-border focus-visible:ring-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-xs font-medium text-text">Department Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                  <Input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@ner-logistics.in"
                    className="pl-9 text-xs h-9 bg-surface border-border focus-visible:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Department Dropdown */}
            <div className="space-y-1.5">
              <Label htmlFor="department" className="text-xs font-medium text-text">Nodal Department / Agency</Label>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-surface px-3 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-surface text-text">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* State & District Cascading Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs font-medium text-text">State / Territory</Label>
                <select
                  id="state"
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-surface px-3 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Object.keys(STATES_AND_DISTRICTS).map((st) => (
                    <option key={st} value={st} className="bg-surface text-text">{st}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="district" className="text-xs font-medium text-text">District Sector</Label>
                <select
                  id="district"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-surface px-3 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {(STATES_AND_DISTRICTS[selectedState] || []).map((dst) => (
                    <option key={dst} value={dst} className="bg-surface text-text">{dst}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Operational Role Radio Cards */}
            <div className="space-y-2 pt-1">
              <Label className="text-xs font-medium text-text">Assigned Operational Role</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon
                  const isSelected = role === opt.role
                  return (
                    <div
                      key={opt.role}
                      onClick={() => setRole(opt.role)}
                      className={cn(
                        'p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5',
                        isSelected
                          ? 'bg-primary/10 border-primary ring-1 ring-primary/40'
                          : 'bg-surface border-border hover:border-border-subtle'
                      )}
                    >
                      <div className={cn(
                        'h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
                        isSelected ? 'bg-primary text-white' : 'bg-surface-2 text-text-muted border border-border'
                      )}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-text truncate">{opt.title}</div>
                        <div className="text-[10px] text-text-muted leading-tight mt-0.5 line-clamp-2">{opt.desc}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="reg-password" className="text-xs font-medium text-text">Create Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="pl-9 pr-8 text-xs h-9 bg-surface border-border focus-visible:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text p-0.5"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-confirm" className="text-xs font-medium text-text">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
                  <Input
                    id="reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="pl-9 text-xs h-9 bg-surface border-border focus-visible:ring-primary"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="space-y-1">
                <div className="flex justify-between text-2xs text-text-muted">
                  <span>Password Security</span>
                  <span className="font-semibold text-text">{passStrength.text}</span>
                </div>
                <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full transition-all duration-300', passStrength.color)}
                    style={{ width: `${passStrength.score}%` }}
                  />
                </div>
              </div>
            )}

            {/* Terms and conditions */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 mt-0.5"
                />
                <span className="text-xs text-text-muted leading-tight">
                  I certify that I am an authorized government official or logistics contractor operating under standard disaster relief protocols.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 text-xs font-semibold gap-2 bg-primary hover:bg-primary/90 text-white shadow-sm transition-all mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enrolling Credentials…</span>
                </div>
              ) : (
                <>
                  <span>Complete Enrollment & Launch</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 text-center text-2xs text-text-dim">
          North East Regional Logistics Optimization Engine • State Emergency Response System
        </div>
      </div>

    </div>
  )
}
