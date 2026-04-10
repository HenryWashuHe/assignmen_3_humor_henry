'use client'

import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm animate-fade-in">
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && (
              <svg className="h-3.5 w-3.5 text-[#91918c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {isLast || !item.href ? (
              <span className="max-w-[220px] truncate rounded-full bg-white/70 px-3 py-1.5 font-medium text-[#211922] dark:bg-[#3e3e39]/70 dark:text-[#f6f6f3]">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="rounded-full px-2 py-1 text-[#62625b] transition-colors hover:text-[#e60023] dark:text-[#b4b4ad] dark:hover:text-[#ff4d6a]"
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
