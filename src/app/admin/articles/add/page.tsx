'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import EnhancedArticleEditor from '@/components/articles/EnhancedArticleEditor'

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

  const handleCancel = () => {
    router.push('/admin/articles')
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="min-h-full">
        <EnhancedArticleEditor
          article={{ id: 'new', title: '', content: '', author_id: profile.user, status: 'draft' }}
          onSave={handleSave}
          onCancel={handleCancel}
          inModal={true}
        />
      </div>
    </DashboardLayout>
  )
}
