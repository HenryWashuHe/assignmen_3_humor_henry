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
        'relative overflow-hidden rounded-[28px] border border-[#e5e5e0] dark:border-[#3e3e39]',
        'bg-white/90 dark:bg-[#33332e]/90 backdrop-blur-xl',
        className
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(230,0,35,0.04),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.5),transparent)] dark:bg-[radial-gradient(circle_at_top_left,rgba(230,0,35,0.06),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)]" />
      <div className="relative flex flex-col gap-5 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#91918c]">
              {eyebrow}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[#211922] dark:text-[#f6f6f3] sm:text-[2rem]" style={{ letterSpacing: '-1.2px' }}>
              {title}
            </h1>
            {badge && (
              <span className="inline-flex items-center rounded-full border border-[#e5e5e0] bg-[hsla(60,20%,98%,0.5)] px-3 py-1 text-xs font-medium text-[#62625b] dark:border-[#3e3e39] dark:bg-[#3e3e39] dark:text-[#b4b4ad]">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#62625b] dark:text-[#b4b4ad] sm:text-[15px]">
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
