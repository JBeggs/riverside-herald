'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ArticleEditor from '@/components/dashboard/ArticleEditor'

export default function AddArticlePage() {
  const router = useRouter()
  const { profile, loading } = useAuth()

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    )
  }

  const handleSave = () => {
    router.push('/admin/articles')
  }

  const handleClose = () => {
    router.push('/admin/articles')
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="max-w-5xl mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create New Article</h1>
          <p className="text-gray-600 mt-1">Write and publish a new article to the platform</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <ArticleEditor
            article={{ id: 'new' }}
            onSave={handleSave}
            onClose={handleClose}
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
