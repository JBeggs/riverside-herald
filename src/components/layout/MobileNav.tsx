'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, Bell, LogIn, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import AuthModal from '../auth/AuthModal'

interface MenuItem {
  title: string
  href: string
}

interface MobileNavProps {
  menuItems: MenuItem[]
}

export function MobileNav({ menuItems }: MobileNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode)
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
        <button className="p-2 text-neutral-600 hover:text-blue-600 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 text-neutral-600 hover:text-blue-600 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <Bell className="w-5 h-5" />
        </button>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-neutral-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-[104px] sm:top-[112px] md:hidden bg-white z-[150] overflow-y-auto">
          <nav className="container-wide py-6 space-y-1">
            <Link 
              href="/" 
              className="block py-3 px-4 text-neutral-700 hover:text-blue-600 hover:bg-neutral-50 rounded-lg transition-colors min-h-[44px] flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {menuItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                className="block py-3 px-4 text-neutral-700 hover:text-blue-600 hover:bg-neutral-50 rounded-lg transition-colors min-h-[44px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}
            
            {/* Mobile Authentication */}
            <div className="border-t border-neutral-200 pt-4 mt-4 px-4">
              <div className="flex flex-col space-y-3">
                {!user ? (
                  <>
                    <button
                      onClick={() => {
                        handleAuthClick('login');
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-gray-100 text-gray-900 font-medium hover:bg-gray-200 transition-colors min-h-[48px]"
                    >
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        handleAuthClick('signup');
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all min-h-[48px]"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Sign Up
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {profile?.first_name || profile?.last_name 
                            ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() 
                            : profile?.full_name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link 
                      href="/profile" 
                      className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-gray-100 text-gray-900 font-medium hover:bg-gray-200 transition-colors min-h-[48px]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors min-h-[48px]"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      )}
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  )
}