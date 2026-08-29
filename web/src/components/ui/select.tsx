import { ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ className, options, placeholder, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          'w-full h-9 pl-3 pr-8 rounded-lg border border-border bg-surface-3 text-sm text-text',
          'focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer transition-colors',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value} className="bg-surface">{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-subtle pointer-events-none" />
    </div>
  )
}
