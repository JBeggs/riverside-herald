import {
  ARTICLE_IMAGE_PLACEHOLDER,
  getArticleCardImageUrl,
} from '@/lib/image-utils'
import { absoluteProxyMediaUrl } from '@/lib/media-proxy'
import { getPublicSiteUrl } from '@/lib/public-site-url'

type ArticleShareInput = {
  title: string
  excerpt?: string | null
  subtitle?: string | null
  seo_description?: string | null
  slug?: string
  social_image?: { file_url?: string | null; thumbnail_url?: string | null } | null
  featured_media?: { file_url?: string | null; thumbnail_url?: string | null } | null
}

export function buildArticleShareImageUrl(
  article: ArticleShareInput,
  siteOrigin?: string | null,
): string {
  const cardUrl = getArticleCardImageUrl(article)
  if (cardUrl === ARTICLE_IMAGE_PLACEHOLDER) {
    const site = (siteOrigin || getPublicSiteUrl() || '').replace(/\/$/, '')
    return site ? `${site}${ARTICLE_IMAGE_PLACEHOLDER}` : ARTICLE_IMAGE_PLACEHOLDER
  }
  return absoluteProxyMediaUrl(cardUrl, siteOrigin)
}

export function buildArticleWhatsAppMessage(input: {
  title: string
  excerpt?: string | null
  subtitle?: string | null
  seo_description?: string | null
  pageUrl: string
  siteName?: string
}): string {
  const { title, pageUrl, siteName = 'Riverside Herald' } = input
  const blurb = (input.excerpt || input.seo_description || input.subtitle || '')
    .replace(/\s+/g, ' ')
    .trim()

  return [
    title,
    blurb,
    pageUrl,
    siteName ? `Read on ${siteName}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')
}
