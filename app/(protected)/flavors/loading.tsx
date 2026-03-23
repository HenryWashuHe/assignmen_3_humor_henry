import { Skeleton } from '@/components/Skeleton'

export default function FlavorsLoading() {
  return (
    <div className="p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <Skeleton className="h-10 w-full rounded-xl mb-4" />

      <div className="space-y-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48 mt-1" />
            </div>
            <Skeleton className="h-3 w-20 hidden sm:block" />
            <Skeleton className="h-4 w-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
