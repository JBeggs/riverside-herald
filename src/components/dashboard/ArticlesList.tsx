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
} from 'lucide-react'
import { getAbsoluteImageUrl } from '@/lib/image-utils'
import SafeImage from '@/components/ui/SafeImage'

interface ArticlesListProps {
  articles: any[]
  loading: boolean
  onEdit: (article: any) => void
  onDelete: (id: string) => void
  profile: any
}

function formatAdminDate(dateString: string, withTime = true) {
  if (!dateString) return 'Not set'
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime()) || d.getTime() === 0) return '—'
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  })
}

export default function ArticlesList({ articles, loading, onEdit, onDelete, profile }: ArticlesListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

  const canEdit = (article: any) => {
    if (profile.role === 'admin' || profile.role === 'editor') return true
    if (profile.role === 'author' || profile.role === 'business_owner') {
      return article.author === profile.user || article.author_id === profile.user
    }
    return false
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="bg-surface border border-border-default rounded-lg p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-text-muted">Loading articles...</p>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="bg-surface border border-border-default rounded-lg p-12">
        <div className="text-center">
          <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">No articles found</h3>
          <p className="text-text-muted mb-6">
            {profile.role === 'author'
              ? "You haven't created any articles yet."
              : 'No articles match your current filters.'}
          </p>
        </div>
      </div>
    )
  }

  const rowActions = (article: any) => (
    <div className="flex items-center justify-end space-x-2">
      {article.status === 'published' && (
        <Link
          href={`/articles/${article.slug}`}
          target="_blank"
          className="p-2 text-text-muted hover:text-primary transition-colors"
          title="View article"
        >
          <Eye className="w-4 h-4" />
        </Link>
      )}
      {canEdit(article) && (
        <>
          <button
            onClick={() => onEdit(article)}
            className="p-2 text-text-muted hover:text-primary transition-colors"
            title="Edit article"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(article.id)}
            disabled={deletingId === article.id}
            className="p-2 text-text-muted hover:text-red-600 transition-colors disabled:opacity-50"
            title="Delete article"
          >
            {deletingId === article.id ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </>
      )}
    </div>
  )

  return (
    <div className="bg-surface border border-border-default rounded-lg overflow-hidden">
      {/* Mobile: stacked cards — no horizontal scroll container */}
      <ul className="md:hidden divide-y divide-border-default">
        {articles.map((article) => (
          <li key={article.id} className="p-4 space-y-3">
            <div className="flex gap-3">
              <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-[rgb(var(--color-surface-raised)/0.85)]">
                {article.featured_media?.file_url ? (
                  <SafeImage
                    src={getAbsoluteImageUrl(article.featured_media.file_url)}
                    alt=""
                    width={64}
                    height={64}
                    className="rounded-lg"
                    imgClassName="h-full w-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-text-muted" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  href={article.status === 'published' ? `/articles/${article.slug}` : '#'}
                  className="text-sm font-medium text-text hover:text-primary line-clamp-2"
                >
                  {article.title}
                </Link>
                <span
                  className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(article.status)}`}
                >
                  {article.status === 'published' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  {article.status}
                </span>
              </div>
            </div>
            {article.excerpt ? <p className="text-sm text-text-muted line-clamp-2">{article.excerpt}</p> : null}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
              <span>{article.author_name || 'Unknown'}</span>
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatAdminDate(article.created_at)}
              </span>
              <span className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {article.views ?? 0}
              </span>
            </div>
            {article.published_at && article.status === 'published' ? (
              <div className="text-xs text-text-muted flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Published: {formatAdminDate(article.published_at)}
              </div>
            ) : null}
            {rowActions(article)}
          </li>
        ))}
      </ul>

      {/* Desktop: table without nested overflow-y (document scroll only) */}
      <div className="hidden md:block">
        <table className="w-full table-fixed">
          <thead className="bg-[rgb(var(--color-surface-raised)/0.5)] border-b border-border-default">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider w-[40%]">
                Article
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {articles.map((article) => (
              <tr key={article.id} className="hover:bg-[rgb(var(--color-surface-raised)/0.35)]">
                <td className="px-6 py-4 align-top">
                  <div className="flex items-start space-x-3 min-w-0">
                    <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-[rgb(var(--color-surface-raised)/0.85)]">
                      {article.featured_media?.file_url ? (
                        <SafeImage
                          src={getAbsoluteImageUrl(article.featured_media.file_url)}
                          alt=""
                          width={64}
                          height={64}
                          className="rounded-lg"
                          imgClassName="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-6 h-6 text-text-muted" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={article.status === 'published' ? `/articles/${article.slug}` : '#'}
                        className="text-sm font-medium text-text hover:text-primary block break-words"
                      >
                        {article.title}
                      </Link>
                      {article.excerpt ? <p className="text-sm text-text-muted mt-1 line-clamp-2">{article.excerpt}</p> : null}
                      {article.category ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary mt-2">
                          {article.category.name}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 align-top whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(article.status)}`}
                  >
                    {article.status === 'published' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                    {article.status}
                  </span>
                </td>
                <td className="px-6 py-4 align-top text-sm text-text-muted whitespace-nowrap">
                  {article.author_name || 'Unknown'}
                </td>
                <td className="px-6 py-4 align-top text-sm text-text-muted">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                    {formatAdminDate(article.created_at)}
                  </div>
                  {article.published_at && article.status === 'published' ? (
                    <div className="flex items-center text-xs text-text-muted mt-1">
                      <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                      Published: {formatAdminDate(article.published_at)}
                    </div>
                  ) : null}
                </td>
                <td className="px-6 py-4 align-top text-sm text-text-muted whitespace-nowrap">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {article.views ?? 0}
                  </div>
                </td>
                <td className="px-6 py-4 align-top text-right text-sm font-medium">{rowActions(article)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
