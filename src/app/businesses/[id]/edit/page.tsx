'use client'

import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { BusinessEditModal } from '@/components/businesses/BusinessEditModal'

export default function EditBusinessPage() {
  const router = useRouter()
  const params = useParams()
  const businessId = params.id as string
  const { user, profile } = useAuth()

  // Check if user is authenticated and is admin or business owner
  if (!user || !profile || !['admin', 'business_owner'].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You do not have permission to edit this business listing.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const handleSuccess = () => {
    router.push('/profile')
  }

  const handleCancel = () => {
    router.push('/profile')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-wide">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Business</h1>
            <p className="text-gray-600">
              Update your business listing details below.
            </p>
          </div>
          
          <BusinessEditModal
            businessId={businessId}
            onClose={handleCancel}
            onSuccess={handleSuccess}
            isFullPage={true}
          />
        </div>
      </div>
    </div>
  )
}
