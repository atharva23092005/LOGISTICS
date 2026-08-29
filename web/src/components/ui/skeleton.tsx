import { cn } from '@/utils/cn'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('shimmer rounded-lg', className)} {...props} />
}
export function CardSkeleton() {
  return (
    <div className="app-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-32" /><Skeleton className="h-2 w-20" />
        </div>
      </div>
      <Skeleton className="h-8 w-24" /><Skeleton className="h-1.5 w-full" />
    </div>
  )
}
