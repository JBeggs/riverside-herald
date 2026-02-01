'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, Bell } from 'lucide-react'
import ClientHeader from './ClientHeader'

interface MenuItem {
  title: string
  href: string
}

interface MobileNavProps {
  menuItems: MenuItem[]
}

export function MobileNav({ menuItems }: MobileNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
        <div className="absolute top-full left-0 right-0 md:hidden bg-white border-b border-neutral-200 shadow-xl z-[60]">
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
            <div className="border-t border-neutral-200 pt-4 mt-4">
              <div className="flex justify-center">
                <ClientHeader />
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}