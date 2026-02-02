'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Edit3, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Building2,
  Share2
} from 'lucide-react'
import { getAbsoluteImageUrl } from '@/lib/image-utils'

// Custom icons not available in lucide-react
const Copy = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const BarChart3 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const ExternalLink = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
)

interface ArticleCardProps {
  article: any
  profile: any
  onEdit?: (article: any) => void
  onDelete?: (id: string) => void
  onDuplicate?: (article: any) => void
  onPromote?: (article: any) => void
  showActions?: boolean
  compact?: boolean
  className?: string
}

export default function ArticleCard({ 
  article, 
  profile, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onPromote,
  showActions = true,
  compact = false,
  className = '' 
}: ArticleCardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showFullActions, setShowFullActions] = useState(false)

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(compact ? {} : { hour: '2-digit', minute: '2-digit' })
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const canEdit = () => {
    if (profile?.role === 'admin' || profile?.role === 'editor') return true
    if (profile?.role === 'author' || profile?.role === 'business_owner') {
      return article.author === profile.user || article.author_id === profile.user
    }
    return false
  }

  const canDelete = () => {
    if (profile?.role === 'admin') return true
    if (profile?.role === 'editor') return true
    if (profile?.role === 'author' || profile?.role === 'business_owner') {
      return article.author === profile.user || article.author_id === profile.user
    }
    return false
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return
    }
    
    setDeletingId(article.id)
    try {
      await onDelete?.(article.id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/articles/${article.slug}`
    navigator.clipboard.writeText(url)
    // Could add toast notification here
  }

  const isBusinessOwner = profile?.role === 'business_owner'
  const isEditor = profile?.role === 'editor' || profile?.role === 'admin'

  if (compact) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow ${className}`}>
        <div className="flex items-start space-x-3">
          {/* Thumbnail */}
          {article.featured_media?.file_url ? (
            <img
              src={getAbsoluteImageUrl(article.featured_media.file_url)}
              alt={article.title}
              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-gray-400" />
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <Link
                  href={article.status === 'published' ? `/articles/${article.slug}` : '#'}
                  className="text-sm font-medium text-gray-900 hover:text-blue-600 block truncate"
                >
                  {article.title}
                </Link>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(article.status)}`}>
                    {article.status === 'published' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <XCircle className="w-3 h-3 mr-1" />
                    )}
                    {article.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(article.created_at)}
                  </span>
                </div>
              </div>
              
              {/* Quick Actions */}
              {showActions && canEdit() && (
                <div className="flex items-center space-x-1 ml-2">
                  {article.status === 'published' && (
                    <Link
                      href={`/articles/${article.slug}`}
                      target="_blank"
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      title="View article"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  <button
                    onClick={() => onEdit?.(article)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit article"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow ${className}`}>
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Thumbnail */}
          {article.featured_media?.file_url ? (
            <img
              src={getAbsoluteImageUrl(article.featured_media.file_url)}
              alt={article.title}
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <Link
                  href={article.status === 'published' ? `/articles/${article.slug}` : '#'}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 block"
                >
                  {article.title}
                </Link>
                {article.excerpt && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                )}
              </div>
              
              {/* Status Badge */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ml-4 ${getStatusColor(article.status)}`}>
                {article.status === 'published' ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                {article.status}
              </span>
            </div>
            
            {/* Metadata */}
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.created_at)}</span>
              </div>
              {article.published_at && article.status === 'published' && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Published: {formatDate(article.published_at)}</span>
                </div>
              )}
              {article.views !== undefined && (
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{article.views} views</span>
                </div>
              )}
              {article.author_name && (
                <span>by {article.author_name}</span>
              )}
            </div>

            {/* Categories and Tags */}
            <div className="flex items-center space-x-3 mb-4">
              {article.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {article.category.name}
                </span>
              )}
              {/* Business Link for Business Owners */}
              {article.business && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Building2 className="w-3 h-3 mr-1" />
                  {article.business.name}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {/* View Button */}
              {article.status === 'published' && (
                <Link
                  href={`/articles/${article.slug}`}
                  target="_blank"
                  className="inline-flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
              
              {/* Edit Button */}
              {canEdit() && (
                <button
                  onClick={() => onEdit?.(article)}
                  className="inline-flex items-center space-x-2 px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
              
              {/* Business Owner Special Actions */}
              {isBusinessOwner && (
                <>
                  <button
                    onClick={() => onDuplicate?.(article)}
                    className="inline-flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Duplicate article"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Duplicate</span>
                  </button>
                  
                  {article.business && (
                    <button
                      onClick={() => onPromote?.(article)}
                      className="inline-flex items-center space-x-2 px-3 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      title="Promote this article"
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Promote</span>
                    </button>
                  )}
                </>
              )}
              
              {/* Editor/Admin Actions */}
              {isEditor && (
                <button
                  onClick={() => setShowFullActions(!showFullActions)}
                  className="inline-flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </button>
              )}
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyLink}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="Copy link"
              >
                <Share2 className="w-4 h-4" />
              </button>
              
              {canDelete() && (
                <button
                  onClick={handleDelete}
                  disabled={deletingId === article.id}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete article"
                >
                  {deletingId === article.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}