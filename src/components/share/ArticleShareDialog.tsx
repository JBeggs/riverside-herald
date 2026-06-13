'use client'

import { useEffect, useState } from 'react'
import { Check, Link2, Facebook, Linkedin, Mail, Twitter } from 'lucide-react'
import { openWhatsAppWithText, shareTextWithOptionalImage } from '@/lib/share-with-image'

interface ArticleShareDialogProps {
  open: boolean
  onClose: () => void
  title: string
  initialMessage: string
  fullUrl: string
  shareImageUrl?: string
  imageFilename?: string
}

function openPopup(url: string): void {
  window.open(url, '_blank', 'width=600,height=500,noopener,noreferrer')
}

export default function ArticleShareDialog({
  open,
  onClose,
  title,
  initialMessage,
  fullUrl,
  shareImageUrl,
  imageFilename = 'article.jpg',
}: ArticleShareDialogProps) {
  const [messageText, setMessageText] = useState(initialMessage)
  const [sharingWhatsApp, setSharingWhatsApp] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    if (!open) return
    setMessageText(initialMessage)
    setSharingWhatsApp(false)
    setCopiedLink(false)
  }, [open, initialMessage])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !sharingWhatsApp) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, sharingWhatsApp])

  useEffect(() => {
    if (!open) return
    const body = document.body
    const scrollY = window.scrollY
    const prevOverflow = body.style.overflow
    const prevPosition = body.style.position
    const prevTop = body.style.top
    const prevLeft = body.style.left
    const prevRight = body.style.right
    const prevWidth = body.style.width

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'

    return () => {
      body.style.overflow = prevOverflow
      body.style.position = prevPosition
      body.style.top = prevTop
      body.style.left = prevLeft
      body.style.right = prevRight
      body.style.width = prevWidth
      window.scrollTo(0, scrollY)
    }
  }, [open])

  if (!open) return null

  const message = messageText.trim()

  const handleWhatsAppShare = async () => {
    if (!message || sharingWhatsApp) return
    setSharingWhatsApp(true)
    try {
      if (shareImageUrl) {
        const shared = await shareTextWithOptionalImage(message, shareImageUrl, imageFilename)
        if (shared) {
          onClose()
          return
        }
      }
    } finally {
      setSharingWhatsApp(false)
    }
    openWhatsAppWithText(message)
    onClose()
  }

  const handleTwitterShare = () => {
    if (!message) return
    openPopup(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`)
  }

  const handleEmailShare = () => {
    if (!message) return
    window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`
  }

  const handleFacebookShare = () => {
    openPopup(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`)
  }

  const handleLinkedInShare = () => {
    openPopup(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`)
  }

  const handleCopyLink = async () => {
    if (!navigator.clipboard) return
    await navigator.clipboard.writeText(fullUrl)
    setCopiedLink(true)
    window.setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="article-share-dialog-title"
      onClick={(event) => {
        if (event.target === event.currentTarget && !sharingWhatsApp) onClose()
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl border border-border-default bg-white shadow-2xl">
        <div className="p-5 sm:p-6">
          <h2 id="article-share-dialog-title" className="text-2xl font-playfair font-semibold text-text mb-2">
            Share this article
          </h2>
          <p className="text-sm text-text-muted mb-4">
            Edit your message before sharing. Facebook and LinkedIn only accept the page URL and
            use the article preview from Open Graph metadata.
          </p>

          {shareImageUrl ? (
            <div className="mb-4 rounded-xl border border-border-default bg-surface-raised p-2">
              <img
                src={shareImageUrl}
                alt={title}
                className="h-36 w-full rounded-lg object-cover"
              />
            </div>
          ) : null}

          <label htmlFor="article-share-message" className="mb-2 block text-xs font-medium uppercase tracking-wide text-text-muted">
            Message text
          </label>
          <textarea
            id="article-share-message"
            rows={8}
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            className="w-full rounded-xl border border-border-default bg-surface px-3 py-2 text-sm leading-relaxed text-text focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Write your share message"
          />

          <div className="mt-2 flex justify-between gap-2">
            <button
              type="button"
              onClick={() => setMessageText(initialMessage)}
              className="text-xs font-medium text-primary hover:underline"
              disabled={sharingWhatsApp}
            >
              Reset to default
            </button>
            <button
              type="button"
              onClick={() => void handleCopyLink()}
              className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-text"
              disabled={sharingWhatsApp}
            >
              {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              {copiedLink ? 'Copied link' : 'Copy link'}
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <button type="button" onClick={() => void handleWhatsAppShare()} className="btn btn-primary min-h-[44px]" disabled={!message || sharingWhatsApp}>
              {sharingWhatsApp ? 'Preparing…' : 'WhatsApp'}
            </button>
            <button type="button" onClick={handleTwitterShare} className="btn btn-secondary inline-flex items-center justify-center gap-2 min-h-[44px]" disabled={!message || sharingWhatsApp}>
              <Twitter className="h-4 w-4" />
              Twitter
            </button>
            <button type="button" onClick={handleEmailShare} className="btn btn-secondary inline-flex items-center justify-center gap-2 min-h-[44px]" disabled={!message || sharingWhatsApp}>
              <Mail className="h-4 w-4" />
              Email
            </button>
            <button type="button" onClick={handleFacebookShare} className="btn btn-secondary inline-flex items-center justify-center gap-2 min-h-[44px]" disabled={sharingWhatsApp}>
              <Facebook className="h-4 w-4" />
              Facebook
            </button>
            <button type="button" onClick={handleLinkedInShare} className="btn btn-secondary inline-flex items-center justify-center gap-2 min-h-[44px]" disabled={sharingWhatsApp}>
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary min-h-[44px]" disabled={sharingWhatsApp}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
