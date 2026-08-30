import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppShell } from '@/layouts/AppShell'
import { useAppStore } from '@/stores/appStore'

// Pages
import { LandingPage }          from '@/pages/Landing/LandingPage'
import { LoginPage }            from '@/pages/Login/LoginPage'
import { PublicCitizenPortal }  from '@/pages/Public/PublicCitizenPortal'
import { DriverPage }           from '@/pages/Driver/DriverPage'
import { FieldOfficerDashboard } from '@/pages/Dashboard/dashboards/FieldOfficerDashboard'
import { DashboardPage }        from '@/pages/Dashboard/DashboardPage'
import { MapPage }              from '@/pages/Map/MapPage'
import { RoutesPage }           from '@/pages/Routes/RoutesPage'
import { FleetPage }            from '@/pages/Fleet/FleetPage'
import { AlertsPage }           from '@/pages/Alerts/AlertsPage'
import { AnalyticsPage }        from '@/pages/Analytics/AnalyticsPage'
import { EmergencyPage }        from '@/pages/Emergency/EmergencyPage'
import { SettingsPage }         from '@/pages/Settings/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#0D1626',
            border: '1px solid #1F3352',
            color: '#E2E8F0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          },
        }}
      />
      <Routes>
        {/* Surface 4: Public Citizen Portal (Anonymous, Read-Only, No Login Required) */}
        <Route path="/public" element={<PublicCitizenPortal />} />
        <Route path="/citizen" element={<PublicCitizenPortal />} />

        {/* Surface 2: Field Officer Mobile App (Offline-First) */}
        <Route path="/field-officer" element={<FieldOfficerDashboard />} />

        {/* Surface 3: Driver / Transporter Mobile HUD */}
        <Route path="/driver" element={<DriverPage />} />

        {/* Public Landing & Login Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated Command Center Application */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/map"        element={<MapPage />} />
                  <Route path="/routes"     element={<RoutesPage />} />
                  <Route path="/fleet"      element={<FleetPage />} />
                  <Route path="/alerts"     element={<AlertsPage />} />
                  <Route path="/analytics"  element={<AnalyticsPage />} />
                  <Route path="/emergency"  element={<EmergencyPage />} />
                  <Route path="/settings"   element={<SettingsPage />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}
