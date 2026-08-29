import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold',
    'transition-all duration-150 select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
    'disabled:pointer-events-none disabled:opacity-40',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        default:     'bg-primary hover:bg-primary-hover text-white shadow-sm border border-primary/40',
        destructive: 'bg-danger hover:bg-danger-hover text-white shadow-sm border border-danger/40',
        success:     'bg-success hover:bg-success-hover text-white shadow-sm border border-success/40',
        warning:     'bg-warning hover:bg-warning-hover text-black shadow-sm border border-warning/40',
        emergency:   'bg-danger hover:bg-danger-hover text-white shadow-sm border border-danger/50 font-bold',
        outline:     'border border-border/80 bg-transparent text-text hover:bg-surface-2 hover:border-border',
        secondary:   'bg-surface-2 text-text hover:bg-surface-3 border border-border/80',
        ghost:       'text-text-muted hover:bg-surface-2 hover:text-text',
        link:        'text-primary underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default:   'h-9 px-4 py-2',
        sm:        'h-8 px-3 py-1.5 text-xs',
        lg:        'h-11 px-6 text-base',
        xl:        'h-12 px-8 text-base',
        icon:      'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0 text-xs',
        'icon-lg': 'h-11 w-11 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
