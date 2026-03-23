'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { AnimatedCounter } from './AnimatedCounter'
import { StatsChart } from './StatsChart'

interface StatCardProps {
  label: string
  value: number
  href: string
  linkLabel: string
  delay?: number
  icon?: React.ReactNode
}

export function StatCard({ label, value, href, linkLabel, delay = 0, icon }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-500 dark:text-indigo-400 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
        <AnimatedCounter value={value} />
      </p>
      <Link
        href={href}
        className="text-sm text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 mt-3 inline-block transition-colors"
      >
        {linkLabel}
      </Link>
    </motion.div>
  )
}

export function QuickActionsCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.16, ease: 'easeOut' }}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-200"
    >
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-4">Quick Actions</p>
      <div className="space-y-3">
        <Link
          href="/flavors/new"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-200 dark:hover:border-indigo-800 text-sm text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-150 group"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Flavor
        </Link>
        <Link
          href="/test"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-200 dark:hover:border-indigo-800 text-sm text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-150 group"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Test a Flavor
        </Link>
      </div>
    </motion.div>
  )
}

interface CaptionsOverTimeCardProps {
  data: { date: string; count: number }[]
}

export function CaptionsOverTimeCard({ data }: CaptionsOverTimeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.24, ease: 'easeOut' }}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 col-span-full"
    >
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
        Captions Over Time
      </h2>
      <StatsChart data={data} />
    </motion.div>
  )
}
