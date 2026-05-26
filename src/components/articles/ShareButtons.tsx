'use client'

import { useState } from 'react'
import { Share2, Facebook, Twitter, Linkedin, Link2, Mail, Check } from 'lucide-react'

import { buildArticleWhatsAppMessage } from '@/lib/article-share'
import { getPublicSiteUrl } from '@/lib/public-site-url'
import { openWhatsAppWithText, shareTextWithOptionalImage } from '@/lib/share-with-image'

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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
    </svg>
  )
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
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sharingWhatsApp, setSharingWhatsApp] = useState(false)

  const configuredOrigin = (siteOrigin || getPublicSiteUrl()).replace(/\/$/, '')

  const fullUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${url}`
      : configuredOrigin
        ? `${configuredOrigin}${url}`
        : url.startsWith('http')
          ? url
          : url

  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(fullUrl)

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=Check out this article: ${fullUrl}`,
  }

  const copyToClipboard = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const openShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  const shareWhatsApp = async () => {
    if (sharingWhatsApp) return
    setSharingWhatsApp(true)
    const msg = buildArticleWhatsAppMessage({
      title,
      excerpt,
      subtitle,
      seo_description: seoDescription,
      pageUrl: fullUrl,
      siteName,
    })

    try {
      if (shareImageUrl) {
        const shared = await shareTextWithOptionalImage(
          msg,
          shareImageUrl,
          `${articleSlug || 'article'}.jpg`,
        )
        if (shared) {
          setShowShareMenu(false)
          return
        }
      }
    } finally {
      setSharingWhatsApp(false)
    }

    openWhatsAppWithText(msg)
    setShowShareMenu(false)
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {showShareMenu && (
        <>
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setShowShareMenu(false)}
          />

          <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[200px]">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Share article</h3>
            <p className="text-xs text-gray-500 mb-3">
              WhatsApp includes the headline and hero image when your device supports it. Other
              options share the page link only.
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={shareWhatsApp}
                disabled={sharingWhatsApp}
                aria-busy={sharingWhatsApp}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-green-50 rounded-lg transition-colors disabled:opacity-70"
              >
                <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center mr-3">
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">
                  {sharingWhatsApp ? 'Preparing…' : 'WhatsApp'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => openShare('facebook')}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-blue-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <Facebook className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">Facebook</span>
              </button>

              <button
                type="button"
                onClick={() => openShare('twitter')}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-blue-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center mr-3">
                  <Twitter className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">Twitter</span>
              </button>

              <button
                type="button"
                onClick={() => openShare('linkedin')}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-blue-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center mr-3">
                  <Linkedin className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">LinkedIn (link only)</span>
              </button>

              <button
                type="button"
                onClick={() => openShare('email')}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-700">Email</span>
              </button>

              <button
                type="button"
                onClick={copyToClipboard}
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mr-3">
                  {copied ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Link2 className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-gray-700">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      <button
        type="button"
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        aria-label="Share article"
      >
        <Share2 className="w-6 h-6" />
      </button>
    </div>
  )
}
