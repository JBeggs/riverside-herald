/**
 * Utility functions for handling image URLs
 */
import { resolveBusinessLogo } from './business-media'

/** Public-site placeholder when an article has no featured image (River Lodge branding). */
export const ARTICLE_IMAGE_PLACEHOLDER = '/image-placeholder.png'

/**
 * Convert relative image URLs to absolute URLs pointing to the backend
 */
export function getAbsoluteImageUrl(url: string | undefined | null): string {
  if (!url) {
    return ''
  }
  
  // If already absolute URL, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // If relative URL, prepend backend domain
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
  const baseUrl = apiUrl.replace('/api', '')
  
  // Remove leading slash if present
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url
  
  return `${baseUrl}/${cleanUrl}`
}

/**
 * Prefer dedicated social/card image for shares, then hero/featured media.
 */
function pickArticleShareImageRaw(article?: {
  social_image?: { file_url?: string | null } | null
  featured_media?: { file_url?: string | null } | null
} | null): string | null {
  const social = article?.social_image?.file_url?.trim()
  if (social) return social
  const featured = article?.featured_media?.file_url?.trim()
  if (featured) return featured
  return null
}

/**
 * Get image URL for an article card or hero (social image, featured media, or site placeholder).
 */
export function getArticleImageUrl(
  article?: {
    social_image?: { file_url?: string | null } | null
    featured_media?: { file_url?: string | null } | null
  } | null,
): string {
  const raw = pickArticleShareImageRaw(article || undefined)
  if (raw) return getAbsoluteImageUrl(raw)
  return ARTICLE_IMAGE_PLACEHOLDER
}

/**
 * Open Graph image URLs (absolute). Uses placeholder only when NEXT_PUBLIC_SITE_URL is set.
 */
export function getArticleOpenGraphImageUrls(
  article?: {
    social_image?: { file_url?: string | null } | null
    featured_media?: { file_url?: string | null } | null
  } | null,
): string[] {
  const raw = pickArticleShareImageRaw(article || undefined)
  if (raw) {
    return [getAbsoluteImageUrl(raw)]
  }
  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '')
  if (site) {
    return [`${site}${ARTICLE_IMAGE_PLACEHOLDER}`]
  }
  return []
}

/**
 * Get image URL for a business logo or cover image
 */
export function getBusinessImageUrl(
  business?: {
    name?: string
    logo?: { file_url?: string | null } | null
    cover_image?: { file_url?: string | null } | null
    logo_url?: string | null
  },
  type: 'logo' | 'cover' = 'cover',
): string {
  if (type === 'logo') {
    const resolved = resolveBusinessLogo(business)
    if (resolved?.file_url) return getAbsoluteImageUrl(resolved.file_url)
  }
  if (type === 'cover' && business?.cover_image?.file_url) {
    return getAbsoluteImageUrl(business.cover_image.file_url)
  }
  return ''
}

