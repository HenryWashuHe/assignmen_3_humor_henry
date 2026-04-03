'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface AppShellProps {
  children: ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn('mx-auto w-full max-w-7xl px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-10', className)}>
      {children}
    </div>
  )
}
