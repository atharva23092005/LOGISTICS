import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from './button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  glass?: boolean
}

const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl', full: 'max-w-5xl' }

export function Modal({ open, onClose, title, description, children, size = 'md', className, glass = false }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300" onClick={onClose} />
      <div className={cn(
        'relative w-full rounded-2xl shadow-2xl animate-scale-in max-h-[90dvh] flex flex-col transition-all',
        glass
          ? 'bg-surface/90 backdrop-blur-2xl border border-border shadow-2xl'
          : 'bg-surface border border-border shadow-modal',
        sizeMap[size], className
      )}>
        {title && (
          <div className={cn(
            'flex items-start justify-between p-4 sm:p-5 flex-shrink-0',
            glass ? 'border-b border-border bg-surface-2/50' : 'border-b border-border'
          )}>
            <div>
              <h2 className="text-sm md:text-base font-bold text-text">{title}</h2>
              {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose} className="flex-shrink-0 ml-3 hover:bg-white/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  )
}
