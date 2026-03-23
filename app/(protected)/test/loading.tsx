import { Skeleton } from '@/components/Skeleton'

export default function TestLoading() {
  return (
    <div className="p-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-4 w-72 ml-13" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-5 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 flex-1 rounded-lg" />
          </div>
          <Skeleton className="h-40 w-full rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <Skeleton className="h-5 w-20 mb-4" />
          <div className="flex items-center justify-center py-16">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
