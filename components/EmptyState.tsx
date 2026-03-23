'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'

interface EmptyStateAction {
  label: string
  href: string
}

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: EmptyStateAction
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-20 px-6',
        'bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700',
        className
      )}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-zinc-300 dark:text-zinc-600 mb-4"
      >
        {icon}
      </motion.div>
      <h3 className="text-base font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
        {title}
      </h3>
      <p className="text-sm text-zinc-400 dark:text-zinc-500 max-w-xs mb-6">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
