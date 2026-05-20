'use client'

import { useEffect, useState } from 'react'
import { X, Loader2, Linkedin, Link2 } from 'lucide-react'
import { linkedinApi, getApiErrorMessage } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

export type LinkedInShareTarget = 'profile' | 'page'

interface ShareToLinkedInDialogProps {
  isOpen: boolean
  onClose: () => void
  /** Full post body (title, excerpt, URL). Caller builds with buildLinkedInPostText. */
  initialText: string
  /** Passed separately so the API can append if missing from text */
  canonicalUrl?: string | null
}

export default function ShareToLinkedInDialog({
  isOpen,
  onClose,
  initialText,
  canonicalUrl,
}: ShareToLinkedInDialogProps) {
  const { showError, showSuccess } = useToast()
  const [text, setText] = useState(initialText)
  const [target, setTarget] = useState<LinkedInShareTarget>('profile')
  const [statusLoading, setStatusLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [orgConfigured, setOrgConfigured] = useState(false)

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
        }
      } catch {
        if (!cancelled) {
          setConnected(false)
          setOrgConfigured(false)
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
    const body = text.trim()
    if (!body) {
      showError('Post text is empty')
      return
    }
    if (target === 'page' && !orgConfigured) {
      showError(
        'Company page is not configured on the server. Set default organization ID in Django Admin (LinkedIn Global Settings).',
      )
      return
    }
    setPosting(true)
    try {
      const out = await linkedinApi.share({
        text: body,
        target,
        url: canonicalUrl || undefined,
      })
      showSuccess(out.id ? `Posted to LinkedIn (id: ${out.id})` : 'Posted to LinkedIn')
      onClose()
    } catch (e) {
      showError(getApiErrorMessage(e, 'LinkedIn share failed'))
    } finally {
      setPosting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="linkedin-share-title"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-[#0A66C2]" aria-hidden />
            <h2 id="linkedin-share-title" className="text-lg font-semibold text-gray-900">
              Post to LinkedIn
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
                Admin or editor only. After authorizing, return here and post again.
              </p>
            </div>
          ) : (
            <p className="text-sm text-green-700">LinkedIn is connected.</p>
          )}

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-700 mb-2">Destination</legend>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="li-target"
                checked={target === 'profile'}
                onChange={() => setTarget('profile')}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-800">Personal profile</span>
            </label>
            <label className={`flex items-center gap-2 ${orgConfigured ? 'cursor-pointer' : 'opacity-50'}`}>
              <input
                type="radio"
                name="li-target"
                checked={target === 'page'}
                onChange={() => setTarget('page')}
                disabled={!orgConfigured}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-800">Company page</span>
            </label>
            {!orgConfigured ? (
              <p className="text-xs text-gray-500 pl-6">
                Server has no LinkedIn organization ID. Configure <code className="bg-gray-100 px-1 rounded">default_organization_id</code> in Admin.
              </p>
            ) : null}
          </fieldset>

          <div>
            <label htmlFor="linkedin-post-text" className="block text-sm font-medium text-gray-700 mb-1">
              Post text
            </label>
            <textarea
              id="linkedin-post-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum 3,000 characters on LinkedIn.</p>
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
            disabled={posting || !text.trim() || !connected}
            onClick={() => void handleShare()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0A66C2] rounded-lg hover:bg-[#095195] disabled:opacity-50"
          >
            {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Linkedin className="w-4 h-4" />}
            Post
          </button>
        </div>
      </div>
    </div>
  )
}
