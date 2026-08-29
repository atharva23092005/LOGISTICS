import { cn } from '@/utils/cn'

interface Tab { id: string; label: string; icon?: React.ReactNode; badge?: number }
interface TabsProps {
  tabs: Tab[]; active: string; onChange: (id: string) => void
  className?: string; variant?: 'underline' | 'pill' | 'segment'
}

export function Tabs({ tabs, active, onChange, className, variant = 'underline' }: TabsProps) {
  if (variant === 'pill') {
    return (
      <div className={cn('flex items-center gap-1 bg-surface-2 rounded-xl p-1 w-full border border-white/5', className)}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => onChange(t.id)}
            className={cn(
              'flex-1 min-w-0 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
              active === t.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-muted hover:text-text hover:bg-surface-3'
            )}>
            {t.icon}
            <span className="truncate">{t.label}</span>
            {t.badge !== undefined && t.badge > 0 && (
              <span className="badge-critical text-2xs min-w-[16px] text-center flex-shrink-0">{t.badge > 9 ? '9+' : t.badge}</span>
            )}
          </button>
        ))}
      </div>
    )
  }

  if (variant === 'segment') {
    return (
      <div className={cn('flex', className)}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => onChange(t.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold transition-all',
              active === t.id
                ? 'text-primary bg-primary/10 border-b-2 border-primary'
                : 'text-text-muted hover:text-text border-b border-border hover:bg-surface-2'
            )}>
            {t.icon}{t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className="badge-critical text-2xs">{t.badge > 9 ? '9+' : t.badge}</span>
            )}
          </button>
        ))}
      </div>
    )
  }

  // underline (default)
  return (
    <div className={cn('flex items-center border-b border-border', className)}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-all',
            active === t.id ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text hover:border-border'
          )}>
          {t.icon}{t.label}
          {t.badge !== undefined && t.badge > 0 && (
            <span className="badge-critical text-2xs">{t.badge > 9 ? '9+' : t.badge}</span>
          )}
        </button>
      ))}
    </div>
  )
}
