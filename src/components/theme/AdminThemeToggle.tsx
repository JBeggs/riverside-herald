'use client'

import { useTheme, type Theme } from '@/contexts/ThemeContext'

const SunIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)
/** Dashboard only: classic (= light) vs dark. */
export default function AdminThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  const toggle = () => {
    if (isDark) {
      setTheme('classic' as Theme)
    } else {
      setTheme('dark' as Theme)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 min-h-[44px] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      title={isDark ? 'Switch to light' : 'Switch to dark'}
    >
      {isDark ? (
        <>
          <SunIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <MoonIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  )
}
