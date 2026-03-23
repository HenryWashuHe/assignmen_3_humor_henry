'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EmptyState } from './EmptyState'

interface Flavor {
  id: number
  slug: string
  description: string | null
  created_datetime_utc: string | null
}

interface FlavorsTableProps {
  flavors: Flavor[]
  stepCounts: Record<number, number>
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

export function FlavorsTable({ flavors, stepCounts }: FlavorsTableProps) {
  const [search, setSearch] = useState('')

  const filtered = flavors.filter((f) => {
    const q = search.toLowerCase()
    return (
      f.slug.toLowerCase().includes(q) ||
      (f.description?.toLowerCase() ?? '').includes(q)
    )
  })

  if (flavors.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        }
        title="No humor flavors yet"
        description="Create your first humor flavor to get started building your pipeline."
        action={{ label: 'Create your first flavor', href: '/flavors/new' }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by slug or description..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm transition-colors"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-sm">
          No results for &quot;{search}&quot;
        </div>
      ) : (
        /* Card-based list — no motion.tr inside tbody */
        <div className="space-y-2">
          {filtered.map((flavor) => (
            <Link key={flavor.id} href={`/flavors/${flavor.id}`}>
              <div className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all duration-200 cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {flavor.slug}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                      {stepCounts[flavor.id] ?? 0} step{stepCounts[flavor.id] !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {flavor.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                      {flavor.description}
                    </p>
                  )}
                </div>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap hidden sm:block">
                  {formatDate(flavor.created_datetime_utc)}
                </span>
                <svg
                  className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
