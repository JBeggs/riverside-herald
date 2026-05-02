'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_THEME,
  THEMES,
  THEME_COOKIE_KEY,
  THEME_STORAGE_KEY,
  isTheme,
  type Theme,
} from './theme-config'

export {
  DEFAULT_THEME,
  THEMES,
  THEME_META,
  THEME_BOOTSTRAP_SCRIPT,
  type Theme,
} from './theme-config'

function writeCookie(value: Theme) {
  if (typeof document === 'undefined') return
  const oneYear = 60 * 60 * 24 * 365
  document.cookie = `${THEME_COOKIE_KEY}=${value}; path=/; max-age=${oneYear}; SameSite=Lax`
}

function readCookie(): Theme | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${THEME_COOKIE_KEY}=`))
  if (!match) return null
  const value = match.split('=')[1]
  return isTheme(value) ? value : null
}

function readStorage(): Theme | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(value) ? value : null
  } catch {
    return null
  }
}

function applyDom(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.dataset.theme = theme
}

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  themes: readonly Theme[]
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeProviderProps {
  children: ReactNode
  initialTheme?: Theme
}

export function ThemeProvider({ children, initialTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme ?? DEFAULT_THEME)

  useEffect(() => {
    const fromClient = readCookie() ?? readStorage()
    if (fromClient && fromClient !== theme) {
      setThemeState(fromClient)
      applyDom(fromClient)
    } else {
      applyDom(theme)
    }
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    applyDom(next)
    writeCookie(next)
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, themes: THEMES }),
    [theme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    return { theme: DEFAULT_THEME, setTheme: () => {}, themes: THEMES }
  }
  return ctx
}
