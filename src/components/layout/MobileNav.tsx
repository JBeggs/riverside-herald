'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, LogIn, User, LogOut, Building2, FileText, Images } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from '../auth/AuthModal'
import { getAvatarCardUrl } from '@/lib/image-utils'

const DASHBOARD_ROLES = new Set(['admin', 'editor', 'author', 'business_owner'])
const CONTENT_ROLES = new Set(['admin', 'editor', 'author', 'business_owner'])
const ADMIN_ROLES = new Set(['admin', 'editor'])

interface MenuItem {
  title: string
  href: string
}

interface MobileNavProps {
  menuItems: MenuItem[]
}

const rowNavClass =
  'flex items-center gap-3 py-3 px-4 text-text rounded-lg hover:bg-[rgb(var(--color-surface-raised)/0.65)] hover:text-primary transition-colors min-h-[44px] border border-transparent'

export function MobileNav({ menuItems }: MobileNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const role = profile?.role
  const avatarUrl = getAvatarCardUrl(profile)
  const showDashboard = Boolean(user && role && DASHBOARD_ROLES.has(role))
  const showMyBusinesses = role === 'business_owner'
  const showContentTools = Boolean(user && role && CONTENT_ROLES.has(role))
  const showAdminPanel = Boolean(user && role && ADMIN_ROLES.has(role))

  const handleLoginClick = () => {
    setShowAuthModal(true)
  }

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* Right Side Actions */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <Link
          href="/articles"
          className="p-2 text-text-muted hover:text-primary min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-[rgb(var(--color-surface-raised)/0.5)]"
          aria-label="Browse and search articles"
          title="Articles (search on page)"
        >
          <Search className="w-5 h-5" />
        </Link>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-text-muted hover:text-primary hover:bg-[rgb(var(--color-surface-raised)/0.5)] rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav-panel"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[var(--site-header-height,104px)] md:hidden bg-surface z-[150] overflow-y-auto safe-pb">
          <nav id="mobile-nav-panel" className="container-wide py-6 space-y-1" aria-label="Mobile">
            <p className="px-4 text-xs font-semibold uppercase tracking-wider text-text-muted pt-2 pb-1">Explore</p>
            <Link href="/" className={rowNavClass} onClick={() => setIsMenuOpen(false)}>
              Home
            </Link>
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className={rowNavClass} onClick={() => setIsMenuOpen(false)}>
                {item.title}
              </Link>
            ))}
            <Link href="/features" className={rowNavClass} onClick={() => setIsMenuOpen(false)}>
              Features
            </Link>

            <p className="px-4 text-xs font-semibold uppercase tracking-wider text-text-muted pt-6 pb-1">More</p>
            <Link href="/newsletter" className={rowNavClass} onClick={() => setIsMenuOpen(false)}>
              Newsletter
            </Link>
            <Link href="/contact" className={rowNavClass} onClick={() => setIsMenuOpen(false)}>
              Contact
            </Link>

            <div className="border-t border-border-default pt-4 mt-4">
              <p className="px-4 text-xs font-semibold uppercase tracking-wider text-text-muted pb-2">Account</p>
              <div className="flex flex-col space-y-2 px-0 sm:px-0">
                {!user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleLoginClick()
                        setIsMenuOpen(false)
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-[rgb(var(--color-surface-raised)/0.85)] text-text font-medium hover:bg-[rgb(var(--color-surface-raised))] transition-colors min-h-[48px] border border-border-default"
                    >
                      <LogIn className="w-5 h-5 shrink-0" />
                      Sign In
                    </button>
                    <Link
                      href="/register"
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-primary text-[rgb(var(--color-on-accent))] font-medium hover:opacity-90 transition-opacity min-h-[48px]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="w-5 h-5 shrink-0" />
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgb(var(--color-surface-raised)/0.45)] border border-border-default">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-border-default shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-[rgb(var(--color-on-accent))]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text truncate">
                          {profile?.first_name || profile?.last_name
                            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
                            : profile?.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-text-muted truncate">{user.email}</p>
                        {role ? (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-[rgb(var(--color-surface-raised))] text-text-muted text-[10px] uppercase tracking-wide">
                            {role.replace(/_/g, ' ')}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {showDashboard ? (
                      <Link
                        href="/dashboard"
                        className={`${rowNavClass} font-semibold bg-primary/10 text-primary border-primary/25`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    ) : null}

                    {showMyBusinesses ? (
                      <Link href="/businesses/my" className={rowNavClass} onClick={() => setIsMenuOpen(false)}>
                        <Building2 className="w-5 h-5 shrink-0 text-text-muted" />
                        My businesses
                      </Link>
                    ) : null}

                    {showContentTools ? (
                      <Link href="/admin/articles" className={rowNavClass} onClick={() => setIsMenuOpen(false)}>
                        <FileText className="w-5 h-5 shrink-0 text-text-muted" />
                        {role === 'business_owner' ? 'My articles' : 'Articles (CMS)'}
                      </Link>
                    ) : null}

                    {showContentTools ? (
                      <Link href="/admin/media" className={rowNavClass} onClick={() => setIsMenuOpen(false)}>
                        <Images className="w-5 h-5 shrink-0 text-text-muted" />
                        Media library
                      </Link>
                    ) : null}

                    <Link href="/profile" className={rowNavClass} onClick={() => setIsMenuOpen(false)}>
                      <User className="w-5 h-5 shrink-0 text-text-muted" />
                      Profile &amp; settings
                    </Link>

                    {showAdminPanel ? (
                      <Link href="/admin" className={rowNavClass} onClick={() => setIsMenuOpen(false)}>
                        Admin panel
                      </Link>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors min-h-[48px] mt-2"
                    >
                      <LogOut className="w-5 h-5 shrink-0" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultMode="login" />
    </>
  )
}