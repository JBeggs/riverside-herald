'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import BusinessCreationWizard from '@/components/businesses/BusinessCreationWizard'

export default function CreateBusinessPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/businesses/create')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const canCreateBusiness = Boolean(
    profile?.is_verified ||
      profile?.role === 'admin' ||
      profile?.role === 'editor',
  )

  if (!canCreateBusiness) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Verification required</h1>
          <p className="text-gray-600 mb-6">
            Your account must be verified by an administrator before you can add a business listing.
            You can still write and edit draft articles while you wait.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition-opacity"
            >
              Back to dashboard
            </Link>
            <Link
              href="/admin/articles/add"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Write an article
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleComplete = (business: any) => {
    router.push(`/businesses/${business.slug}`)
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessCreationWizard
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  )
}
