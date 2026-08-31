import { Sun, Moon, Laptop, Check } from 'lucide-react'
import { useThemeStore, type Theme } from '@/stores/themeStore'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Tooltip
} from '@/components/ui'
import { cn } from '@/utils/cn'

interface ThemeToggleProps {
  className?: string
  variant?: 'dropdown' | 'segmented' | 'cycle'
  showLabel?: boolean
}

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Laptop },
]

export function ThemeToggle({
  className,
  variant = 'dropdown',
  showLabel = false
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, cycleTheme } = useThemeStore()

  // ── Segmented Control Variant (Great for Settings & Landing Footer) ──
  if (variant === 'segmented') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-0.5 p-1 rounded-xl bg-surface-2 border border-border',
          className
        )}
      >
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isActive = theme === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              type="button"
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150',
                isActive
                  ? 'bg-surface text-text font-semibold shadow-sm border border-border/80'
                  : 'text-text-muted hover:text-text hover:bg-surface-3/50'
              )}
            >
              <Icon
                className={cn(
                  'h-3.5 w-3.5',
                  isActive
                    ? opt.value === 'light'
                      ? 'text-amber-500'
                      : opt.value === 'dark'
                      ? 'text-blue-500'
                      : 'text-primary'
                    : 'text-text-muted'
                )}
              />
              <span className="text-2xs">{opt.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  // ── Cycle Button Variant ──
  if (variant === 'cycle') {
    const ActiveIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Laptop
    return (
      <Tooltip
        content={`Theme: ${theme.toUpperCase()} (Click to cycle)`}
        side="bottom"
      >
        <button
          onClick={cycleTheme}
          type="button"
          className={cn(
            'relative inline-flex items-center justify-center p-2 rounded-lg text-xs font-medium transition-all duration-150',
            'border border-border bg-surface hover:bg-surface-2 text-text-muted hover:text-text shadow-sm',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
            className
          )}
          aria-label={`Current theme: ${theme}. Click to switch theme.`}
        >
          <ActiveIcon
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              theme === 'light' && 'text-amber-500',
              theme === 'dark' && 'text-blue-500',
              theme === 'system' && 'text-primary'
            )}
          />
        </button>
      </Tooltip>
    )
  }

  // ── Default: Dropdown Menu Trigger Variant (Clean TopBar & Header Integration) ──
  const TriggerIcon =
    theme === 'system'
      ? Laptop
      : resolvedTheme === 'dark'
      ? Moon
      : Sun

  return (
    <DropdownMenu>
      <Tooltip content={`Theme: ${theme.toUpperCase()}`} side="bottom">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'relative inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150',
              'border border-border bg-surface hover:bg-surface-2 text-text-muted hover:text-text shadow-sm',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
              className
            )}
            aria-label="Select theme: Light, Dark, or System"
          >
            <div className="relative h-4 w-4 flex items-center justify-center">
              <TriggerIcon
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  theme === 'light' && 'text-amber-500',
                  theme === 'dark' && 'text-blue-500',
                  theme === 'system' && 'text-primary'
                )}
              />
            </div>
            {showLabel && (
              <span className="capitalize text-2xs font-semibold select-none">
                {theme}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
      </Tooltip>

      <DropdownMenuContent align="end" className="w-36 p-1 bg-surface border border-border">
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isSelected = theme === opt.value
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={cn(
                'flex items-center justify-between text-xs py-1.5 px-2.5 rounded-md cursor-pointer',
                isSelected ? 'bg-primary/10 text-primary font-semibold' : 'text-text'
              )}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={cn(
                    'h-3.5 w-3.5',
                    opt.value === 'light'
                      ? 'text-amber-500'
                      : opt.value === 'dark'
                      ? 'text-blue-500'
                      : 'text-primary'
                  )}
                />
                <span>{opt.label}</span>
              </div>
              {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
