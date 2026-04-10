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
      className="glass-surface group rounded-[20px] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e60023]/30 dark:hover:border-[#e60023]/20"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[#62625b] dark:text-[#b4b4ad]">{label}</p>
        {icon && (
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e5e5e0] dark:bg-[#3e3e39] text-[#e60023] ring-1 ring-[#e5e5e0] dark:ring-[#3e3e39]">
            {icon}
          </div>
        )}
      </div>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-[#211922] dark:text-[#f6f6f3]">
        <AnimatedCounter value={value} />
      </p>
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#e60023] transition-colors hover:text-[#c9001e] dark:text-[#ff4d6a] dark:hover:text-[#ff6680]"
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
      className="glass-surface rounded-[20px] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#e60023]/30 dark:hover:border-[#e60023]/20"
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-[#62625b] dark:text-[#b4b4ad]">Quick Actions</p>
        <span className="rounded-full bg-[hsla(60,20%,98%,0.5)] border border-[#e5e5e0] px-2.5 py-1 text-[11px] font-medium text-[#62625b] dark:bg-[#3e3e39] dark:border-[#3e3e39] dark:text-[#b4b4ad]">
          Common tasks
        </span>
      </div>
      <div className="space-y-3">
        <Link
          href="/flavors/new"
          className="group flex items-center gap-3 rounded-[16px] border border-[#e60023]/20 bg-[#e60023]/5 px-3 py-3 text-sm font-medium text-[#e60023] transition-all duration-150 hover:-translate-y-0.5 hover:border-[#e60023]/40 dark:border-[#e60023]/30 dark:bg-[#e60023]/10 dark:text-[#ff4d6a] dark:hover:border-[#e60023]/50"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Flavor
        </Link>
        <Link
          href="/test"
          className="group flex items-center gap-3 rounded-[16px] border border-[#e5e5e0] bg-[#f6f6f3]/80 px-3 py-3 text-sm text-[#211922] transition-all duration-150 hover:border-[#91918c] hover:bg-[#e5e5e0] dark:border-[#3e3e39] dark:bg-[#3e3e39]/80 dark:text-[#f6f6f3] dark:hover:border-[#62625b] dark:hover:bg-[#3e3e39]"
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
      className="glass-surface col-span-full rounded-[20px] p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-[#211922] dark:text-[#f6f6f3]">
            Captions Over Time
          </h2>
          <p className="mt-1 text-sm text-[#62625b] dark:text-[#b4b4ad]">
            Recent caption volume across the last 30 days.
          </p>
        </div>
        <span className="rounded-full bg-[hsla(60,20%,98%,0.5)] border border-[#e5e5e0] px-2.5 py-1 text-[11px] font-medium text-[#62625b] dark:bg-[#3e3e39] dark:border-[#3e3e39] dark:text-[#b4b4ad]">
          30 day view
        </span>
      </div>
      <StatsChart data={data} />
    </motion.div>
  )
}
