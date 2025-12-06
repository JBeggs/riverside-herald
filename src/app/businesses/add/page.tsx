'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { BusinessEditModal } from '@/components/businesses/BusinessEditModal'

export default function AddBusinessPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            You must be logged in to create a business listing.
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

  // Use BusinessEditModal in create mode
  // We'll pass a special ID that indicates creation mode
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-wide">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Business</h1>
            <p className="text-gray-600">
              Create a new business listing for your company. Fill in the details below to get started.
            </p>
          </div>
          
          <BusinessEditModal
            businessId="new"
            onClose={handleCancel}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  )
}

