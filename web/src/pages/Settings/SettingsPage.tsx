import { useState } from 'react'
import { Settings, User, Bell, Link, Shield, Save, CheckCircle, Globe, Lock, Key } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Badge }  from '@/components/ui/badge'
import { useAppStore } from '@/stores/appStore'

const selUser     = (s: ReturnType<typeof useAppStore.getState>) => s.user
const selLogin    = (s: ReturnType<typeof useAppStore.getState>) => s.login
const selDemoMode = (s: ReturnType<typeof useAppStore.getState>) => s.demoMode
const selSetDemo  = (s: ReturnType<typeof useAppStore.getState>) => s.setDemoMode

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-surface-4'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
  )
}

const NAV = [
  { id: 'profile',       icon: User,    label: 'Profile'       },
  { id: 'notifications', icon: Bell,    label: 'Notifications' },
  { id: 'integrations',  icon: Globe,   label: 'Integrations'  },
  { id: 'security',      icon: Shield,  label: 'Security'      },
]

export function SettingsPage() {
  const user     = useAppStore(selUser)
  const login    = useAppStore(selLogin)
  const demoMode = useAppStore(selDemoMode)
  const setDemo  = useAppStore(selSetDemo)

  const [tab, setTab]     = useState('profile')
  const [name, setName]   = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [notifs, setNotifs] = useState({
    criticalAlerts: true,
    weatherWarnings: true,
    vehicleUpdates: false,
    routeChanges: true,
    smsAlerts: true
  })

  const handleSaveProfile = () => {
    if (user) {
      login({ ...user, name, email })
    }
    toast.success('Profile details updated successfully!')
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 md:px-5 py-2.5 border-b border-border flex-shrink-0 bg-surface">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
            <Settings className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-text">System & Account Settings</h1>
            <p className="text-2xs text-text-muted">Manage profile parameters, notifications, and telemetry integrations</p>
          </div>
        </div>
      </div>

      {/* ── WORKSPACE ──────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Responsive Navigation */}
        <div className="w-full md:w-48 flex-shrink-0 border-b md:border-b-0 md:border-r border-border p-2 flex md:flex-col gap-1 bg-surface overflow-x-auto hide-scrollbar">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`flex-1 md:flex-initial flex items-center justify-center md:justify-start gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                tab === n.id ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text hover:bg-surface-2'
              }`}
            >
              <n.icon className="h-4 w-4 flex-shrink-0" />
              <span>{n.label}</span>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-2xl mx-auto space-y-4">

            {/* ── PROFILE TAB ─────────────────────────────────────────────── */}
            {tab === 'profile' && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold">Personal Profile & Credentials</CardTitle>
                    <CardDescription className="text-xs">Update your operator identity and contact details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b border-border">
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                        <User className="h-7 w-7" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-text">{user?.name}</div>
                        <div className="text-xs text-text-muted capitalize">{user?.role?.replace('_', ' ')} Command</div>
                        <Badge variant="muted" className="mt-1 text-2xs">{user?.district} District Sector</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Full Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Email Address</label>
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Assigned Role</label>
                        <Input value={user?.role?.replace('_', ' ').toUpperCase() ?? 'OPERATOR'} disabled className="opacity-60 bg-surface-2" />
                      </div>
                      <div>
                        <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider block mb-1">HQ District</label>
                        <Input value={user?.district ?? 'Guwahati'} disabled className="opacity-60 bg-surface-2" />
                      </div>
                    </div>

                    <Button onClick={handleSaveProfile} className="h-8 text-xs font-semibold shadow-sm">
                      <Save className="h-3.5 w-3.5" /> Save Changes
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold">Simulation & Demo Mode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <div className="text-xs font-semibold text-text">Synthetic Live Telemetry Generator</div>
                        <div className="text-2xs text-text-muted">Simulate vehicle movements, sensor alerts, and dynamic weather disruptions</div>
                      </div>
                      <Toggle checked={demoMode} onChange={setDemo} />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* ── NOTIFICATIONS TAB ───────────────────────────────────────── */}
            {tab === 'notifications' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold">Real-Time Notification Channels</CardTitle>
                  <CardDescription className="text-xs">Configure which telemetry events trigger immediate alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-0">
                  {(Object.entries(notifs) as [keyof typeof notifs, boolean][]).map(([k, v]) => {
                    const labels: Record<string, { label: string; desc: string }> = {
                      criticalAlerts:  { label: 'Critical Road Blockage Alerts', desc: 'Instant priority alarms when primary highways are cut off' },
                      weatherWarnings: { label: 'Weather Radar Alerts', desc: 'Heavy precipitation, flash flood & landslide triggers' },
                      vehicleUpdates:  { label: 'Fleet Telemetry Deviations', desc: 'Speed anomalies and off-route tracking warnings' },
                      routeChanges:    { label: 'AI Rerouting Notifications', desc: 'Automated corridor recommendations from optimizer' },
                      smsAlerts:       { label: 'Emergency Radio / SMS Broadcast', desc: 'Relay critical dispatches via offline satellite SMS' },
                    }
                    const cfg = labels[k]
                    return (
                      <div key={k} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div>
                          <div className="text-xs font-bold text-text">{cfg.label}</div>
                          <div className="text-2xs text-text-muted">{cfg.desc}</div>
                        </div>
                        <Toggle checked={v} onChange={val => setNotifs(s => ({ ...s, [k]: val }))} />
                      </div>
                    )
                  })}
                  <div className="pt-3">
                    <Button onClick={() => toast.success('Notification preferences saved')} className="h-8 text-xs font-semibold">
                      <Save className="h-3.5 w-3.5" /> Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── INTEGRATIONS TAB ────────────────────────────────────────── */}
            {tab === 'integrations' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold">Government GIS & Sensor Feeds</CardTitle>
                  <CardDescription className="text-xs">External data sources feeding the NER prediction engine</CardDescription>
                </CardHeader>
                <CardContent className="space-y-0">
                  {[
                    { name: 'India Meteorological Dept (IMD)', desc: 'Doppler radar precipitation & 3h rainfall forecasts', status: 'connected' },
                    { name: 'ISRO Bhuvan GIS Platform',       desc: 'Satellite DEM slope topography and soil moisture layers', status: 'connected' },
                    { name: 'NRSC Disaster Rapid Response',    desc: 'Automated flood vulnerability and landslide hazard index', status: 'pending' },
                    { name: 'NIC VAHAN Government Registry',   desc: 'Official vehicle registration & GPS compliance feeds', status: 'connected' },
                    { name: 'OpenStreetMap NER Basemap',       desc: 'High-resolution offline tile caching server', status: 'connected' },
                  ].map(intg => (
                    <div key={intg.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <div className="text-xs font-bold text-text">{intg.name}</div>
                        <div className="text-2xs text-text-muted">{intg.desc}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-2xs font-semibold ${
                          intg.status === 'connected' ? 'text-success' : intg.status === 'pending' ? 'text-warning' : 'text-danger'
                        }`}>
                          {intg.status === 'connected' ? '● Connected' : intg.status === 'pending' ? '◐ Syncing' : '○ Offline'}
                        </span>
                        <Button
                          size="sm"
                          variant={intg.status === 'connected' ? 'ghost' : 'outline'}
                          className="h-7 text-2xs"
                          onClick={() => toast.info(`Testing connection to ${intg.name}…`)}
                        >
                          {intg.status === 'connected' ? 'Configure' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* ── SECURITY TAB ────────────────────────────────────────────── */}
            {tab === 'security' && (
              <>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold">Authentication & Password</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {['Current Password', 'New Password', 'Confirm New Password'].map(l => (
                      <div key={l}>
                        <label className="text-2xs font-semibold text-text-muted uppercase tracking-wider block mb-1">{l}</label>
                        <Input type="password" placeholder="••••••••" />
                      </div>
                    ))}
                    <Button onClick={() => toast.success('Security password updated')} className="h-8 text-xs font-semibold">
                      <Shield className="h-3.5 w-3.5" /> Update Password
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold">Active Command Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {[
                      { device: 'Chrome 128 · Windows 11 (Command Center Terminal)', loc: 'Guwahati, Assam HQ', time: 'Active Now', current: true },
                      { device: 'Field Mobile PWA · Android 14', loc: 'Pasighat, East Siang', time: '35m ago', current: false }
                    ].map(s => (
                      <div key={s.device} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                        <div>
                          <div className="text-xs font-bold text-text flex items-center gap-2">
                            {s.device}
                            {s.current && <Badge variant="success" className="text-2xs">Current Session</Badge>}
                          </div>
                          <div className="text-2xs text-text-muted">{s.loc} • {s.time}</div>
                        </div>
                        {!s.current && (
                          <Button size="sm" variant="ghost" className="text-danger text-2xs h-7" onClick={() => toast.success('Session terminated')}>
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
