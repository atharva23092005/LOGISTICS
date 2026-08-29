import { create } from 'zustand'
import type { User, EmergencyState, DemoScenario } from '@/types'

interface AppState {
  user: User | null
  isAuthenticated: boolean
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  demoMode: boolean
  currentScenario: DemoScenario
  emergency: EmergencyState
  liveMode: boolean
  networkOnline: boolean

  // Actions
  login: (user: User) => void
  logout: () => void
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void
  setDemoMode: (v: boolean) => void
  setScenario: (s: DemoScenario) => void
  activateEmergency: (reason: string) => void
  deactivateEmergency: () => void
  setNetworkOnline: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  sidebarOpen: true,
  sidebarCollapsed: false,
  demoMode: true,
  currentScenario: 'normal',
  liveMode: false,
  networkOnline: true,
  emergency: {
    active: false,
    level: 'normal',
    affectedDistricts: [],
    priorityOrder: ['medical', 'food', 'water', 'other'],
    safeCorridors: [],
  },

  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setDemoMode: (v) => set({ demoMode: v }),
  setScenario: (s) => set({ currentScenario: s }),
  activateEmergency: (reason) =>
    set({
      emergency: {
        active: true,
        level: 'emergency',
        activatedAt: new Date().toISOString(),
        reason,
        affectedDistricts: ['East Siang', 'Dibrugarh'],
        priorityOrder: ['medical', 'food', 'water', 'other'],
        safeCorridors: ['nh6-seg1', 'sh15-seg1'],
      },
    }),
  deactivateEmergency: () =>
    set({
      emergency: {
        active: false,
        level: 'normal',
        affectedDistricts: [],
        priorityOrder: ['medical', 'food', 'water', 'other'],
        safeCorridors: [],
      },
    }),
  setNetworkOnline: (v) => set({ networkOnline: v }),
}))
