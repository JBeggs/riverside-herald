'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, Linkedin, Link2 } from 'lucide-react'
import { linkedinApi, getApiErrorMessage } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import {
  LINKEDIN_POST_MAX_CHARS,
  trimForLinkedInPost,
} from '@/lib/linkedin-share'

export type LinkedInShareTarget = 'profile' | 'page'

interface ShareToLinkedInDialogProps {
  isOpen: boolean
  onClose: () => void
  /** Full draft (title + body + URL). Caller builds with buildLinkedInPostText. */
  initialText: string
  /** Passed separately so the API can append if missing from text */
  canonicalUrl?: string | null
  /** Hero / social image for preview (absolute URL). LinkedIn link card uses live page OG tags. */
  shareImageUrl?: string | null
  /** Site admin, business owner, or company owner — must post to Company Page */
  mustPostToCompanyPage?: boolean
  shareTitle?: string
  shareDescription?: string
  /** Absolute URL for LinkedIn link-card thumbnail */
  shareThumbnailUrl?: string
}

export default function ShareToLinkedInDialog({
  isOpen,
  onClose,
  initialText,
  canonicalUrl,
  shareImageUrl,
  mustPostToCompanyPage = false,
  shareTitle = '',
  shareDescription = '',
  shareThumbnailUrl = '',
}: ShareToLinkedInDialogProps) {
  const { showError, showSuccess } = useToast()
  const [text, setText] = useState(initialText)
  const [target, setTarget] = useState<LinkedInShareTarget>(
    mustPostToCompanyPage ? 'page' : 'profile',
  )
  const [statusLoading, setStatusLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [orgConfigured, setOrgConfigured] = useState(false)
  const [orgPostingReady, setOrgPostingReady] = useState(false)
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  const companyPageReady = orgConfigured && orgPostingReady

  const charCount = text.length
  const overLimit = charCount > LINKEDIN_POST_MAX_CHARS

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    const load = async () => {
      setStatusLoading(true)
      try {
        const s = await linkedinApi.status()
        if (!cancelled) {
          setConnected(Boolean(s.connected))
          setOrgConfigured(Boolean(s.organization_configured))
          setOrgPostingReady(Boolean(s.organization_posting_ready))
          setOrganizationId(s.organization_id ?? null)
        }
      } catch {
        if (!cancelled) {
          setConnected(false)
          setOrgConfigured(false)
          setOrgPostingReady(false)
          setOrganizationId(null)
        }
      } finally {
        if (!cancelled) setStatusLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    setText(initialText)
    setTarget(mustPostToCompanyPage ? 'page' : 'profile')
  }, [isOpen, initialText, mustPostToCompanyPage])

  const openConnect = async () => {
    try {
      const res = await linkedinApi.authUrl()
      if (res.auth_url) {
        window.open(res.auth_url, '_blank', 'noopener,noreferrer')
        showSuccess('Complete LinkedIn authorization in the new tab, then try posting again.')
      }
    } catch (e) {
      showError(getApiErrorMessage(e, 'Could not start LinkedIn connection'))
    }
  }

  const handleShare = async () => {
    const body = trimForLinkedInPost(text)
    if (!body) {
      showError('Post text is empty')
      return
    }
    const shareTarget: LinkedInShareTarget = mustPostToCompanyPage ? 'page' : 'profile'

    if (shareTarget === 'page' && !orgConfigured) {
      showError(
        'Company page is not configured. Set default_organization_id in Django Admin → LinkedIn Global Settings (numeric Company Page ID, e.g. 65685613).',
      )
      return
    }
    if (shareTarget === 'page' && !orgPostingReady) {
      showError(
        'LinkedIn token is missing w_organization_social or the organization ID is invalid. Re-connect LinkedIn after adding that permission, and confirm you are a Page admin.',
      )
      return
    }
    setPosting(true)
    try {
      const out = await linkedinApi.share({
        text: body,
        target: shareTarget,
        url: canonicalUrl || undefined,
        title: shareTitle || undefined,
        description: shareDescription || undefined,
        image_url: shareThumbnailUrl || undefined,
      })
      showSuccess(
        out.id
          ? mustPostToCompanyPage
            ? `Posted to 3 Pillars Company Page (id: ${out.id})`
            : `Posted to your LinkedIn profile (id: ${out.id})`
          : mustPostToCompanyPage
            ? 'Posted to 3 Pillars Company Page'
            : 'Posted to your LinkedIn profile',
      )
      onClose()
    } catch (e) {
      showError(getApiErrorMessage(e, 'LinkedIn share failed'))
    } finally {
      setPosting(false)
    }
  }

  const postDisabled =
    posting ||
    !text.trim() ||
    !connected ||
    (mustPostToCompanyPage && !companyPageReady)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="linkedin-share-title"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-[#0A66C2]" aria-hidden />
            <h2 id="linkedin-share-title" className="text-lg font-semibold text-gray-900">
              {mustPostToCompanyPage ? 'Post to 3 Pillars Company Page' : 'Post to LinkedIn'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {shareImageUrl ? (
            <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
              <p className="text-xs font-medium text-gray-600 px-3 py-2 border-b border-gray-100">
                Link preview image (from article hero / social image — refresh with Post Inspector after
                publish)
              </p>
              <img
                src={shareImageUrl}
                alt=""
                className="w-full max-h-48 object-cover"
              />
            </div>
          ) : null}

          {statusLoading ? (
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking LinkedIn connection…
            </p>
          ) : !connected ? (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900 space-y-2">
              <p>LinkedIn is not connected for this site yet.</p>
              <button
                type="button"
                onClick={() => void openConnect()}
                className="inline-flex items-center gap-1 text-amber-900 underline font-medium"
              >
                Connect LinkedIn
                <Link2 className="w-3.5 h-3.5" aria-hidden />
              </button>
              <p className="text-xs text-amber-800">
                After authorizing, return here and post again.
              </p>
            </div>
          ) : (
            <p className="text-sm text-green-700">LinkedIn is connected.</p>
          )}

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-1">
            <p className="text-sm font-medium text-gray-800">
              {mustPostToCompanyPage
                ? 'Posting as: 3 Pillars Company Page (required for your role)'
                : 'Posting as: your personal LinkedIn profile'}
            </p>
            {mustPostToCompanyPage && !orgConfigured ? (
              <p className="text-xs text-gray-600">
                Set <code className="bg-gray-100 px-1 rounded">default_organization_id</code> (e.g.{' '}
                <strong>65685613</strong>) in Django Admin → LinkedIn Global Settings.
              </p>
            ) : mustPostToCompanyPage && !orgPostingReady ? (
              <p className="text-xs text-amber-800">
                Page ID {organizationId ? organizationId : '65685613'} is saved but reconnect LinkedIn with{' '}
                <code className="bg-gray-100 px-1 rounded">w_organization_social</code>.
              </p>
            ) : mustPostToCompanyPage && organizationId ? (
              <p className="text-xs text-gray-600">Organization ID: {organizationId}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="linkedin-post-text" className="block text-sm font-medium text-gray-700 mb-1">
              Post text (full article draft — edit before posting)
            </label>
            <textarea
              id="linkedin-post-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={16}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className={`mt-1 text-xs ${overLimit ? 'text-amber-700 font-medium' : 'text-gray-500'}`}>
              {charCount.toLocaleString()} / {LINKEDIN_POST_MAX_CHARS.toLocaleString()} characters
              {overLimit ? ' — will be trimmed when you post' : ''}. Include the article URL at the end for
              the LinkedIn link card.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={postDisabled}
            onClick={() => void handleShare()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0A66C2] rounded-lg hover:bg-[#095195] disabled:opacity-50"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Linkedin className="w-4 h-4" />}
            {mustPostToCompanyPage ? 'Post to Company Page' : 'Post to Profile'}
          </button>
        </div>
      </div>
    </div>
  )
}
