'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Profile } from '@/lib/types'
import {
  FileText,
  Eye,
  TrendingUp,
  Edit3,
  Calendar,
} from 'lucide-react'
import {
  cmsCard,
  cmsCardPad,
  cmsPageSubtitle,
  cmsRaisedPanel,
  cmsSectionTitle,
  cmsSelect,
} from '@/lib/cms-ui-classes'

const Heart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const BarChart3 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="12" width="4" height="8" rx="1" />
    <rect x="10" y="8" width="4" height="12" rx="1" />
    <rect x="17" y="4" width="4" height="16" rx="1" />
  </svg>
)

interface AuthorDashboardProps {
  articles: any[]
  profile: Profile
  onNewArticle?: () => void
}

export default function AuthorDashboard({ articles, profile: _profile, onNewArticle: _onNewArticle }: AuthorDashboardProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views'>('recent')

  const sortedArticles = [...articles].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.likes || 0) - (a.likes || 0)
      case 'views':
        return (b.views || 0) - (a.views || 0)
      case 'recent':
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200'
      case 'draft':
        return 'bg-[rgb(var(--color-surface-raised))] text-text-muted'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
      case 'archived':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
      default:
        return 'bg-[rgb(var(--color-surface-raised))] text-text-muted'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0)
  const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0)
  const publishedCount = articles.filter((article) => article.status === 'published').length
  const draftCount = articles.filter((article) => article.status === 'draft').length

  const statCards = [
    { label: 'Total', value: articles.length, icon: FileText },
    { label: 'Published', value: publishedCount, icon: TrendingUp, accent: 'text-primary' },
    { label: 'Views', value: totalViews.toLocaleString(), icon: Eye },
    { label: 'Likes', value: totalLikes.toLocaleString(), icon: Heart },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className={cmsSectionTitle}>Content Dashboard</h2>
          <p className={cmsPageSubtitle}>Manage your articles and track performance</p>
        </div>
        <Link href="/admin/articles/add" className="btn btn-primary w-full sm:w-auto flex items-center justify-center gap-2 min-h-[44px]">
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className={cmsCardPad}>
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-text-muted">{label}</p>
                <p className={`text-xl sm:text-3xl font-bold truncate ${accent || 'text-text'}`}>{value}</p>
              </div>
              <div className="p-2 sm:p-3 bg-primary/10 rounded-full shrink-0">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`${cmsRaisedPanel} p-4 sm:p-6`}>
        <h3 className="text-lg font-medium text-text mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Link
            href="/admin/articles/add"
            className={`${cmsCard} flex items-center gap-3 p-4 hover:bg-[rgb(var(--color-surface-raised)/0.5)] transition-colors w-full text-left min-h-[44px]`}
          >
            <Plus className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-text">Create New</p>
              <p className="text-xs text-text-muted">Start writing</p>
            </div>
          </Link>

          <Link
            href="/admin/articles"
            className={`${cmsCard} flex items-center gap-3 p-4 hover:bg-[rgb(var(--color-surface-raised)/0.5)] transition-colors w-full text-left min-h-[44px]`}
          >
            <Edit3 className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-text">My Articles</p>
              <p className="text-xs text-text-muted">{draftCount} drafts</p>
            </div>
          </Link>

          <div className={`${cmsCard} flex items-center gap-3 p-4 opacity-50 cursor-not-allowed min-h-[44px]`}>
            <BarChart3 className="w-5 h-5 text-text-muted shrink-0" />
            <div className="min-w-0">
              <p className="font-medium text-text">Analytics</p>
              <p className="text-xs text-text-muted">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h3 className="text-lg font-medium text-text">Recent Articles</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="author-sort" className="text-sm text-text-muted whitespace-nowrap">
              Sort by:
            </label>
            <select
              id="author-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular' | 'views')}
              className={`${cmsSelect} w-full sm:w-auto`}
            >
              <option value="recent">Most Recent</option>
              <option value="popular">Most Liked</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        {sortedArticles.length === 0 ? (
          <div className={`${cmsCardPad} text-center`}>
            <FileText className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-text mb-2">No articles yet</h3>
            <p className="text-text-muted mb-6">Start by creating your first article</p>
            <Link href="/admin/articles/add" className="btn btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Create Article</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedArticles.map((article) => (
              <div key={article.id} className={`${cmsCardPad} hover:shadow-md transition-shadow`}>
                <div className="flex flex-col gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Link
                        href={article.status === 'published' ? `/articles/${article.slug}` : `/admin/articles/${article.slug || article.id}`}
                        className="text-lg font-semibold text-text hover:text-primary truncate max-w-full"
                      >
                        {article.title}
                      </Link>
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${getStatusColor(article.status)}`}>
                        {article.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{formatDate(article.created_at)}</span>
                      </div>

                      {article.category ? (
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: article.category.color }} />
                          <span>{article.category.name}</span>
                        </div>
                      ) : null}

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{article.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <span>{article.likes || 0}</span>
                        </div>
                      </div>
                    </div>
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
