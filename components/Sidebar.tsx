'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function KbdShortcut() {
  const [isMac, setIsMac] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setIsMac(/Mac/.test(navigator.userAgent))
    setMounted(true)
  }, [])

  return (
    <kbd className="px-1.5 py-0.5 rounded border border-[#e5e5e0] dark:border-[#3e3e39] bg-white dark:bg-[#3e3e39] text-[10px] font-medium text-[#62625b] dark:text-[#b4b4ad]">
      {mounted ? (isMac ? '\u2318K' : 'Ctrl+K') : '\u00A0\u00A0\u00A0'}
    </kbd>
  )
}
import { ThemeToggle } from './ThemeToggle'
import { createClient } from '@/lib/supabase-browser'
import { Profile } from '@/lib/types'
import { cn } from '@/lib/cn'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: '/flavors',
    label: 'Flavors',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    href: '/captions',
    label: 'Captions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    href: '/test',
    label: 'Test Flavor',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
]

interface SidebarProps {
  profile: Profile | null
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const displayName =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : profile?.email ?? 'User'

  const initials =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
      : (profile?.email?.[0] ?? 'U').toUpperCase()

  const role = profile?.is_superadmin ? 'Superadmin' : 'Matrix Admin'

  const sidebarContent = (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="glass-surface flex min-h-screen flex-col overflow-hidden border-r border-[#e5e5e0] dark:border-[#3e3e39] flex-shrink-0"
    >
      {/* Logo — gradient accent */}
      <div className="border-b border-[#e5e5e0] px-4 py-5 dark:border-[#3e3e39]">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 rounded-lg bg-[#e60023] blur opacity-30" />
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#e60023]">
              <span className="text-sm font-bold text-white">M</span>
            </div>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <h1 className="text-sm font-bold text-[#211922] dark:text-[#f6f6f3] whitespace-nowrap">The Matrix</h1>
                <p className="text-xs text-[#91918c] whitespace-nowrap">Humor Flavors</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto p-1 rounded text-[#91918c] hover:text-[#211922] dark:hover:text-[#f6f6f3] hover:bg-[#e5e5e0] dark:hover:bg-[#3e3e39] transition-colors flex-shrink-0 hidden lg:flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Command palette hint */}
      {!collapsed && (
        <div className="mx-3 mt-3">
          <button
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
            }}
            className="w-full flex items-center gap-2 rounded-[16px] border border-[#e5e5e0] bg-white/80 px-3 py-2 text-xs text-[#91918c] backdrop-blur dark:border-[#3e3e39] dark:bg-[#3e3e39]/70 dark:text-[#b4b4ad] hover:border-[#91918c] dark:hover:border-[#62625b] hover:text-[#211922] dark:hover:text-[#f6f6f3] transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="flex-1 text-left">Search...</span>
            <KbdShortcut />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group',
                isActive
                  ? 'text-white'
                  : 'text-[#62625b] dark:text-[#b4b4ad] hover:text-[#211922] dark:hover:text-[#f6f6f3]'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl bg-[#e60023] -z-10"
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                />
              )}
              {!isActive && (
                <span className="absolute inset-0 rounded-xl bg-[#e5e5e0]/80 dark:bg-[#3e3e39]/80 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              )}
              <span className="flex-shrink-0 relative z-10">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap relative z-10"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-3 border-t border-[#e5e5e0] px-2 py-4 dark:border-[#3e3e39]">
        {!collapsed && (
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-[#91918c]">Theme</span>
            <ThemeToggle />
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        )}

        <div className={cn('flex items-center gap-3 px-1', collapsed && 'justify-center')}>
          <div className="relative flex-shrink-0">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e5e5e0] dark:bg-[#3e3e39] border border-[#e0e0d9] dark:border-[#4a4a44]">
              <span className="text-xs font-semibold text-[#211922] dark:text-[#f6f6f3]">{initials}</span>
            </div>
            {/* Pulsing green dot */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-xs font-medium text-[#211922] dark:text-[#f6f6f3] truncate">{displayName}</p>
                <p className="text-xs text-[#91918c] whitespace-nowrap">{role}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-[16px] text-sm text-[#62625b] dark:text-[#b4b4ad]',
            'hover:bg-[#e60023]/8 hover:text-[#e60023] dark:hover:bg-[#e60023]/15 dark:hover:text-[#ff4d6a] transition-colors',
            collapsed && 'justify-center px-2'
          )}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="glass-surface fixed left-4 top-4 z-50 rounded-[16px] p-2 lg:hidden"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5 text-[#211922] dark:text-[#f6f6f3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        {sidebarContent}
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed left-0 top-0 bottom-0 z-50 flex lg:hidden"
            >
              <aside className="glass-surface flex min-h-screen w-64 flex-col border-r border-[#e5e5e0] dark:border-[#3e3e39]">
                <div className="flex items-center gap-3 border-b border-[#e5e5e0] px-4 py-5 dark:border-[#3e3e39]">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 rounded-lg bg-[#e60023] blur opacity-30" />
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#e60023]">
                      <span className="text-sm font-bold text-white">M</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-[#211922] dark:text-[#f6f6f3]">The Matrix</h1>
                    <p className="text-xs text-[#91918c]">Humor Flavors</p>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="ml-auto p-1 rounded text-[#91918c] hover:text-[#211922] dark:hover:text-[#f6f6f3]"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-1 relative">
                  {navItems.map((item) => {
                    const isActive =
                      pathname === item.href || pathname.startsWith(`${item.href}/`)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-[#e60023] text-white'
                            : 'text-[#62625b] dark:text-[#b4b4ad] hover:bg-[#e5e5e0] dark:hover:bg-[#3e3e39] hover:text-[#211922] dark:hover:text-[#f6f6f3]'
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
                <div className="px-2 py-4 border-t border-[#e5e5e0] dark:border-[#3e3e39] space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs text-[#91918c]">Theme</span>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center gap-3 px-1">
                    <div className="relative flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e5e5e0] dark:bg-[#3e3e39] border border-[#e0e0d9] dark:border-[#4a4a44]">
                        <span className="text-xs font-semibold text-[#211922] dark:text-[#f6f6f3]">{initials}</span>
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#211922] dark:text-[#f6f6f3] truncate">{displayName}</p>
                      <p className="text-xs text-[#91918c]">{role}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-[16px] text-sm text-[#62625b] dark:text-[#b4b4ad] hover:bg-[#e60023]/8 hover:text-[#e60023] dark:hover:bg-[#e60023]/15 dark:hover:text-[#ff4d6a] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </aside>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
