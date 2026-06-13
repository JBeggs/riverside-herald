/**
 * Same-origin proxy for Django /media/* assets (share sheet + edge cache).
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://3pillars.pythonanywhere.com/api'

export function getBackendMediaHostname(): string {
  try {
    return new URL(API_BASE_URL).hostname
  } catch {
    return '3pillars.pythonanywhere.com'
  }
}

export function getBackendOrigin(): string {
  try {
    const url = new URL(API_BASE_URL)
    return `${url.protocol}//${url.host}`
  } catch {
    return 'https://3pillars.pythonanywhere.com'
  }
}

export function getPublicSiteOrigin(): string | null {
  let raw = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '')
  if (!raw && process.env.VERCEL_URL) {
    raw = process.env.VERCEL_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
  if (!raw) return null
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`
  return raw.replace(/\/$/, '')
}

/** Prefer the current request host (custom domain) over build-time env vars for OG/share URLs. */
export async function getRequestSiteOrigin(): Promise<string | null> {
  try {
    const { headers } = await import('next/headers')
    const h = await headers()
    const host = (h.get('x-forwarded-host') || h.get('host') || '')
      .split(',')[0]
      ?.trim()
    if (host && !host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
      return `https://${host}`
    }
  } catch {
    // Static or edge contexts where headers are unavailable.
  }
  return getPublicSiteOrigin()
}

/** Validate upstream media URL for proxy routes (open-redirect safe). */
export function parseAllowedMediaSrc(src: string | null): URL | null {
  if (!src || src.length > 2048) return null
  let upstreamUrl: URL
  try {
    upstreamUrl = new URL(src)
  } catch {
    return null
  }
  if (upstreamUrl.hostname !== getBackendMediaHostname()) return null
  if (!upstreamUrl.pathname.startsWith('/media/')) return null
  return upstreamUrl
}

export function isProxiableMediaUrl(url: string): boolean {
  if (!url || url.startsWith('data:')) return false
  if (url.startsWith('/images/') || url.startsWith('/image-')) return false
  try {
    const absolute = url.startsWith('http') ? url : `${getBackendOrigin()}${url.startsWith('/') ? url : `/${url}`}`
    const parsed = new URL(absolute)
    return parsed.hostname === getBackendMediaHostname() && parsed.pathname.startsWith('/media/')
  } catch {
    return false
  }
}

/** Browser-facing URL: same-origin /api/media when src is backend media. */
export function proxyMediaUrl(absoluteUrl: string): string {
  if (!absoluteUrl || !isProxiableMediaUrl(absoluteUrl)) return absoluteUrl
  let mediaUrl = absoluteUrl
  if (!mediaUrl.startsWith('http')) {
    mediaUrl = `${getBackendOrigin()}${mediaUrl.startsWith('/') ? mediaUrl : `/${mediaUrl}`}`
  }
  return `/api/media?src=${encodeURIComponent(mediaUrl)}`
}

/** Absolute proxied URL for share / metadata. */
export function absoluteProxyMediaUrl(absoluteUrl: string, siteOrigin?: string | null): string {
  const relative = proxyMediaUrl(absoluteUrl)
  if (!relative.startsWith('/api/media')) return relative
  const site = (siteOrigin || getPublicSiteOrigin() || '').replace(/\/$/, '')
  if (!site) return absoluteUrl
  return `${site}${relative}`
}

export const MEDIA_PROXY_CACHE_PAGE =
  'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400'

export function mediaProxyUserAgent(): string {
  const slug = (process.env.NEXT_PUBLIC_COMPANY_SLUG || 'riverside-herald').replace(
    /[^a-zA-Z0-9._-]+/g,
    '-',
  )
  return (
    process.env.MEDIA_PROXY_USER_AGENT?.trim() ||
    `${slug}-MediaProxy/1.0`
  )
}
