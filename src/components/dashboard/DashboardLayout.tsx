'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  FileText, 
  Building2, 
  Tag,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react'

// Custom icons not available in lucide-react
const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const LayoutDashboard = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
)

const Image = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const Settings = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const BarChart3 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)
import { useAuth } from '@/contexts/AuthContext'
import { newsApi } from '@/lib/api'
import { parseSiteSettingsRows, stringFromMap } from '@/lib/site-settings'
import AdminThemeToggle from '@/components/theme/AdminThemeToggle'

interface DashboardLayoutProps {
  children: React.ReactNode
  profile: any
}

export default function DashboardLayout({ children, profile }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [brandMark, setBrandMark] = useState('•')
  const pathname = usePathname()
  const { signOut } = useAuth()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await newsApi.siteSettings.list()
        const map = parseSiteSettingsRows(data)
        const custom = stringFromMap(map, 'dashboard_logo_text').trim()
        const fromSite =
          stringFromMap(map, 'site_name')
            .split(/\s+/)
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || '•'
        const mark = (custom || fromSite).slice(0, 3)
        if (!cancelled) setBrandMark(mark)
      } catch {
        if (!cancelled) setBrandMark('•')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const _isAdmin = profile?.role === 'admin'
  const _isEditor = profile?.role === 'editor'
  const _isAuthor = profile?.role === 'author'
  const _isBusinessOwner = profile?.role === 'business_owner'

  // Role-based navigation with different menus for different user types
  const getNavigationForRole = (role: string) => {
    switch (role) {
      case 'author':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'My Articles', href: '/admin/articles', icon: FileText },
          { name: 'Media Library', href: '/admin/media', icon: Image }
        ]
        
      case 'business_owner':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'My Articles', href: '/admin/articles', icon: FileText },
          { name: 'My Business', href: '/businesses/my', icon: Building2 },
          { name: 'Media Library', href: '/admin/media', icon: Image }
        ]
        
      case 'editor':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'All Articles', href: '/admin/articles', icon: FileText },
          { name: 'Categories & Tags', href: '/admin/categories', icon: Tag },
          { name: 'Media Library', href: '/admin/media', icon: Image },
          { name: 'Content Review', href: '/admin/review', icon: Shield }
        ]

      case 'admin':
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Articles', href: '/admin/articles', icon: FileText },
          { name: 'Users', href: '/admin/users', icon: Users },
          { name: 'Businesses', href: '/admin/businesses', icon: Building2 },
          { name: 'Categories', href: '/admin/categories', icon: Tag },
          { name: 'Media Library', href: '/admin/media', icon: Image },
          { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
          { name: 'Settings', href: '/admin/settings', icon: Settings }
        ]
        
      default: // subscribers and other roles
        return [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Saved Articles', href: '/profile/saved', icon: FileText },
          { name: 'Subscription', href: '/profile/subscription', icon: User }
        ]
    }
  }

  const navigation = getNavigationForRole(profile?.role || 'subscriber')

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    if (href === '/profile') {
      return pathname === '/profile'
    }
    return pathname?.startsWith(href)
  }

  return (
    <div className="bg-bg min-h-0 flex-1 flex flex-col">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-surface border-r border-border-default transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border-default">
            <Link href="/" className="flex items-center space-x-2 min-w-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="font-bold text-xs text-[rgb(var(--color-text-inverse))]">
                  {brandMark}
                </span>
              </div>
              <span className="font-bold text-text truncate">Dashboard</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center space-x-3 px-3 py-3 md:py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px]
                    ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-muted hover:bg-surface-raised hover:text-text'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border-default">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-[rgb(var(--color-text-inverse))] text-xs font-medium">
                  {profile?.first_name?.charAt(0) ||
                    profile?.full_name?.charAt(0) ||
                    profile?.email?.charAt(0) ||
                    'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text truncate">
                  {profile?.first_name || profile?.last_name
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                    : profile?.full_name || profile?.email || 'User'}
                </p>
                <p className="text-xs text-text-muted capitalize">{profile?.role || 'user'}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Link
                href="/profile"
                className="flex-1 text-center px-3 py-3 md:py-2 text-sm text-text bg-surface-raised rounded-lg hover:opacity-90 transition-opacity min-h-[44px] flex items-center justify-center border border-border-default"
              >
                Profile
              </Link>
              <button
                onClick={signOut}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-3 md:py-2 text-sm text-danger bg-surface-raised rounded-lg hover:opacity-90 transition-opacity min-h-[44px] border border-danger/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-0">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-surface border-b border-border-default h-16 flex items-center justify-between px-4 flex-shrink-0 gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-md text-text-muted hover:text-text min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <AdminThemeToggle />
          <Link
            href="/"
            className="text-sm font-medium text-primary hover:opacity-90 min-h-[44px] flex items-center px-2"
          >
            View Site →
          </Link>
        </div>

        {/* Page content — document scroll only (no nested overflow) */}
        <div className="flex-1 p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

