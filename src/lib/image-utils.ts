/**
 * Utility functions for handling image URLs
 */

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
 * Get image URL for an article card or hero (featured media, or site placeholder).
 */
export function getArticleImageUrl(article?: { featured_media?: { file_url?: string | null } | null }): string {
  if (article?.featured_media?.file_url) {
    return getAbsoluteImageUrl(article.featured_media.file_url)
  }
  return ARTICLE_IMAGE_PLACEHOLDER
}

/**
 * Open Graph image URLs (absolute). Uses placeholder only when NEXT_PUBLIC_SITE_URL is set.
 */
export function getArticleOpenGraphImageUrls(
  article?: { featured_media?: { file_url?: string | null } | null },
): string[] {
  if (article?.featured_media?.file_url) {
    return [getAbsoluteImageUrl(article.featured_media.file_url)]
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
    logo?: { file_url?: string | null } | null
    cover_image?: { file_url?: string | null } | null
    logo_url?: string | null
  },
  type: 'logo' | 'cover' = 'cover'
): string {
  if (type === 'logo') {
    if (business?.logo?.file_url) return getAbsoluteImageUrl(business.logo.file_url)
    if ((business as any)?.logo_url) return getAbsoluteImageUrl((business as any).logo_url)
  }
  if (type === 'cover' && business?.cover_image?.file_url) {
    return getAbsoluteImageUrl(business.cover_image.file_url)
  }
  return ''
}

