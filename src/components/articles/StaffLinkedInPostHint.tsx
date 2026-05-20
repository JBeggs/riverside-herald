'use client'

import Link from 'next/link'
import { Linkedin } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface StaffLinkedInPostHintProps {
  articleSlug: string
}

/**
 * Shown on public article pages for staff. The floating ShareButtons only share a URL;
 * full text + Company Page posting lives in Admin → Publish → Post to LinkedIn.
 */
export default function StaffLinkedInPostHint({ articleSlug }: StaffLinkedInPostHintProps) {
  const { profile, isCompanyOwner, loading } = useAuth()

  if (loading || !profile) return null

  const canPost =
    profile.role === 'admin' ||
    profile.role === 'editor' ||
    profile.role === 'business_owner' ||
    isCompanyOwner

  if (!canPost || !articleSlug?.trim()) return null

  const mustCompanyPage =
    profile.role === 'admin' ||
    profile.role === 'business_owner' ||
    isCompanyOwner

  const adminPublishHref = `/admin/articles/${encodeURIComponent(articleSlug)}?step=publish`

  return (
    <div className="mb-8 rounded-lg border border-[#0A66C2]/30 bg-[#0A66C2]/5 p-4">
      <div className="flex items-start gap-3">
        <Linkedin className="w-5 h-5 text-[#0A66C2] flex-shrink-0 mt-0.5" aria-hidden />
        <div className="text-sm text-text space-y-2">
          <p className="font-medium text-text">
            Staff: post to LinkedIn with full article text
          </p>
          <p className="text-text-muted">
            The blue <strong>Share</strong> button (bottom-right) only opens Facebook / Twitter /
            LinkedIn <em>link</em> sharing — not the 3 Pillars Company Page and not your full draft.
          </p>
          <p className="text-text-muted">
            {mustCompanyPage
              ? 'As admin or owner, use Publish in the article editor — posts go to the 3 Pillars Company Page.'
              : 'Use Publish in the article editor to post to your personal LinkedIn profile.'}
          </p>
          <Link
            href={adminPublishHref}
            className="inline-flex items-center gap-2 font-medium text-[#0A66C2] hover:underline"
          >
            Open Admin → Publish → Post to LinkedIn
          </Link>
        </div>
      </div>
    </div>
  )
}
