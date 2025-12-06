'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { newsApi } from '@/lib/api'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ArticlesList from '@/components/dashboard/ArticlesList'
import ArticleEditor from '@/components/dashboard/ArticleEditor'
import { Search, Filter } from 'lucide-react'

// Custom Plus icon
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

export default function ArticlesPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const { showError } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  const articleId = searchParams.get('id')

  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [showEditor, setShowEditor] = useState(false)

  // Redirect if not authorized
  useEffect(() => {
    if (!authLoading && (!user || !profile || !['admin', 'editor', 'author', 'business_owner'].includes(profile.role))) {
      router.push('/dashboard')
    }
  }, [user, profile, authLoading, router])

  // Load articles
  useEffect(() => {
    if (!profile) return
    // Don't reload if editor is open - it causes flickering
    if (showEditor) return

    loadArticles()
  }, [profile, statusFilter, searchQuery, showEditor])

  // Load specific article if editing (only if URL has articleId)
  useEffect(() => {
    if (articleId && !selectedArticle && profile && !showEditor) {
      loadArticle(articleId)
    }
  }, [articleId, profile, selectedArticle, showEditor])

  // Handle URL params for initial load (removed sessionStorage - modals handle their own state)
  useEffect(() => {
    // Only run once on mount
    if (showEditor || selectedArticle !== null) return
    
    // Only handle URL params on initial page load
    if (action === 'create') {
      setSelectedArticle({ id: 'new' })
      setShowEditor(true)
    }
  }, []) // Only run on mount - eslint-disable-line react-hooks/exhaustive-deps

  const loadArticles = async () => {
    setLoading(true)
    try {
      const params: any = {
        limit: 50,
        ordering: '-created_at'
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      if (searchQuery) {
        params.search = searchQuery
      }

      // If author or business owner, only show their articles
      if (profile && (profile.role === 'author' || (profile.role as string) === 'business_owner')) {
        params.author = profile.user
      }

      const data: any = await newsApi.articles.list(params)
      setArticles(Array.isArray(data) ? data : (data?.results || []))
    } catch (error: any) {
      console.error('Error loading articles:', error)
      alert(error.message || 'Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const loadArticle = async (id: string) => {
    try {
      setLoading(true)
      const article = await newsApi.articles.get(id)
      setSelectedArticle(article)
      setShowEditor(true)
    } catch (error: any) {
      console.error('Error loading article:', error)
      const errorMessage = error?.message || error?.details?.message || 'Failed to load article'
      showError(errorMessage)
      setShowEditor(false)
      // Don't navigate - just close editor
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    // Create a new article object with id 'new' so ArticleEditor recognizes it
    setSelectedArticle({ id: 'new' })
    setShowEditor(true)
    // NO NAVIGATION - stay on the same page
    return false
  }

  const handleEdit = (article: any) => {
    setSelectedArticle(article)
    setShowEditor(true)
    // Don't navigate - stay on the same page and open editor inline
  }

  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return
    }

    try {
      await newsApi.articles.delete(articleId)
      await loadArticles()
      if (selectedArticle?.id === articleId) {
        setSelectedArticle(null)
        setShowEditor(false)
        // Don't navigate - just close editor
      }
    } catch (error: any) {
      console.error('Error deleting article:', error)
      alert(error.message || 'Failed to delete article')
    }
  }

  const handleEditorClose = () => {
    setShowEditor(false)
    setSelectedArticle(null)
    // DON'T navigate - just close editor and reload list
    loadArticles()
  }

  const handleEditorSave = async (newArticle?: any) => {
    // If a new article was created, update selectedArticle to the new article
    if (newArticle && newArticle.id) {
      setSelectedArticle(newArticle)
      // DON'T update URL - it causes navigation
      // Just update the state to keep editor open
    }
    // Reload articles list to show the new/updated article
    await loadArticles()
    // Stay on the same page - don't close the editor
    // The editor will handle showing success message
  }

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!['admin', 'editor', 'author', 'business_owner'].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout profile={profile}>
      {showEditor ? (
        <ArticleEditor
          article={selectedArticle}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
        />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
              <p className="text-gray-600 mt-1">Manage your articles and content</p>
            </div>
            <button
              type="button"
              onClick={handleCreateNew}
              onMouseDown={(e) => e.preventDefault()} // Prevent any default behavior
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Article</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Articles List */}
          <ArticlesList
            articles={articles}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            profile={profile}
          />
        </div>
      )}
    </DashboardLayout>
  )
}

