'use client'

import { cn } from '@/lib/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-[#e5e5e0] dark:bg-[#3e3e39] skeleton-shimmer',
        className
      )}
    />
  )
}

interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  )
}

interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#33332e] rounded-[20px] border border-[#e5e5e0] dark:border-[#3e3e39] p-5 space-y-4',
        className
      )}
    >
      <Skeleton className="w-full h-36 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  )
}

interface SkeletonTableProps {
  rows?: number
  className?: string
}

export function SkeletonTable({ rows = 5, className }: SkeletonTableProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-[#33332e] rounded-[20px] border border-[#e5e5e0] dark:border-[#3e3e39] overflow-hidden',
        className
      )}
    >
      <div className="border-b border-[#e5e5e0] dark:border-[#3e3e39] px-6 py-3 flex gap-6">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="divide-y divide-[#e5e5e0] dark:divide-[#3e3e39]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex gap-6 items-center">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}
