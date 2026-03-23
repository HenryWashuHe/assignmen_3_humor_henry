'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { AnimatedCounter } from './AnimatedCounter'
import { StatsChart } from './StatsChart'

interface StatCardsProps {
  flavorCount: number
  captionCount: number
}

export function StatCards({ flavorCount, captionCount }: StatCardsProps) {
  const cards = [
    {
      label: 'Total Flavors',
      value: flavorCount,
      href: '/flavors',
      linkLabel: 'View all flavors →',
    },
    {
      label: 'Total Captions',
      value: captionCount,
      href: '/captions',
      linkLabel: 'View all captions →',
    },
  ]

  return (
    <>
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.08, ease: 'easeOut' }}
          className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6"
        >
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{card.label}</p>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-2">
            <AnimatedCounter value={card.value} />
          </p>
          <Link
            href={card.href}
            className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 mt-2 inline-block transition-colors"
          >
            {card.linkLabel}
          </Link>
        </motion.div>
      ))}
    </>
  )
}

interface QuickActionsCardProps {}

export function QuickActionsCard({}: QuickActionsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.16, ease: 'easeOut' }}
      className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6"
    >
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Quick Actions</p>
      <div className="mt-3 space-y-2">
        <Link
          href="/flavors/new"
          className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Flavor
        </Link>
        <Link
          href="/test"
          className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
