'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  badge?: string
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden rounded-[28px] border border-zinc-200/80 dark:border-zinc-800/80',
        'bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-[0_24px_80px_-42px_rgba(15,23,42,0.35)]',
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.08),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(34,197,94,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.65),transparent)] dark:bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(74,222,128,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
      <div className="relative flex flex-col gap-5 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400">
              {eyebrow}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-[2rem]">
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center rounded-full border border-sky-200/70 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-800/80 dark:bg-sky-950/40 dark:text-sky-300">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-[15px]">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            {actions}
          </div>
        )}
      </div>
    </motion.section>
  )
}
