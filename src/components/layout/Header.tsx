import { serverNewsApi } from '@/lib/api-server'
import Link from 'next/link'
import { MobileNav } from './MobileNav'
import { SiteLogo } from './SiteLogo'
import ClientHeader from './ClientHeader'
import ThemeSwitcher from '@/components/theme/ThemeSwitcher'
import { parseSiteSettingsRows, stringFromMap } from '@/lib/site-settings'

async function getHeaderData() {
  try {
    const settingsData: unknown = await serverNewsApi.siteSettings.list()
    const settingsMap = parseSiteSettingsRows(settingsData)

    const siteName = stringFromMap(settingsMap, 'site_name') || 'News'
    const tagline = stringFromMap(settingsMap, 'site_tagline') || ''

    const menuItems = [
      { title: 'Articles', href: '/articles' },
      { title: 'Businesses', href: '/businesses' },
    ]

    return {
      siteName,
      tagline,
      logo: settingsMap.site_logo,
      menuItems,
      defaultLocale: stringFromMap(settingsMap, 'default_locale') || 'en-ZA',
    }
  } catch (error) {
    console.error('Error fetching header data:', error)
    return {
      siteName: 'News',
      tagline: '',
      logo: null,
      menuItems: [
        { title: 'Articles', href: '/articles' },
        { title: 'Businesses', href: '/businesses' },
      ],
      defaultLocale: 'en-ZA',
    }
  }
}

export async function Header() {
  const { siteName, tagline, menuItems, logo, defaultLocale } = await getHeaderData()
  const logoSrc = (logo as string) || '/logo.png'

  const longDate = new Date().toLocaleDateString(defaultLocale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const shortDate = new Date().toLocaleDateString(defaultLocale, {
    month: 'short',
    day: 'numeric',
  })

  return (
    <header className="site-header bg-surface border-b border-border-default sticky top-0 z-[100] [--site-header-height:104px] sm:[--site-header-height:112px]">
      {/* Top Bar */}
      <div className="bg-neutral-900 text-neutral-50">
        <div className="container-wide">
          <div className="flex items-center justify-between py-2 text-xs sm:text-sm safe-pt">
            <div className="flex items-center space-x-4">
              <span className="hidden xs:inline">{longDate}</span>
              <span className="xs:hidden">{shortDate}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/newsletter" className="hover:opacity-80 transition-opacity">
                Newsletter
              </Link>
              <Link href="/contact" className="hover:opacity-80 transition-opacity">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-wide">
        <div className="flex items-center justify-between py-4 gap-2 w-full">
          <div className="flex items-center min-w-0 flex-1">
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <SiteLogo src={logoSrc} alt={siteName} />
              {tagline ? (
                <span className="hidden lg:inline ml-3 text-sm text-text-muted truncate max-w-[12rem]">
                  {tagline}
                </span>
              ) : null}
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="nav-link">
                Home
              </Link>
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.title}
                </Link>
              ))}
              <Link href="/features" className="nav-link">
                Features
              </Link>
            </nav>

            <ThemeSwitcher />

            <div className="hidden md:block">
              <ClientHeader />
            </div>

            <MobileNav menuItems={menuItems} />
          </div>
        </div>
      </div>
    </header>
  )
}
