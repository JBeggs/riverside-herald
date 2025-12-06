'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'

interface FooterClientProps {
  siteName: string
  description: string
  contact: {
    address: string
    phone: string
    email: string
  }
  social: {
    facebook: string
    twitter: string
    instagram: string
  }
  menuItems: Array<{ title: string; href: string }>
}

export default function FooterClient({ siteName, description, contact, social, menuItems }: FooterClientProps) {
  const pathname = usePathname()
  
  // Check if we're on a dashboard route that uses DashboardLayout
  const isDashboardRoute = pathname?.startsWith('/dashboard') || 
                          pathname?.startsWith('/profile') || 
                          pathname?.startsWith('/admin/')
  
  return (
    <footer className={`bg-neutral-900 text-white ${isDashboardRoute ? 'lg:pl-64' : ''}`}>
      <div className="container-wide">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold">
                  {siteName.split(' ').map((word: string) => word[0]).join('').slice(0, 2)}
                </span>
              </div>
              <span className="font-bold text-lg">{siteName}</span>
            </div>
            <p className="text-neutral-300 mb-4">{description}</p>
            <div className="flex space-x-4">
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-neutral-300 hover:text-white">Home</Link></li>
              <li><Link href="/articles" className="text-neutral-300 hover:text-white">Latest News</Link></li>
              <li><Link href="/businesses" className="text-neutral-300 hover:text-white">Business Directory</Link></li>
              {menuItems.slice(0, 4).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-neutral-300 hover:text-white">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-neutral-300 hover:text-white">Features & Registration</Link></li>
              <li><Link href="/advertise" className="text-neutral-300 hover:text-white">Advertise With Us</Link></li>
              <li><Link href="/newsletter" className="text-neutral-300 hover:text-white">Newsletter</Link></li>
              <li><Link href="/submit-story" className="text-neutral-300 hover:text-white">Submit a Story</Link></li>
              <li><Link href="/careers" className="text-neutral-300 hover:text-white">Careers</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <div className="space-y-3">
              {contact.address && (
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-neutral-400 mt-0.5" />
                  <span className="text-neutral-300 text-sm">{contact.address}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-300">{contact.phone}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-300">{contact.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm">
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-neutral-400 hover:text-white text-sm">Privacy Policy</Link>
              <Link href="/terms" className="text-neutral-400 hover:text-white text-sm">Terms of Service</Link>
              <Link href="/cookies" className="text-neutral-400 hover:text-white text-sm">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

