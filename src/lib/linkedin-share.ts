import { getPublicSiteUrl } from '@/lib/public-site-url'

/**
 * Build article URL for LinkedIn post body (requires NEXT_PUBLIC_SITE_URL in production).
 */
export function buildArticlePublicUrl(slug: string): string | null {
  const base = getPublicSiteUrl()
  const s = (slug || '').trim()
  if (!base || !s) return null
  return `${base}/articles/${encodeURI(s)}`
}

export function buildLinkedInPostText(params: {
  title: string
  excerpt?: string | null
  url?: string | null
}): string {
  const title = (params.title || '').trim()
  const excerpt = (params.excerpt || '').trim()
  const url = (params.url || '').trim()
  const parts: string[] = []
  if (title) parts.push(title)
  if (excerpt) parts.push(excerpt)
  if (url) parts.push(url)
  const body = parts.join('\n\n')
  return body.length > 3000 ? `${body.slice(0, 2997)}...` : body
}
