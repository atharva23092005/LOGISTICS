import { create } from 'zustand'
import type { Vehicle } from '@/types'
import { mockVehicles } from '@/mock/vehicles'

interface VehicleState {
  vehicles: Vehicle[]
  selectedVehicleId: string | null
  filter: {
    status: string
    priority: string
    district: string
    search: string
  }

  // Actions
  setVehicles: (v: Vehicle[]) => void
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void
  selectVehicle: (id: string | null) => void
  setFilter: (f: Partial<VehicleState['filter']>) => void

  // Computed
  getSelected: () => Vehicle | null
  getFiltered: () => Vehicle[]
  getStats: () => { total: number; onRoute: number; delayed: number; stopped: number; emergency: number }
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: mockVehicles,
  selectedVehicleId: null,
  filter: { status: 'all', priority: 'all', district: 'all', search: '' },

  setVehicles: (vehicles) => set({ vehicles }),
  updateVehicle: (id, patch) =>
    set((s) => ({
      vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    })),
  selectVehicle: (id) => set({ selectedVehicleId: id }),
  setFilter: (f) => set((s) => ({ filter: { ...s.filter, ...f } })),

  getSelected: () => {
    const { vehicles, selectedVehicleId } = get()
    return vehicles.find((v) => v.id === selectedVehicleId) ?? null
  },

  getFiltered: () => {
    const { vehicles, filter } = get()
    return vehicles.filter((v) => {
      if (filter.status !== 'all' && v.status !== filter.status) return false
      if (filter.priority !== 'all' && v.priority !== filter.priority) return false
      if (filter.district !== 'all' && v.district !== filter.district) return false
      if (filter.search) {
        const q = filter.search.toLowerCase()
        if (
          !v.registrationNo.toLowerCase().includes(q) &&
          !v.driver.toLowerCase().includes(q) &&
          !v.cargo.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  },

  getStats: () => {
    const { vehicles } = get()
    return {
      total: vehicles.length,
      onRoute: vehicles.filter((v) => v.status === 'on_route').length,
      delayed: vehicles.filter((v) => v.status === 'delayed').length,
      stopped: vehicles.filter((v) => v.status === 'stopped').length,
      emergency: vehicles.filter((v) => v.priority === 'emergency').length,
    }
  },
}))
