'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import BusinessCreationWizard from '@/components/businesses/BusinessCreationWizard'

export default function CreateBusinessPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

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

  const handleComplete = (business: any) => {
    // After business creation, redirect to business page or dashboard
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