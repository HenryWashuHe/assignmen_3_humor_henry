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
      className="glass-surface group rounded-[24px] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-200/80 dark:hover:border-sky-900"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        {icon && (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-emerald-500/15 text-sky-600 dark:text-sky-300 ring-1 ring-sky-200/60 dark:ring-sky-900/60">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        <AnimatedCounter value={value} />
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-sky-600 transition-colors hover:text-sky-700 dark:text-sky-300 dark:hover:text-sky-200"
      >
        {linkLabel}
        <span aria-hidden="true">↗</span>
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
      className="glass-surface rounded-[24px] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200/80 dark:hover:border-emerald-900"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Quick Actions</p>
        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
          Common tasks
        </span>
      </div>
      <div className="space-y-3">
        <Link
          href="/flavors/new"
          className="group flex items-center gap-3 rounded-2xl border border-sky-200/80 bg-gradient-to-r from-sky-50 to-emerald-50 px-3 py-3 text-sm font-medium text-sky-800 transition-all duration-150 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_16px_32px_-24px_rgba(14,165,233,0.9)] dark:border-sky-900/80 dark:bg-gradient-to-r dark:from-sky-950/40 dark:to-emerald-950/30 dark:text-sky-200 dark:hover:border-sky-700"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Flavor
        </Link>
        <Link
          href="/test"
          className="group flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 px-3 py-3 text-sm text-zinc-700 transition-all duration-150 hover:border-emerald-200 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/30"
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
      className="glass-surface col-span-full rounded-[28px] p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            Captions Over Time
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Recent caption volume across the last 30 days.
          </p>
        </div>
        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
          30 day view
        </span>
      </div>
      <StatsChart data={data} />
    </motion.div>
  )
}
