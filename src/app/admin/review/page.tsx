'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Loader2 } from 'lucide-react'

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)
import Link from 'next/link'

export default function AdminReviewPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && (!user || !profile || !['admin', 'editor'].includes(profile.role))) {
      router.push('/dashboard')
    }
  }, [user, profile, authLoading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!user || !profile || !['admin', 'editor'].includes(profile.role)) {
    return null
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldIcon className="w-8 h-8" />
            Content Review
          </h1>
          <p className="text-gray-600 mt-1">Review and approve pending content</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <ShieldIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Content Review Queue</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Review pending articles and approve drafts from the articles list.
          </p>
          <Link
            href="/admin/articles?status=pending"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Pending Articles
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}
