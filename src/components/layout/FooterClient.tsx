'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react'

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

interface FooterClientProps {
  siteName: string
  description: string
  contact: {
    address: string
    phone: string
    email: string
  }
  socialLinks: Array<{ platform?: string; label?: string; url: string }>
  servicesLinks: Array<{ label: string; href: string }>
  menuItems: Array<{ title: string; href: string }>
}

function socialIcon(platform?: string) {
  const p = (platform || '').toLowerCase()
  if (p.includes('twitter') || p === 'x') return Twitter
  if (p.includes('instagram')) return Instagram
  return Facebook
}

export default function FooterClient({
  siteName,
  description,
  contact,
  socialLinks,
  servicesLinks,
  menuItems,
}: FooterClientProps) {
  const pathname = usePathname()

  const isDashboardRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/admin/')

  return (
    <footer
      className={`bg-footer-bg text-footer-fg border-t border-footer-border ${isDashboardRoute ? 'lg:pl-64' : ''}`}
    >
      <div className="container-wide safe-pb">
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <span className="text-on-primary font-bold text-xs">
                  {siteName
                    .split(/\s+/)
                    .map((word: string) => word[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <span className="font-bold text-lg text-footer-fg">{siteName}</span>
            </div>
            <p className="text-footer-muted mb-4">{description}</p>
            {socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((s, i) => {
                  const Icon = socialIcon(s.platform || s.label)
                  const label = s.label || s.platform || 'Social'
                  return (
                    <a
                      key={`${s.url}-${i}`}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-footer-muted hover:text-footer-fg inline-flex items-center gap-1"
                      title={label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-footer-fg">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-footer-muted hover:text-footer-fg">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-footer-muted hover:text-footer-fg">
                  Latest News
                </Link>
              </li>
              <li>
                <Link href="/businesses" className="text-footer-muted hover:text-footer-fg">
                  Business Directory
                </Link>
              </li>
              {menuItems.slice(0, 4).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-footer-muted hover:text-footer-fg">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-footer-fg">Services</h3>
            <ul className="space-y-2">
              {servicesLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-footer-muted hover:text-footer-fg inline-flex items-center gap-1">
                    {item.label}
                    {item.href.startsWith('http') ? (
                      <ExternalLinkIcon className="w-3 h-3 shrink-0" />
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4 text-footer-fg">Contact</h3>
            <div className="space-y-3">
              {contact.address ? (
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-footer-muted mt-0.5 shrink-0" />
                  <span className="text-footer-muted text-sm">{contact.address}</span>
                </div>
              ) : null}
              {contact.phone ? (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-footer-muted shrink-0" />
                  <span className="text-footer-muted">{contact.phone}</span>
                </div>
              ) : null}
              {contact.email ? (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-footer-muted shrink-0" />
                  <a href={`mailto:${contact.email}`} className="text-footer-muted hover:text-footer-fg">
                    {contact.email}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="py-6 border-t border-footer-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-footer-muted text-sm">
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link href="/privacy" className="text-footer-muted hover:text-footer-fg text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-footer-muted hover:text-footer-fg text-sm">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-footer-muted hover:text-footer-fg text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
