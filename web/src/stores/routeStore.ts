import { create } from 'zustand'
import type { RouteOption } from '@/types'
import { mockRouteOptions } from '@/mock/routes'
import { mockRoads } from '@/mock/roads'

interface RouteState {
  routeOptions: RouteOption[]
  selectedRouteId: string | null
  plannerOrigin: string
  plannerDestination: string
  plannerCargo: string
  plannerPriority: string
  roads: typeof mockRoads
  isCalculating: boolean

  // Actions
  setRouteOptions: (r: RouteOption[]) => void
  selectRoute: (id: string | null) => void
  setPlannerForm: (f: Partial<{
    origin: string
    destination: string
    cargo: string
    priority: string
  }>) => void
  setIsCalculating: (v: boolean) => void
  calculateRoutes: () => void
  updateRoadStatus: (id: string, status: string, riskScore: number) => void

  // Computed
  getRecommended: () => RouteOption | null
  getSelected: () => RouteOption | null
}

export const useRouteStore = create<RouteState>((set, get) => ({
  routeOptions: mockRouteOptions,
  selectedRouteId: 'route-3',
  plannerOrigin: 'Guwahati',
  plannerDestination: 'Itanagar',
  plannerCargo: 'Medical Supplies',
  plannerPriority: 'emergency',
  roads: mockRoads,
  isCalculating: false,

  setRouteOptions: (r) => set({ routeOptions: r }),
  selectRoute: (id) => set({ selectedRouteId: id }),
  setPlannerForm: (f) =>
    set((s) => ({
      plannerOrigin: f.origin ?? s.plannerOrigin,
      plannerDestination: f.destination ?? s.plannerDestination,
      plannerCargo: f.cargo ?? s.plannerCargo,
      plannerPriority: f.priority ?? s.plannerPriority,
    })),
  setIsCalculating: (v) => set({ isCalculating: v }),

  calculateRoutes: () => {
    set({ isCalculating: true })
    setTimeout(() => {
      set({ isCalculating: false, routeOptions: mockRouteOptions, selectedRouteId: 'route-3' })
    }, 1800)
  },

  updateRoadStatus: (id, status, riskScore) =>
    set((s) => ({
      roads: s.roads.map((r) =>
        r.id === id ? { ...r, status: status as never, riskScore } : r
      ),
    })),

  getRecommended: () => get().routeOptions.find((r) => r.isAIRecommended) ?? null,
  getSelected: () => {
    const { routeOptions, selectedRouteId } = get()
    return routeOptions.find((r) => r.id === selectedRouteId) ?? null
  },
}))
