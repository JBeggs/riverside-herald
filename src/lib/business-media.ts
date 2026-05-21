/**
 * Normalize business logos and ecommerce product images from API payloads.
 */
import { getMediaCardUrl } from './image-utils'

export function getEcommerceCompanySlug(business: {
  slug?: string
  ecommerce_slug?: string | null
  ecommerce_company?: { slug?: string } | null
} | null | undefined): string {
  if (!business) return ''
  return String(
    business.ecommerce_slug || business.ecommerce_company?.slug || business.slug || '',
  ).trim()
}

/** Logo object for cards (file_url may be relative; pass through getAbsoluteImageUrl). */
export function resolveBusinessLogo(
  business: {
    name?: string
    logo?: { file_url?: string | null; thumbnail_url?: string | null; alt_text?: string } | null
    logo_url?: string | null
  } | null | undefined,
): { file_url: string; thumbnail_url?: string; alt_text?: string } | null {
  if (!business) return null
  const fromMedia = business.logo?.file_url?.trim()
  if (fromMedia) {
    return {
      file_url: fromMedia,
      thumbnail_url: business.logo?.thumbnail_url?.trim() || undefined,
      alt_text: business.logo?.alt_text || `${business.name || 'Business'} logo`,
    }
  }
  const fromUrl = business.logo_url?.trim()
  if (fromUrl) {
    return { file_url: fromUrl, alt_text: `${business.name || 'Business'} logo` }
  }
  return null
}

export function resolveProductImage(
  product: {
    image?: string | { file_url?: string | null } | null
    images?: Array<string | { file_url?: string | null; url?: string | null }>
    image_thumbnail?: string | null
    image_thumbnails?: string[] | null
  } | null | undefined,
): { file_url: string } | null {
  if (!product) return null
  const img = product.image
  if (typeof img === 'string' && img.trim()) {
    return { file_url: img.trim() }
  }
  if (img && typeof img === 'object' && img.file_url?.trim()) {
    return { file_url: img.file_url.trim() }
  }
  const images = product.images
  if (Array.isArray(images)) {
    for (const entry of images) {
      if (typeof entry === 'string' && entry.trim()) {
        return { file_url: entry.trim() }
      }
      if (entry && typeof entry === 'object') {
        const url = (entry.file_url || entry.url || '').trim()
        if (url) return { file_url: url }
      }
    }
  }
  return null
}

/** Product image for cards — prefers API thumbnail fields. */
export function resolveProductCardImage(
  product: {
    image?: string | { file_url?: string | null; thumbnail_url?: string | null } | null
    images?: Array<string | { file_url?: string | null; url?: string | null; thumbnail_url?: string | null }>
    image_thumbnail?: string | null
    image_thumbnails?: string[] | null
  } | null | undefined,
): { file_url: string } | null {
  if (!product) return null
  const apiThumb = (product.image_thumbnail || '').trim()
  if (apiThumb) return { file_url: apiThumb }
  const apiThumbs = Array.isArray(product.image_thumbnails)
    ? product.image_thumbnails.filter((u): u is string => typeof u === 'string' && !!u.trim())
    : []
  if (apiThumbs.length > 0) return { file_url: apiThumbs[0].trim() }
  const img = product.image
  if (img && typeof img === 'object' && img.thumbnail_url?.trim()) {
    return { file_url: img.thumbnail_url.trim() }
  }
  return resolveProductImage(product)
}

export function resolveBusinessCoverCardUrl(
  cover?: { file_url?: string | null; thumbnail_url?: string | null } | null,
): string {
  return getMediaCardUrl(cover)
}

export function mapCoverImageForCard(
  cover: { file_url?: string | null; thumbnail_url?: string | null; alt_text?: string | null } | null | undefined,
  altFallback: string,
  fallbackCardUrl?: string | null,
) {
  if (cover?.file_url?.trim()) {
    return {
      file_url: cover.file_url,
      thumbnail_url: cover.thumbnail_url,
      alt_text: cover.alt_text || altFallback,
    }
  }
  if (fallbackCardUrl?.trim()) {
    return { file_url: fallbackCardUrl.trim(), alt_text: altFallback }
  }
  return null
}
