'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LogIn, LogOut, User, ChevronDown, Building2, FileText, Images } from 'lucide-react'
import AuthModal from './AuthModal'
import { getAvatarCardUrl } from '@/lib/image-utils'

const DASHBOARD_ROLES = new Set(['admin', 'editor', 'author', 'business_owner'])
const CONTENT_ROLES = new Set(['admin', 'editor', 'author', 'business_owner'])
const ADMIN_ROLES = new Set(['admin', 'editor'])

export default function AuthButton({ onAction }: { onAction?: () => void }) {
  const { user, profile, signOut, loading } = useAuth()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLoginClick = () => {
    setShowAuthModal(true)
    onAction?.()
  }

  const handleRegisterClick = () => {
    router.push('/register')
    onAction?.()
  }

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
    if (onAction) onAction()
  }

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="animate-pulse bg-gray-300 rounded-full h-8 w-20"></div>
      </div>
    )
  }

  if (user && profile) {
    const role = profile.role
    const showDashboard = Boolean(role && DASHBOARD_ROLES.has(role))
    const showMyBusinesses = role === 'business_owner'
    const showContentTools = Boolean(role && CONTENT_ROLES.has(role))
    const showAdminPanel = Boolean(role && ADMIN_ROLES.has(role))
    const avatarUrl = getAvatarCardUrl(profile)

    const closeMenu = () => {
      setShowUserMenu(false)
      if (onAction) onAction()
    }

    return (
      <div className="relative">
        {/* User Menu Button */}
        <button
          type="button"
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center space-x-2 px-3 py-2 rounded-full bg-[rgb(var(--color-surface-raised)/0.85)] hover:bg-[rgb(var(--color-surface-raised))] border border-border-default transition-colors"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-border-default"
            />
          ) : (
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-on-primary" />
            </div>
          )}
          <span className="text-sm font-medium text-text hidden sm:block">
            {profile.first_name || profile.last_name 
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
              : profile.full_name || user.email?.split('@')[0]}
          </span>
          <ChevronDown className="w-4 h-4 text-text-muted" />
        </button>

        {/* User Dropdown Menu */}
        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-60 sm:w-64 bg-surface rounded-lg shadow-card border border-border-default py-2 z-50">
            <div className="px-4 py-2 border-b border-border-default">
              <p className="text-sm font-medium text-text">
                {profile.first_name || profile.last_name 
                  ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
                  : profile.full_name}
              </p>
              <p className="text-xs text-text-muted">{user.email}</p>
              {role ? (
                <span className="inline-block mt-1 px-2 py-0.5 bg-[rgb(var(--color-surface-raised))] text-text-muted text-[10px] uppercase tracking-wide rounded-md">
                  {role.replace(/_/g, ' ')}
                </span>
              ) : null}
            </div>
            
            {showDashboard ? (
              <Link 
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/5"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
            ) : null}

            {showMyBusinesses ? (
              <Link 
                href="/businesses/my"
                className="flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-[rgb(var(--color-surface-raised)/0.5)]"
                onClick={closeMenu}
              >
                <Building2 className="w-4 h-4 shrink-0 text-text-muted" />
                My businesses
              </Link>
            ) : null}

            {showContentTools ? (
              <Link 
                href="/admin/articles"
                className="flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-[rgb(var(--color-surface-raised)/0.5)]"
                onClick={closeMenu}
              >
                <FileText className="w-4 h-4 shrink-0 text-text-muted" />
                {role === 'business_owner' ? 'My articles' : 'Articles (CMS)'}
              </Link>
            ) : null}

            {showContentTools ? (
              <Link 
                href="/admin/media"
                className="flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-[rgb(var(--color-surface-raised)/0.5)]"
                onClick={closeMenu}
              >
                <Images className="w-4 h-4 shrink-0 text-text-muted" />
                Media library
              </Link>
            ) : null}

            <Link 
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-[rgb(var(--color-surface-raised)/0.5)]"
              onClick={closeMenu}
            >
              <User className="w-4 h-4 shrink-0 text-text-muted" />
              Profile & settings
            </Link>
            
            {showAdminPanel ? (
              <Link 
                href="/admin" 
                className="flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-[rgb(var(--color-surface-raised)/0.5)]"
                onClick={closeMenu}
              >
                Admin panel
              </Link>
            ) : null}
            
            <div className="border-t border-border-default mt-1 pt-1">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="w-4 h-4 mr-2 shrink-0" />
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Click outside to close menu */}
        {showUserMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowUserMenu(false)}
            aria-hidden
          />
        )}
      </div>
    )
  }

  return (
    <>
      {/* Auth Buttons for non-authenticated users */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={handleLoginClick}
          className="flex items-center px-4 py-2 text-sm font-medium text-text hover:text-primary transition-colors"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </button>

        <button
          type="button"
          onClick={handleRegisterClick}
          className="btn btn-primary flex items-center px-4 py-2 text-sm font-medium rounded-lg"
        >
          <User className="w-4 h-4 mr-2" />
          Sign Up
        </button>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultMode="login" />
    </>
  )
}