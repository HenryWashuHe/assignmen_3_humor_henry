'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 w-9 h-9" aria-label="Toggle theme" />
    )
  }

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  const icon =
    theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻'

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors text-sm"
      aria-label={`Current theme: ${theme}. Click to cycle.`}
      title={`Theme: ${theme}`}
    >
      {icon}
    </button>
  )
}
