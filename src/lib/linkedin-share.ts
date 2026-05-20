import { getPublicSiteUrl } from '@/lib/public-site-url'
import { getArticleImageUrl } from '@/lib/image-utils'

export const LINKEDIN_POST_MAX_CHARS = 3000

/**
 * Build article URL for LinkedIn post body (requires NEXT_PUBLIC_SITE_URL in production).
 */
export function buildArticlePublicUrl(slug: string): string | null {
  const base = getPublicSiteUrl()
  const s = (slug || '').trim()
  if (!base || !s) return null
  return `${base}/articles/${encodeURI(s)}`
}

/** Convert article HTML to plain text (keeps References section when present in content). */
export function htmlToPlainText(html: string): string {
  const raw = (html || '').trim()
  if (!raw) return ''

  if (typeof document !== 'undefined') {
    const div = document.createElement('div')
    div.innerHTML = raw
    const text = (div.innerText || div.textContent || '').trim()
    return text.replace(/\n{3,}/g, '\n\n')
  }

  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Full draft for the LinkedIn share box: title, optional subtitle/excerpt, entire article body
 * (including References if in HTML), then the public article URL for link preview.
 */
export function buildLinkedInPostText(params: {
  title: string
  subtitle?: string | null
  excerpt?: string | null
  contentHtml?: string | null
  url?: string | null
}): string {
  const title = (params.title || '').trim()
  const subtitle = (params.subtitle || '').trim()
  const excerpt = (params.excerpt || '').trim()
  const url = (params.url || '').trim()
  const body = htmlToPlainText(params.contentHtml || '')

  const parts: string[] = []
  if (title) parts.push(title)
  if (subtitle && subtitle !== title) parts.push(subtitle)
  if (excerpt && excerpt !== subtitle && excerpt !== title) parts.push(excerpt)
  if (body) parts.push(body)
  if (url) parts.push(url)

  return parts.join('\n\n')
}

export function resolveLinkedInShareImageUrl(article?: {
  social_image?: { file_url?: string | null } | null
  featured_media?: { file_url?: string | null } | null
  featured_image_url?: string | null
} | null): string {
  return getArticleImageUrl({
    social_image: article?.social_image,
    featured_media: article?.featured_media?.file_url
      ? { file_url: article.featured_media.file_url }
      : article?.featured_image_url
        ? { file_url: article.featured_image_url }
        : null,
  })
}

/** Trim to LinkedIn limit when posting (editor shows full draft). */
export function trimForLinkedInPost(text: string): string {
  const t = text.trim()
  if (t.length <= LINKEDIN_POST_MAX_CHARS) return t
  return `${t.slice(0, LINKEDIN_POST_MAX_CHARS - 3)}...`
}
