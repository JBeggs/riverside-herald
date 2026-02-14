import { serverNewsApi } from '@/lib/api-server'
import Link from 'next/link'
import { MobileNav } from './MobileNav'
import ClientHeader from './ClientHeader'

async function getHeaderData() {
  try {
    // Get site settings
    const settingsData: any = await serverNewsApi.siteSettings.list()
    const settingsArray = Array.isArray(settingsData) ? settingsData : (settingsData?.results || [])
    const settingsMap: Record<string, any> = {}
    
    settingsArray.forEach((setting: any) => {
      try {
        settingsMap[setting.key] = setting.type === 'json' 
          ? JSON.parse(setting.value) 
          : setting.value
      } catch {
        settingsMap[setting.key] = setting.value
      }
    })

    // For now, use hardcoded menu items (menus table not in news app yet)
    // TODO: Add menus endpoint if needed
    const menuItems = [
      { title: 'Articles', href: '/articles' },
      { title: 'Businesses', href: '/businesses' },
    ]

    return {
      siteName: settingsMap.site_name || 'The Riverside Herald',
      tagline: settingsMap.site_tagline || 'Your Local News Source',
      logo: settingsMap.site_logo,
      menuItems
    }
  } catch (error) {
    console.error('Error fetching header data:', error)
    return {
      siteName: 'The Riverside Herald',
      tagline: 'Your Local News Source',
      logo: null,
      menuItems: [
        { title: 'Articles', href: '/articles' },
        { title: 'Businesses', href: '/businesses' },
      ]
    }
  }
}

export async function Header() {
  const { siteName, tagline, menuItems } = await getHeaderData()

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-[100]">
      {/* Top Bar */}
      <div className="bg-neutral-900 text-white">
        <div className="container-wide">
          <div className="flex items-center justify-between py-2 text-xs sm:text-sm">
            <div className="flex items-center space-x-4">
              <span className="hidden xs:inline">{new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              <span className="xs:hidden">{new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/newsletter" className="hover:text-blue-400">Newsletter</Link>
              <Link href="/contact" className="hover:text-blue-400">Contact</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container-wide">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt={siteName} className="h-10 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-neutral-900">{siteName}</h1>
                <p className="text-sm text-neutral-600">{tagline}</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation & Auth */}
          <div className="flex items-center space-x-8">
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="nav-link">Home</Link>
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href} className="nav-link">
                  {item.title}
                </Link>
              ))}
              <Link href="/features" className="nav-link">Features</Link>
            </nav>
            
            {/* Auth Button */}
            <div className="hidden md:block">
              <ClientHeader />
            </div>
          </div>

          {/* Mobile Navigation */}
          <MobileNav menuItems={menuItems} />
        </div>
      </div>
    </header>
  )
}
