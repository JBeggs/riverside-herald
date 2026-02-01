'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { newsApi } from '@/lib/api'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ArticlesList from '@/components/dashboard/ArticlesList'
import Link from 'next/link'
import { Search, Filter } from 'lucide-react'

// Custom Plus icon
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

function ArticlesPageContent() {
  const { user, profile, loading: authLoading } = useAuth()
  const { showError } = useToast()
  const router = useRouter()

  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Redirect if not authorized
  useEffect(() => {
    if (!authLoading && (!user || !profile || !['admin', 'editor', 'author', 'business_owner'].includes(profile.role))) {
      router.push('/dashboard')
    }
  }, [user, profile, authLoading, router])

  // Load articles
  useEffect(() => {
    if (!profile) return
    loadArticles()
  }, [profile, statusFilter, searchQuery])

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
      showError(error.message || 'Failed to load articles')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return
    }

    try {
      await newsApi.articles.delete(articleId)
      await loadArticles()
    } catch (error: any) {
      console.error('Error deleting article:', error)
      showError(error.message || 'Failed to delete article')
    }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
            <p className="text-gray-600 mt-1">Manage your articles and content</p>
          </div>
          <Link
            href="/admin/articles/add"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Article</span>
          </Link>
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
          onEdit={(article) => router.push(`/admin/articles/${article.slug || article.id}`)}
          onDelete={handleDelete}
          profile={profile}
        />
      </div>
    </DashboardLayout>
  )
}

export default function ArticlesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    }>
      <ArticlesPageContent />
    </Suspense>
  )
}
