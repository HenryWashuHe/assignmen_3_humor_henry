import { Skeleton } from '@/components/Skeleton'

export default function CaptionsLoading() {
  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 mb-6">
        <Skeleton className="h-3 w-24 mb-3" />
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-lg" />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex gap-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
          >
            <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
