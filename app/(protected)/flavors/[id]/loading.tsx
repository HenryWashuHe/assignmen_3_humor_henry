import { Skeleton } from '@/components/Skeleton'

export default function FlavorDetailLoading() {
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-6">
        <Skeleton className="h-4 w-28 mb-4" />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-64 mb-2" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-4 justify-center py-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              {i < 2 && <Skeleton className="h-0.5 w-16" />}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
          >
            <Skeleton className="h-5 w-5 mt-0.5" />
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-40 mb-2" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
