'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { newsApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import EnhancedArticleEditor from '@/components/articles/EnhancedArticleEditor'
import { X, ArrowLeft } from 'lucide-react'

interface ArticleEditorProps {
  article?: any | null
  onClose: () => void
  onSave?: (newArticle?: any) => void
}

export default function ArticleEditor({ article, onClose, onSave }: ArticleEditorProps) {
  const { profile } = useAuth()
  const router = useRouter()
  const [articleData, setArticleData] = useState<any>(null)
  const [loading, setLoading] = useState(!!article && article?.id !== 'new')

  // Load article if editing
  useEffect(() => {
    if (article?.id && article.id !== 'new') {
      loadArticle()
    } else {
      // Create a new article template (when article is null or id is 'new')
      setArticleData({
        id: 'new',
        title: '',
        subtitle: '',
        content: '',
        excerpt: '',
        featured_image_url: '',
        author_id: profile?.user || '',
        status: 'draft',
        content_type: 'article',
        is_premium: false,
        is_breaking_news: false,
        is_trending: false,
        seo_title: '',
        seo_description: '',
        published_at: '',
        scheduled_for: '',
        location_name: '',
        read_time_minutes: null,
        category_id: ''
      })
      setLoading(false)
    }
  }, [article, profile])

  const loadArticle = async () => {
    if (!article?.id) return
    setLoading(true)
    try {
      const data = await newsApi.articles.get(article.id)
      setArticleData(data)
    } catch (error: any) {
      console.error('Error loading article:', error)
      alert(error.message || 'Failed to load article')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  if (loading || !articleData) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    )
  }

  // For new articles, use EnhancedArticleEditor with a template article
  // EnhancedArticleEditor will handle creation vs update

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {articleData.id === 'new' ? 'Create New Article' : 'Edit Article'}
          </h1>
          <p className="text-gray-600 mt-1">
            {articleData.id === 'new' ? 'Write and publish a new article' : 'Update your article content and settings'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to List</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <EnhancedArticleEditor article={articleData} onSave={onSave} onCancel={onClose} inModal={true} />
      </div>
    </div>
  )
}

