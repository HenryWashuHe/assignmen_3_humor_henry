'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface Command {
  label: string
  href: string
  icon: React.ReactNode
  keywords: string[]
}

const commands: Command[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    keywords: ['home', 'overview', 'stats'],
  },
  {
    label: 'Flavors',
    href: '/flavors',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    keywords: ['humor', 'list', 'manage'],
  },
  {
    label: 'New Flavor',
    href: '/flavors/new',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    keywords: ['create', 'add'],
  },
  {
    label: 'Captions',
    href: '/captions',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    keywords: ['generated', 'results', 'text'],
  },
  {
    label: 'Test Flavor',
    href: '/test',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    keywords: ['generate', 'run', 'pipeline', 'image'],
  },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const filtered = query.trim()
    ? commands.filter((cmd) => {
        const q = query.toLowerCase()
        return (
          cmd.label.toLowerCase().includes(q) ||
          cmd.keywords.some((k) => k.includes(q))
        )
      })
    : commands

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      setQuery('')
      router.push(href)
    },
    [router]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
        setQuery('')
        setSelectedIndex(0)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex].href)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[20vh]"
        >
          <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-md mx-4 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 border-b border-zinc-200 dark:border-zinc-800">
              <svg className="w-4 h-4 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search commands..."
                className="flex-1 py-3.5 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">
                ESC
              </kbd>
            </div>
            <div className="max-h-64 overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
                  No results found
                </div>
              ) : (
                filtered.map((cmd, i) => (
                  <button
                    key={cmd.href}
                    onClick={() => navigate(cmd.href)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      i === selectedIndex
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className={i === selectedIndex ? 'text-indigo-500 dark:text-indigo-400' : 'text-zinc-400'}>
                      {cmd.icon}
                    </span>
                    {cmd.label}
                  </button>
                ))
              )}
            </div>
            <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-4 text-[10px] text-zinc-400 dark:text-zinc-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 font-medium">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 font-medium">↵</kbd>
                select
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
