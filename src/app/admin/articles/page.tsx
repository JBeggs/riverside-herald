'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { useConfirm } from '@/contexts/ConfirmDialogContext'
import { getApiErrorMessage, newsApi } from '@/lib/api'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ArticlesList from '@/components/dashboard/ArticlesList'
import Link from 'next/link'
import { Search, Filter, Building2 } from 'lucide-react'

// Custom Plus icon
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

function ArticlesPageContent() {
  const { user, profile, loading: authLoading } = useAuth()
  const { showError } = useToast()
  const { confirm } = useConfirm()
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
      showError(getApiErrorMessage(error, 'Failed to load articles'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (articleId: string) => {
    const ok = await confirm({
      message: 'Are you sure you want to delete this article?',
      confirmLabel: 'Delete',
      variant: 'danger'
    })
    if (!ok) return

    try {
      await newsApi.articles.delete(articleId)
      await loadArticles()
    } catch (error: any) {
      console.error('Error deleting article:', error)
      showError(getApiErrorMessage(error, 'Failed to delete article'))
    }
  }

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center font-body">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    )
  }

  if (!['admin', 'editor', 'author', 'business_owner'].includes(profile.role)) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center font-body px-4">
        <div className="text-center">
          <h1 className="text-2xl font-playfair font-semibold text-text mb-4">Access Denied</h1>
          <p className="text-text-muted">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="space-y-6 font-body">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-playfair font-semibold text-text">
              {profile?.role === 'business_owner' ? 'My Articles' :
               profile?.role === 'author' ? 'My Articles' :
               profile?.role === 'editor' ? 'All Articles' :
               profile?.role === 'admin' ? 'Article Management' :
               'Articles'}
            </h1>
            <p className="text-sm sm:text-base text-text-muted mt-1">
              {profile?.role === 'business_owner' ? 'Create and manage articles to promote your business' :
               profile?.role === 'author' ? 'Write and manage your published articles' :
               profile?.role === 'editor' ? 'Review, edit, and moderate platform content' :
               profile?.role === 'admin' ? 'Complete article management and moderation' :
               'Manage your articles and content'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
            {profile?.role === 'business_owner' ? (
              <Link href="/businesses/create" className="btn btn-secondary flex items-center justify-center gap-2 min-h-[44px]">
                <Building2 className="w-5 h-5" />
                <span>Create Business</span>
              </Link>
            ) : null}
            <Link href="/admin/articles/add" className="btn btn-primary flex items-center justify-center gap-2 min-h-[44px]">
              <Plus className="w-5 h-5" />
              <span>{profile?.role === 'business_owner' ? 'Write Article' : 'New Article'}</span>
            </Link>
          </div>
        </div>

        {profile?.role === 'business_owner' ? (
          <div className="rounded-lg border border-border-default bg-[rgb(var(--color-surface-raised)/0.6)] p-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <h3 className="font-medium text-text mb-2">Promote Your Business with Articles</h3>
                <p className="text-sm text-text-muted mb-3">
                  Use articles to showcase your expertise, announce special offers, share customer stories, and connect with your community.
                </p>
                <p className="text-sm text-text-muted">
                  <strong className="text-text">Ideas for business articles:</strong> Service spotlights, behind-the-scenes stories, customer testimonials, seasonal promotions, community involvement
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="bg-surface border border-border-default rounded-lg shadow-card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              <input
                type="search"
                placeholder={
                  profile?.role === 'business_owner' ? 'Search your articles...' :
                  profile?.role === 'author' ? 'Search your articles...' :
                  'Search articles...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 min-h-[44px] border border-border-default rounded-lg bg-[rgb(var(--color-surface))] text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-5 h-5 text-text-muted shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto px-4 py-2 min-h-[44px] border border-border-default rounded-lg bg-[rgb(var(--color-surface))] text-text focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]"
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
      <div className="min-h-screen bg-bg flex items-center justify-center font-body">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    }>
      <ArticlesPageContent />
    </Suspense>
  )
}
