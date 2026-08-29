import { forwardRef } from 'react'
import { cn } from '@/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle pointer-events-none">{icon}</span>
          <input
            type={type} ref={ref}
            className={cn(
              'w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-surface-3 text-sm text-text placeholder:text-text-subtle',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors',
              className
            )}
            {...props}
          />
        </div>
      )
    }
    return (
      <input
        type={type} ref={ref}
        className={cn(
          'w-full h-9 px-3 rounded-lg border border-border bg-surface-3 text-sm text-text placeholder:text-text-subtle',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
