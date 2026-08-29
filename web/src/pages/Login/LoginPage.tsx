import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, Shield, Map, Truck, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { useAppStore } from '@/stores/appStore'
import type { User } from '@/types'

const demoAccounts: { label: string; role: string; user: User; password: string }[] = [
  { label: 'Dispatcher / Logistics Coordinator', role: 'Full Operational Control', password: 'demo', user: { id: 'u1', name: 'Rajesh Kumar', email: 'dispatcher@ner-logistics.in', role: 'dispatcher', district: 'Guwahati' } },
  { label: 'District Admin / Supervisor',        role: 'District Queue (East Siang)', password: 'demo', user: { id: 'u2', name: 'Tsering Norbu', email: 'district.admin@ner-logistics.in', role: 'district_admin', district: 'East Siang' } },
  { label: 'Senior Official / Policymaker',      role: 'Read-Only Analytics', password: 'demo', user: { id: 'u3', name: 'Dr. Amit Sharma', email: 'senior.official@ner-logistics.in', role: 'senior_official', district: 'Statewide HQ' } },
  { label: 'Field Officer (Android Offline)',    role: 'Ground Incident Reporting', password: 'demo', user: { id: 'u4', name: 'Priya Das', email: 'field.officer@ner-logistics.in', role: 'field_officer', district: 'East Siang' } },
  { label: 'Driver / Transporter (Android HUD)', role: 'Convoy AR-01-GH-2345', password: 'demo', user: { id: 'u5', name: 'Sanjay Taye', email: 'driver@ner-logistics.in', role: 'driver', district: 'Dibrugarh', assignedVehicleId: 'v4' } },
]

export function LoginPage() {
  const navigate = useNavigate()
  const login    = useAppStore(s => s.login)
  const [email, setEmail]     = useState('dispatcher@ner-logistics.in')
  const [password, setPassword] = useState('demo')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const acc = demoAccounts.find(a => a.user.email === email && a.password === password)
    if (acc) {
      login(acc.user)
      toast.success(`Welcome, ${acc.user.name} (${acc.label})`)
      if (acc.user.role === 'driver') navigate('/driver')
      else navigate('/dashboard')
    } else {
      toast.error('Invalid credentials')
    }
    setLoading(false)
  }

  const quickLogin = (acc: typeof demoAccounts[0]) => {
    login(acc.user)
    toast.success(`Logged in as ${acc.user.name} (${acc.label})`)
    if (acc.user.role === 'driver') navigate('/driver')
    else navigate('/dashboard')
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col lg:flex-row">
      {/* ── Left branding panel (hidden on mobile) ─────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 border-r border-border p-10 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none" />
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-base font-bold text-text tracking-tight">NER LOGISTICS</div>
            <div className="text-xs text-text-muted">Intelligence Platform</div>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <h1 className="text-3xl font-bold text-text leading-tight">
            Northeast India's<br />
            <span className="text-gradient-primary">Logistics Command</span><br />
            Center
          </h1>
          <p className="text-sm text-text-muted leading-relaxed">
            Real-time vehicle tracking, AI-powered disruption prediction,
            and intelligent route optimization across all NER districts.
          </p>
          <div className="space-y-3">
            {[
              { icon: Map,    title: 'Live NER Map',        desc: 'Road accessibility, weather overlays, vehicle positions' },
              { icon: Shield, title: 'AI Risk Prediction',  desc: 'ML-powered landslide & flood risk with 6h horizon' },
              { icon: Truck,  title: 'Fleet Intelligence',  desc: 'Real-time tracking, automatic rerouting, ETA prediction' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-surface/50 border border-border/50">
                <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20 flex-shrink-0">
                  <f.icon className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-text">{f.title}</div>
                  <div className="text-2xs text-text-muted mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status bar */}
        <div className="relative flex items-center gap-5 text-xs">
          <span className="flex items-center gap-1.5 text-success"><span className="status-dot status-dot-green" />47 Vehicles</span>
          <span className="flex items-center gap-1.5 text-danger"><span className="status-dot status-dot-red" />3 Critical</span>
          <span className="flex items-center gap-1.5 text-warning"><span className="status-dot status-dot-amber" />8 Blocked</span>
        </div>
      </div>

      {/* ── Right login panel ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          {/* Back to Landing Link */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-text-muted hover:text-white flex items-center gap-1.5 mb-6 transition-colors group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Return to NERA Platform Overview</span>
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center text-primary">
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-bold text-text">NERA INTELLIGENCE</span>
          </div>

          <h2 className="text-2xl font-bold text-text mb-1">Sign in</h2>
          <p className="text-sm text-text-muted mb-7">Access the logistics command center</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1.5">Email</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.in" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-muted block mb-1.5">Password</label>
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text transition-colors">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign in <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-7">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted px-2">Quick demo access</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="space-y-2">
              {demoAccounts.map(a => (
                <button key={a.user.id} onClick={() => quickLogin(a)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-surface hover:bg-surface-2 hover:border-primary/30 transition-all group text-left">
                  <div>
                    <div className="text-xs font-semibold text-text">{a.user.name}</div>
                    <div className="text-2xs text-text-muted">{a.label} · {a.role}</div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-text-dim group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>

            {/* Public Portal link (Anonymous) */}
            <div className="mt-4 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => navigate('/public')}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span>🌐 Open Public Citizen Road Portal (No Login)</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
