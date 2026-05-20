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
      console.log('[DEBUG] Loading article for slug/id:', slug)
      // Try to get by slug first
      let data: any
      try {
        const results = await newsApi.articles.getBySlug(slug) as any
        const articles = Array.isArray(results) ? results : (results?.results || [])
        data = articles?.[0] || null
        if (data) console.log('[DEBUG] Found article by slug:', data.title)
      } catch {
        console.log('[DEBUG] Slug lookup failed, trying ID lookup')
        data = await newsApi.articles.get(slug)
      }
      
      if (data && data.id) {
        console.log('[DEBUG] Fetching full article detail for ID:', data.id)
        // Fetch full detail by ID to ensure we have content and all fields
        const fullArticle: any = await newsApi.articles.get(data.id)
        console.log('[DEBUG] Full article loaded, content length:', fullArticle.content?.length || 0)
        setArticle(fullArticle)
      } else if (data) {
        console.log('[DEBUG] Using article data from initial lookup, content length:', (data as any).content?.length || 0)
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
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-pulse text-text-muted">Loading article...</div>
      </div>
    )
  }

  if (!profile || !article) return null

  return (
    <DashboardLayout profile={profile}>
      <div className="flex-1 min-h-0 flex flex-col">
        <EnhancedArticleEditor
          article={article}
          onSave={(saved) => {
            if (
              saved &&
              typeof saved === 'object' &&
              saved.slug &&
              typeof saved.slug === 'string' &&
              saved.slug !== slug
            ) {
              router.replace(`/admin/articles/${encodeURIComponent(saved.slug)}`)
              return
            }
            router.push('/admin/articles')
          }}
          onCancel={() => router.push('/admin/articles')}
          inModal={true}
          chrome="dashboard"
        />
      </div>
    </DashboardLayout>
  )
}
