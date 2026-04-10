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
        'glass-surface rounded-[28px] border-dashed border-[#e5e5e0] dark:border-[#3e3e39]',
        className
      )}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-[#91918c] dark:text-[#62625b] mb-4"
      >
        {icon}
      </motion.div>
      <h3 className="mb-1 text-lg font-semibold text-[#211922] dark:text-[#f6f6f3]">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm leading-6 text-[#62625b] dark:text-[#b4b4ad]">
        {description}
      </p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 rounded-[16px] bg-[#e60023] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#c9001e]"
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}
