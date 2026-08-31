import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (t: Theme) => void
  cycleTheme: () => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('ner-theme-v3') as Theme | null
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'light' // Clean default to light mode
}

function applyTheme(theme: Theme): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  const effective = theme === 'system' ? getSystemTheme() : theme
  const root = document.documentElement
  if (effective === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  localStorage.setItem('ner-theme-v3', theme)
  return effective
}

// Apply immediately on module load
const initialTheme = getInitialTheme()
let initialResolved = applyTheme(initialTheme)

// Listen for system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    const currentTheme = useThemeStore.getState().theme
    if (currentTheme === 'system') {
      const resolved = applyTheme('system')
      useThemeStore.setState({ resolvedTheme: resolved })
    }
  })
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  resolvedTheme: initialResolved,
  setTheme: (t: Theme) => {
    const resolved = applyTheme(t)
    set({ theme: t, resolvedTheme: resolved })
  },
  cycleTheme: () =>
    set((s) => {
      const order: Theme[] = ['light', 'dark', 'system']
      const nextIndex = (order.indexOf(s.theme) + 1) % order.length
      const next = order[nextIndex]
      const resolved = applyTheme(next)
      return { theme: next, resolvedTheme: resolved }
    }),
}))
