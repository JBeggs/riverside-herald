'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '@/contexts/AuthContext'
import { newsApi } from '@/lib/api'
import EnhancedArticleEditor from '@/components/articles/EnhancedArticleEditor'
import { X } from 'lucide-react'

interface ArticleEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (newArticle?: any) => void
  articleId?: string | null
}

export default function ArticleEditorModal({ isOpen, onClose, onSave, articleId }: ArticleEditorModalProps) {
  const { profile } = useAuth()
  const [articleData, setArticleData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Close modal on escape key and manage body styles
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Store original values
    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    // Add padding to prevent layout shift from scrollbar
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [isOpen, onClose])

  // Load article data when modal opens
  useEffect(() => {
    if (!isOpen) {
      setArticleData(null)
      setLoading(false)
      return
    }

    const articleIdStr = articleId ? String(articleId) : null
    
    if (articleIdStr && articleIdStr !== 'new') {
      loadArticle(articleIdStr)
    } else {
      // Create a new article template
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
  }, [isOpen, articleId, profile])

  const loadArticle = async (id: string) => {
    setLoading(true)
    try {
      const data = await newsApi.articles.get(id)
      // Normalize article data - ensure author_id is set correctly
      // The API might return author as an object {id: "...", ...} or as a string ID
      const authorId = data.author_id || (typeof data.author === 'object' ? data.author?.id : data.author) || ''
      
      const normalizedData = {
        ...data,
        author_id: String(authorId), // Ensure it's a string for comparison
        // Ensure all required fields are present
        title: data.title || '',
        content: data.content || '',
        status: data.status || 'draft',
        content_type: data.content_type || 'article',
        subtitle: data.subtitle || '',
        excerpt: data.excerpt || '',
        featured_image_url: data.featured_media?.file_url || data.featured_image_url || '',
        featured_media_id: data.featured_media?.id || data.featured_media_id || '',
        category_id: data.category?.id || data.category_id || '',
        is_premium: data.is_premium || false,
        is_breaking_news: data.is_breaking_news || false,
        is_trending: data.is_trending || false,
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        published_at: data.published_at || '',
        scheduled_for: data.scheduled_for || '',
        location_name: data.location_name || '',
        read_time_minutes: data.read_time_minutes || null,
      }
      console.log('Loaded article data:', normalizedData)
      setArticleData(normalizedData)
    } catch (error: any) {
      console.error('Error loading article:', error)
      // Don't close modal on error - show error state instead
      setArticleData(null)
      setLoading(false)
      // Show error message to user
      alert(`Failed to load article: ${error?.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleSave = (newArticle?: any) => {
    if (onSave) {
      onSave(newArticle)
    }
    // Don't close modal automatically - let parent decide
  }

  if (!isOpen) return null

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] overflow-y-auto"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0
      }}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0
        }}
      />
      
      {/* Modal */}
      <div 
        className="flex min-h-full items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="relative w-full max-w-6xl transform transition-all bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {articleData?.id === 'new' ? 'Create New Article' : 'Edit Article'}
              </h2>
              <p className="text-gray-600 mt-1 text-sm">
                {articleData?.id === 'new' ? 'Write and publish a new article' : 'Update your article content and settings'}
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center py-12 flex-1">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading editor...</p>
                </div>
              </div>
            ) : articleData ? (
              <EnhancedArticleEditor article={articleData} onSave={handleSave} onCancel={onClose} inModal={true} />
            ) : (
              <div className="flex items-center justify-center py-12 flex-1">
                <div className="text-center">
                  <p className="text-gray-600">Failed to load article data</p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Render as portal to ensure it's above everything
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  
  return null
}

