/**
 * Utility functions for handling image URLs
 */

/** Public-site placeholder when an article has no featured image (River Lodge branding). */
export const ARTICLE_IMAGE_PLACEHOLDER = '/image-placeholder.png'

/** Insert `-thumb` before the file extension (matches backend thumb_path_for). */
export function deriveThumbUrlFromFull(url: string): string {
  const raw = (url || '').trim()
  if (!raw) return ''
  const qIdx = raw.indexOf('?')
  const base = qIdx >= 0 ? raw.slice(0, qIdx) : raw
  const query = qIdx >= 0 ? raw.slice(qIdx) : ''
  const slash = base.lastIndexOf('/')
  const head = slash >= 0 ? base.slice(0, slash + 1) : ''
  const name = slash >= 0 ? base.slice(slash + 1) : base
  const dot = name.lastIndexOf('.')
  if (dot <= 0) {
    if (name.endsWith('-thumb')) return raw
    return `${head}${name}-thumb${query}`
  }
  const stem = name.slice(0, dot)
  const ext = name.slice(dot)
  if (stem.endsWith('-thumb')) return raw
  return `${head}${stem}-thumb${ext}${query}`
}

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

/** Prefer thumbnail URL for card/small views; fall back to derived -thumb sibling, then full image. */
export function resolveCardImageUrl(full?: string | null, thumbnail?: string | null): string {
  const thumb = (thumbnail || '').trim()
  if (thumb) return getAbsoluteImageUrl(thumb)
  const fullUrl = (full || '').trim()
  if (fullUrl) {
    const derived = deriveThumbUrlFromFull(fullUrl)
    if (derived && derived !== fullUrl) return getAbsoluteImageUrl(derived)
    return getAbsoluteImageUrl(fullUrl)
  }
  return ARTICLE_IMAGE_PLACEHOLDER
}

function pickArticleCardImageRaw(article?: {
  social_image?: { file_url?: string | null; thumbnail_url?: string | null } | null
  featured_media?: { file_url?: string | null; thumbnail_url?: string | null } | null
} | null): string | null {
  for (const media of [article?.social_image, article?.featured_media]) {
    const thumb = media?.thumbnail_url?.trim()
    if (thumb) return thumb
  }
  for (const media of [article?.social_image, article?.featured_media]) {
    const full = media?.file_url?.trim()
    if (full) {
      const derived = deriveThumbUrlFromFull(full)
      if (derived && derived !== full) return derived
    }
  }
  return pickArticleShareImageRaw(article || undefined)
}

/** Article listing/card image — prefers thumbnail when available. */
export function getArticleCardImageUrl(
  article?: {
    social_image?: { file_url?: string | null; thumbnail_url?: string | null } | null
    featured_media?: { file_url?: string | null; thumbnail_url?: string | null } | null
  } | null,
): string {
  const raw = pickArticleCardImageRaw(article || undefined)
  if (raw) return getAbsoluteImageUrl(raw)
  return ARTICLE_IMAGE_PLACEHOLDER
}

/** Small logo in cards and headers. */
export function getLogoCardUrl(
  logo?: { file_url?: string | null; thumbnail_url?: string | null } | null,
  logoUrl?: string | null,
): string {
  const fromObj = resolveCardImageUrl(logo?.file_url, logo?.thumbnail_url)
  if (fromObj !== ARTICLE_IMAGE_PLACEHOLDER) return fromObj
  const direct = (logoUrl || '').trim()
  if (direct) return getAbsoluteImageUrl(direct)
  return ''
}

/** Profile avatar for nav, lists, and comments. */
export function getAvatarCardUrl(
  profile?: { avatar_url?: string | null; avatar_thumbnail_url?: string | null } | null,
): string {
  const url = resolveCardImageUrl(profile?.avatar_url, profile?.avatar_thumbnail_url)
  return url === ARTICLE_IMAGE_PLACEHOLDER ? '' : url
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

/** Card/small view URL from a Media object; empty when missing (no placeholder). */
export function getMediaCardUrl(
  media?: { file_url?: string | null; thumbnail_url?: string | null } | null,
): string {
  const thumb = (media?.thumbnail_url || '').trim()
  if (thumb) return getAbsoluteImageUrl(thumb)
  const full = (media?.file_url || '').trim()
  if (full) {
    const derived = deriveThumbUrlFromFull(full)
    if (derived && derived !== full) return getAbsoluteImageUrl(derived)
    return getAbsoluteImageUrl(full)
  }
  return ''
}

/** Preserve API media fields needed for card thumbnail resolution. */
export function mapMediaForCard(
  media: { file_url?: string | null; thumbnail_url?: string | null; alt_text?: string | null } | null | undefined,
  altFallback: string,
) {
  if (!media?.file_url?.trim()) return undefined
  return {
    file_url: media.file_url,
    thumbnail_url: media.thumbnail_url ?? undefined,
    alt_text: media.alt_text || altFallback,
  }
}

/**
 * Get image URL for a business logo or cover image
 */
export function getBusinessImageUrl(
  business?: {
    name?: string
    logo?: { file_url?: string | null; thumbnail_url?: string | null } | null
    cover_image?: { file_url?: string | null; thumbnail_url?: string | null } | null
    logo_url?: string | null
  },
  type: 'logo' | 'cover' = 'cover',
): string {
  if (type === 'logo') {
    return getLogoCardUrl(business?.logo, business?.logo_url)
  }
  if (type === 'cover') {
    return getMediaCardUrl(business?.cover_image)
  }
  return ''
}

