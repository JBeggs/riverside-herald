/**
 * Client-safe company / site branding from site-settings.
 * Import from here in client components; use `getCompany()` from `company.ts` on the server.
 */

export interface Company {
  name: string
  tagline: string
  description: string
  logoUrl: string | null
  heroImageUrl: string | null
  ogImageUrl: string | null
  brandColor: string | null
  contact: {
    email: string
    phone: string
    address: string
  }
  social: {
    facebook: string
    twitter: string
    instagram: string
    whatsapp: string
  }
  currency: string
  localeTag: string
  paymentProviderDisplayName?: string
}

/** Shown only when site settings cannot be loaded. */
export const FALLBACK_COMPANY: Company = {
  name: 'News',
  tagline: 'Local news',
  description: 'Stay informed with local news and community updates',
  logoUrl: null,
  heroImageUrl: null,
  ogImageUrl: null,
  brandColor: null,
  contact: { email: '', phone: '', address: '' },
  social: { facebook: '', twitter: '', instagram: '', whatsapp: '' },
  currency: '',
  localeTag: 'en',
}

export function companyMonogram(name: string): string {
  const trimmed = (name || '').trim()
  if (!trimmed) return 'N'
  const parts = trimmed.split(/\s+/)
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase()
}
