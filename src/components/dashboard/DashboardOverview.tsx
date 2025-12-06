'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  FileText, 
  Building2, 
  TrendingUp,
  Eye,
  Clock
} from 'lucide-react'
import ArticleEditorModal from '@/components/articles/ArticleEditorModal'

// Custom icons not available in lucide-react
const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

interface DashboardOverviewProps {
  profile: any
  stats?: any
  recentArticles: any[]
}

export default function DashboardOverview({ profile, stats, recentArticles }: DashboardOverviewProps) {
  const [showEditorModal, setShowEditorModal] = useState(false)
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)
  const isAdmin = profile?.role === 'admin'
  const isEditor = profile?.role === 'editor'
  const isAuthor = profile?.role === 'author'
  const isBusinessOwner = profile?.role === 'business_owner'
  
  // Filter articles to only show user's articles if they're author or business_owner
  const filteredArticles = (isAuthor || isBusinessOwner) && profile?.user
    ? recentArticles.filter((article: any) => article.author === profile.user || article.author_id === profile.user)
    : recentArticles

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {profile?.full_name || profile?.email || 'User'}!
          </p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setShowEditorModal(true)
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Article</span>
        </button>
      </div>

      {/* Stats Grid */}
      {(isAdmin || isEditor) && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Articles</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalArticles?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <Link
              href="/admin/articles"
              className="text-sm text-blue-600 hover:text-blue-700 mt-4 inline-flex items-center"
            >
              View all <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalUsers?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            {isAdmin && (
              <Link
                href="/admin/users"
                className="text-sm text-green-600 hover:text-green-700 mt-4 inline-flex items-center"
              >
                Manage users <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Businesses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stats.totalBusinesses?.toLocaleString() || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <Link
              href="/admin/businesses"
              className="text-sm text-purple-600 hover:text-purple-700 mt-4 inline-flex items-center"
            >
              View directory <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowEditorModal(true)
            }}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors w-full text-left"
          >
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Create Article</p>
              <p className="text-sm text-gray-600">Write a new article</p>
            </div>
          </button>

          <Link
            href="/admin/media"
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Media Library</p>
              <p className="text-sm text-gray-600">Manage images & files</p>
            </div>
          </Link>

          {(isAdmin || isEditor) && (
            <Link
              href="/admin/categories"
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Categories</p>
                <p className="text-sm text-gray-600">Organize content</p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Articles */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Articles</h2>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No articles yet</p>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowEditorModal(true)
              }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Article</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.slice(0, 5).map((article: any) => (
              <button
                key={article.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const articleId = article.id ? String(article.id) : null
                  setSelectedArticleId(articleId)
                  setShowEditorModal(true)
                }}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-gray-900 truncate">
                      {article.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(article.status)}`}>
                      {article.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(article.created_at)}</span>
                    </span>
                    {article.views !== undefined && (
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views} views</span>
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 ml-4" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Article Editor Modal */}
      {showEditorModal && (
        <ArticleEditorModal
          isOpen={showEditorModal}
          onClose={() => {
            setShowEditorModal(false)
            setSelectedArticleId(null)
          }}
          onSave={(newArticle) => {
            setShowEditorModal(false)
            setSelectedArticleId(null)
            // Optionally reload to show new/updated article
            if (newArticle) {
              window.location.reload()
            }
          }}
          articleId={selectedArticleId || "new"}
        />
      )}
    </div>
  )
}

