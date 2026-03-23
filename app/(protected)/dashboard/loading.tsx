import { Skeleton } from '@/components/Skeleton'

export default function DashboardLoading() {
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-3"
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 col-span-full">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="px-6 py-4 flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
