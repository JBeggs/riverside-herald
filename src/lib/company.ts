/**
 * Server-only: resolves site branding from `site-settings`.
 */

import 'server-only'
import { getAbsoluteImageUrl } from '@/lib/image-utils'
import { DEFAULT_CURRENCY } from '@/lib/format-price'
import { FALLBACK_COMPANY, companyMonogram, type Company } from '@/lib/company-shared'
import { loadSiteSettingsMap } from '@/lib/site-settings'

export { FALLBACK_COMPANY, companyMonogram }
export type { Company }

function coerceString(v: unknown): string {
  if (typeof v === 'string') return v
  if (v == null) return ''
  return String(v)
}

function normaliseImageUrl(v: unknown): string | null {
  if (!v) return null
  if (typeof v === 'string' && v) return getAbsoluteImageUrl(v)
  if (typeof v === 'object' && v !== null) {
    const obj = v as Record<string, unknown>
    const url = obj.url ?? obj.file_url
    if (typeof url === 'string' && url) return getAbsoluteImageUrl(url)
  }
  return null
}

export async function getCompany(): Promise<Company> {
  try {
    const map = await loadSiteSettingsMap()
    const company: Company = {
      name: coerceString(map.site_name) || FALLBACK_COMPANY.name,
      tagline: coerceString(map.site_tagline),
      description: coerceString(map.site_description) || FALLBACK_COMPANY.description,
      logoUrl: normaliseImageUrl(map.site_logo),
      heroImageUrl: normaliseImageUrl(map.hero_image ?? map.site_hero),
      ogImageUrl: normaliseImageUrl(map.og_image ?? map.site_og_image),
      brandColor: coerceString(map.brand_color) || null,
      contact: {
        email: coerceString(map.contact_email),
        phone: coerceString(map.contact_phone),
        address: coerceString(map.contact_address),
      },
      social: {
        facebook: coerceString(map.social_facebook),
        twitter: coerceString(map.social_twitter),
        instagram: coerceString(map.social_instagram),
        whatsapp: coerceString(map.social_whatsapp ?? map.contact_whatsapp),
      },
      currency: coerceString(map.currency) || DEFAULT_CURRENCY,
      localeTag: coerceString(map.site_locale) || FALLBACK_COMPANY.localeTag,
      paymentProviderDisplayName:
        coerceString(map.payment_provider_display_name) || undefined,
    }
    return company
  } catch (err) {
    console.error('[getCompany] failed:', err)
    return FALLBACK_COMPANY
  }
}
