'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'

import { buildArticleWhatsAppMessage } from '@/lib/article-share'
import { getPublicSiteUrl } from '@/lib/public-site-url'
import ArticleShareDialog from '@/components/share/ArticleShareDialog'

interface ShareButtonsProps {
  title: string
  url: string
  /** Optional; when set (e.g. from site_canonical_url SiteSetting), used for SSR fallback */
  siteOrigin?: string
  excerpt?: string | null
  subtitle?: string | null
  seoDescription?: string | null
  shareImageUrl?: string
  siteName?: string
  articleSlug?: string
}

export default function ShareButtons({
  title,
  url,
  siteOrigin,
  excerpt,
  subtitle,
  seoDescription,
  shareImageUrl,
  siteName = 'Riverside Herald',
  articleSlug,
}: ShareButtonsProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const configuredOrigin = (siteOrigin || getPublicSiteUrl()).replace(/\/$/, '')

  const fullUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${url}`
      : configuredOrigin
        ? `${configuredOrigin}${url}`
        : url.startsWith('http')
          ? url
          : url

  const initialMessage = buildArticleWhatsAppMessage({
    title,
    excerpt,
    subtitle,
    seo_description: seoDescription,
    pageUrl: fullUrl,
    siteName,
  })

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        aria-label="Share article"
      >
        <Share2 className="w-6 h-6" />
      </button>
      <ArticleShareDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={title}
        initialMessage={initialMessage}
        fullUrl={fullUrl}
        shareImageUrl={shareImageUrl}
        imageFilename={`${articleSlug || 'article'}.jpg`}
      />
    </div>
  )
}
