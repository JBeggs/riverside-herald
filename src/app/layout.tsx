import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Suspense } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import '../styles/pages.css'
import { serverNewsApi } from '@/lib/api-server'
import { AuthProvider } from '@/contexts/AuthContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { ConfirmDialogProvider } from '@/contexts/ConfirmDialogContext'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import AuthMessage from '@/components/auth/AuthMessage'

// Force dynamic rendering since we use cookies in Header/Footer
export const dynamic = 'force-dynamic'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap'
})

// Get dynamic metadata from database
async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await serverNewsApi.siteSettings.list() as any
    const settingsArray = Array.isArray(settings) ? settings : (settings?.results || [])
    
    function tryParseJSON(value: string) {
      try {
        return JSON.parse(value)
      } catch {
        return value // Return as-is if not valid JSON
      }
    }

    const settingsMap = settingsArray.reduce((acc: Record<string, any>, setting: any) => ({
      ...acc,
      [setting.key]: tryParseJSON(setting.value)
    }), {})
    
    const siteName = settingsMap.site_name || 'The Riverside Herald'
    const tagline = settingsMap.site_tagline || 'Your Local News Source'
    const description = settingsMap.site_description || 'Stay informed with local news and community updates'
    
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
  } catch (error) {
    // Fallback metadata if database is unavailable
    return {
      title: 'The Riverside Herald | Your Local News Source',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <ToastProvider>
          <ConfirmDialogProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Suspense fallback={null}>
              <AuthMessage />
            </Suspense>
          </AuthProvider>
          </ConfirmDialogProvider>
        </ToastProvider>
        <SpeedInsights />
      </body>
    </html>
  )
}