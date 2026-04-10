'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        const tag = (e.target as HTMLElement).tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
      <div className="glass-surface relative rounded-[20px] p-3">
        <svg
          className="absolute left-6 top-1/2 h-4 w-4 -translate-y-1/2 text-[#91918c]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by slug or description..."
          className="w-full rounded-[16px] border border-[#91918c] bg-white py-3 pl-12 pr-12 text-sm text-[#211922] placeholder-[#91918c] transition-colors focus:outline-none focus:ring-2 focus:ring-[#435ee5] dark:border-[#3e3e39] dark:bg-[#3e3e39] dark:text-[#f6f6f3]"
        />
        <kbd className="absolute right-6 top-1/2 hidden -translate-y-1/2 items-center rounded border border-[#e5e5e0] dark:border-[#3e3e39] bg-[#f6f6f3] dark:bg-[#3e3e39] px-1.5 py-0.5 text-[10px] font-medium text-[#91918c] sm:inline-flex">
          /
        </kbd>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[#91918c] text-sm">
          No results for &quot;{search}&quot;
        </div>
      ) : (
        /* Card-based list with staggered entry */
        <div className="space-y-2">
          {filtered.map((flavor, index) => (
            <motion.div
              key={flavor.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.4), ease: 'easeOut' }}
            >
            <Link href={`/flavors/${flavor.id}`}>
              <div className="glass-surface group flex cursor-pointer items-center gap-4 rounded-[20px] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e60023]/30 dark:hover:border-[#e60023]/20">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[#211922] transition-colors group-hover:text-[#e60023] dark:text-[#f6f6f3] dark:group-hover:text-[#ff4d6a]">
                      {flavor.slug}
                    </span>
                    <span className="rounded-full bg-[#e5e5e0] px-2 py-0.5 text-xs text-[#62625b] dark:bg-[#3e3e39] dark:text-[#b4b4ad]">
                      {stepCounts[flavor.id] ?? 0} step{stepCounts[flavor.id] !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {flavor.description && (
                    <p className="mt-1 text-sm text-[#62625b] dark:text-[#b4b4ad] truncate">
                      {flavor.description}
                    </p>
                  )}
                </div>
                <span className="hidden whitespace-nowrap text-xs text-[#91918c] sm:block">
                  {formatDate(flavor.created_datetime_utc)}
                </span>
                <svg
                  className="h-4 w-4 flex-shrink-0 text-[#91918c] transition-colors group-hover:text-[#e60023] dark:group-hover:text-[#ff4d6a]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
