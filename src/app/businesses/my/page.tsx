'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Building2, Edit3, Plus, Eye, Loader2 } from 'lucide-react'
import { newsApi } from '@/lib/api'

export default function MyBusinessPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuth()
  const [businesses, setBusinesses] = useState<any[]>([])
  const [loadingBusinesses, setLoadingBusinesses] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    } else if (!loading && profile?.role !== 'business_owner') {
      router.push('/dashboard')
    } else if (!loading && user && profile?.role === 'business_owner') {
      loadUserBusinesses()
    }
  }, [user, profile, loading, router])

  const loadUserBusinesses = async () => {
    try {
      setLoadingBusinesses(true)
      const businessesData: any = await newsApi.businesses.list()
      const businessList = Array.isArray(businessesData) ? businessesData : (businessesData?.results || [])
      // Filter to user's businesses
      const userBusinesses = businessList.filter((business: any) => 
        business.owner === profile?.user || business.owner_id === profile?.user
      )
      setBusinesses(userBusinesses)
    } catch (error) {
      console.error('Error loading businesses:', error)
      setBusinesses([])
    } finally {
      setLoadingBusinesses(false)
    }
  }

  if (loading || loadingBusinesses) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user || profile?.role !== 'business_owner') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Business Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your business listings and performance</p>
          </div>
          <Link
            href="/businesses/create"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Business</span>
          </Link>
        </div>

        {businesses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses yet</h3>
            <p className="text-gray-600 mb-6">Create your first business listing to get started</p>
            <Link
              href="/businesses/create"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Business</span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {businesses.map((business) => (
              <div key={business.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{business.name}</h3>
                    <p className="text-gray-600 mt-1">{business.description}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      {business.city && (
                        <span className="flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {business.city}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded text-xs ${business.is_verified ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {business.is_verified ? 'Verified' : 'Pending Verification'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/businesses/${business.slug}`}
                      className="flex items-center space-x-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    <Link
                      href={`/businesses/${business.slug}/edit`}
                      className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}