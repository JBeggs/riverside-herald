'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { newsApi } from '@/lib/api'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import EnhancedArticleEditor from '@/components/articles/EnhancedArticleEditor'
import { useToast } from '@/contexts/ToastContext'

export default function ArticleEditPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug as string
  const { profile, loading: authLoading } = useAuth()
  const { showError } = useToast()
  
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (slug && profile) {
      loadArticle()
    }
  }, [slug, profile])

  const loadArticle = async () => {
    setLoading(true)
    try {
      // Try to get by slug first, then by ID if that fails
      let data: any
      try {
        data = await newsApi.articles.getBySlug(slug)
      } catch (e) {
        data = await newsApi.articles.get(slug)
      }
      
      if (data) {
        setArticle(data)
      } else {
        showError('Article not found')
        router.push('/admin/articles')
      }
    } catch (error: any) {
      console.error('Error loading article:', error)
      showError('Failed to load article')
      router.push('/admin/articles')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading article...</div>
      </div>
    )
  }

  if (!profile || !article) return null

  return (
    <DashboardLayout profile={profile}>
      <div className="max-w-5xl mx-auto py-6">
        <EnhancedArticleEditor
          article={article}
          onSave={() => router.push('/admin/articles')}
          onCancel={() => router.push('/admin/articles')}
          inModal={true}
        />
      </div>
    </DashboardLayout>
  )
}
