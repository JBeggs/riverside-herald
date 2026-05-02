'use client'

import { usePathname } from 'next/navigation'
import { useTheme, THEME_META, type Theme } from '@/contexts/ThemeContext'
import { useEffect, useRef, useState } from 'react'

const PaletteIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
)

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

export default function ThemeSwitcher() {
  const pathname = usePathname()
  const { theme, setTheme, themes } = useTheme()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/profile')
  ) {
    return null
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-border-default bg-surface px-2.5 py-2 text-sm font-medium text-text hover:bg-surface-raised min-h-[44px]"
        aria-expanded={open}
        aria-haspopup="listbox"
        title="Theme"
      >
        <PaletteIcon className="h-4 w-4 text-primary" />
        <span className="max-w-[6rem] truncate">{THEME_META[theme].label}</span>
        <ChevronDownIcon className="h-4 w-4 shrink-0 text-text-muted" />
      </button>

      {open ? (
        <ul
          className="absolute right-0 z-[200] mt-1 min-w-[11rem] rounded-lg border border-border-default bg-surface py-1 shadow-card"
          role="listbox"
        >
          {themes.map((t) => (
            <li key={t} role="option" aria-selected={t === theme}>
              <button
                type="button"
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-surface-raised ${t === theme ? 'font-semibold text-primary' : 'text-text'}`}
                onClick={() => {
                  setTheme(t as Theme)
                  setOpen(false)
                }}
              >
                <span className="block">{THEME_META[t as Theme].label}</span>
                <span className="block text-xs text-text-muted font-normal">
                  {THEME_META[t as Theme].description}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
