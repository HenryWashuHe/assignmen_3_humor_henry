'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { EmptyState } from './EmptyState'
import { cn } from '@/lib/cn'

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
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-zinc-400 dark:text-zinc-500 text-sm">
          No results for &quot;{search}&quot;
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Steps</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence>
                {filtered.map((flavor, index) => (
                  <motion.tr
                    key={flavor.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2, delay: index * 0.04, ease: 'easeOut' }}
                    className={cn(
                      'group hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors',
                      'border-l-2 border-l-transparent hover:border-l-indigo-500 dark:hover:border-l-indigo-400'
                    )}
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/flavors/${flavor.id}`}
                        className="text-sm font-medium text-zinc-900 dark:text-zinc-100 hover:underline"
                      >
                        {flavor.slug}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                        {flavor.description ?? '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {stepCounts[flavor.id] ?? 0} step{stepCounts[flavor.id] !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400 dark:text-zinc-500">
                      {flavor.created_datetime_utc
                        ? new Date(flavor.created_datetime_utc).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/flavors/${flavor.id}`}
                        className="text-sm text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
