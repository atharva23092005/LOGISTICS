import { useAppStore } from '@/stores/appStore'
import { OperatorDashboard }      from './dashboards/OperatorDashboard'
import { DistrictAdminDashboard } from './dashboards/DistrictAdminDashboard'
import { FieldOfficerDashboard }  from './dashboards/FieldOfficerDashboard'
import { AnalystDashboard }       from './dashboards/AnalystDashboard'
import { DriverPage }             from '@/pages/Driver/DriverPage'

// Module-level selector — returns stable primitive string
const selRole = (s: ReturnType<typeof useAppStore.getState>) => s.user?.role ?? 'dispatcher'

export function DashboardPage() {
  const role = useAppStore(selRole)

  // Surface 2: Field Officer App (Android / Offline-First Incident Capture)
  if (role === 'field_officer') return <FieldOfficerDashboard />

  // Surface 3: Driver / Transporter App (Lightweight HUD + Mid-Trip Reroute)
  if (role === 'driver') return <DriverPage />

  // Surface 1b: District Admin / Field Supervisor (District Verification & Escalation)
  if (role === 'district_admin') return <DistrictAdminDashboard />

  // Surface 1c: Senior Official / Policymaker (Read-Only Analytics & Trends)
  if (role === 'senior_official' || role === 'analyst') return <AnalystDashboard />

  // Surface 1a: Dispatcher / Logistics Coordinator (Full Command & Live Fleet Dispatch)
  return <OperatorDashboard />
}
