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
        'glass-surface rounded-[28px] border-dashed border-zinc-300/80 dark:border-zinc-700/80',
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
      <h3 className="mb-1 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
