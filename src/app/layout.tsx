import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import '../styles/pages.css'
import { serverNewsApi } from '@/lib/api-server'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ConfirmDialogProvider } from '@/contexts/ConfirmDialogContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import {
  THEME_BOOTSTRAP_SCRIPT,
  THEME_COOKIE_KEY,
  DEFAULT_THEME,
  isTheme,
  type Theme,
} from '@/contexts/theme-config'
import { parseSiteSettingsRows, defaultThemeFromMap, type SiteSettingsMap } from '@/lib/site-settings'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import AuthMessage from '@/components/auth/AuthMessage'
import { getCompany } from '@/lib/company'
import { CompanyProvider } from '@/contexts/CompanyContext'

export const dynamic = 'force-dynamic'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F4' },
    { media: '(prefers-color-scheme: dark)', color: '#09090B' },
  ],
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

function tryParseJSON(value: string) {
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = (await serverNewsApi.siteSettings.list()) as any
    const settingsArray = Array.isArray(settings) ? settings : settings?.results || []

    const settingsMap = settingsArray.reduce((acc: Record<string, any>, setting: any) => {
      const v =
        setting.type === 'json' && typeof setting.value === 'string'
          ? tryParseJSON(setting.value)
          : setting.value
      return { ...acc, [setting.key]: v }
    }, {})

    const siteName = settingsMap.site_name || 'News'
    const tagline = settingsMap.site_tagline || 'Local news'
    const description =
      settingsMap.site_description || 'Stay informed with local news and community updates'

    return {
      title: `${siteName} | ${tagline}`,
      description,
      icons: {
        icon: [
          { url: '/favicon.ico' },
          { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
          { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
          { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
          { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
          { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
          { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
        ],
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
      },
      openGraph: {
        title: `${siteName} | ${tagline}`,
        description,
        type: 'website',
      },
    }
  } catch {
    return {
      title: 'News | Local',
      description: 'Stay informed with local news and community updates',
      icons: {
        icon: [
          { url: '/favicon.ico' },
          { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
          { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
          { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
          { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
          { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
          { url: '/favicon.png', sizes: '512x512', type: 'image/png' },
        ],
        shortcut: '/favicon.ico',
        apple: '/apple-touch-icon.png',
      },
    }
  }
}

export const metadata = await generateMetadata()

function readInitialTheme(cookieVal: string | undefined, map: SiteSettingsMap): Theme {
  if (isTheme(cookieVal)) return cookieVal
  const fromSettings = defaultThemeFromMap(map)
  if (fromSettings) return fromSettings
  return DEFAULT_THEME
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get(THEME_COOKIE_KEY)?.value

  let settingsMap: SiteSettingsMap = {}
  try {
    const raw = await serverNewsApi.siteSettings.list()
    settingsMap = parseSiteSettingsRows(raw)
  } catch {
    /* ignore */
  }

  const initialTheme = readInitialTheme(themeCookie, settingsMap)
  const fontClassNames = `${inter.variable} ${playfair.variable}`
  const company = await getCompany()

  return (
    <html
      lang="en"
      data-theme={initialTheme}
      className={`${fontClassNames} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <meta name="format-detection" content="telephone=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} />
      </head>
      <body className={`${inter.className} antialiased bg-bg text-text`}>
        <ThemeProvider initialTheme={initialTheme}>
          <CompanyProvider company={company}>
            <ToastProvider>
              <ConfirmDialogProvider>
                <AuthProvider>
                  <div className="min-h-screen flex flex-col">
                    <Header />
                    <main className="flex min-h-0 flex-1 flex-col">{children}</main>
                    <Footer />
                  </div>
                  <Suspense fallback={null}>
                    <AuthMessage />
                  </Suspense>
                </AuthProvider>
              </ConfirmDialogProvider>
            </ToastProvider>
          </CompanyProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}
