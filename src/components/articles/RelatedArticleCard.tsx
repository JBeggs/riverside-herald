'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { formatArticleDateShort } from '@/lib/date-utils'

export type RelatedArticleCardData = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  published_at?: string | null
  views?: number
  author_name?: string
  category?: { name: string; color?: string }
  featured_media?: { file_url?: string | null; alt_text?: string | null } | null
}

export default function RelatedArticleCard({
  article,
  imageUrl,
  readingTime,
  locale,
}: {
  article: RelatedArticleCardData
  imageUrl: string | null
  readingTime: number
  locale: string
}) {
  const [revealed, setRevealed] = useState(!imageUrl)
  const onLoad = useCallback(() => setRevealed(true), [])
  const publishedDate = formatArticleDateShort(article.published_at, locale) || '—'

  return (
    <article
      className={`bg-surface rounded-xl shadow-card border border-border-default hover:shadow-md transition-shadow duration-200 overflow-hidden ${
        revealed ? 'opacity-100 pointer-events-auto transition-opacity duration-200' : 'opacity-0 pointer-events-none transition-opacity duration-200'
      }`}
    >
      <Link href={`/articles/${article.slug}`}>
        {imageUrl ? (
          <div className="relative h-48 overflow-hidden">
            <SafeImage
              src={imageUrl}
              alt=""
              fill
              imgClassName="object-cover hover:scale-105 transition-transform duration-200"
              onLoad={onLoad}
            />
            {article.category ? (
              <div className="absolute top-4 left-4">
                <span
                  translate="no"
                  className="px-2 py-1 text-xs font-semibold text-white rounded-full"
                  style={{ backgroundColor: article.category.color || 'rgb(var(--color-primary))' }}
                >
                  {article.category.name}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="p-6">
          <h3 className="text-xl font-bold text-text mb-3 line-clamp-2 hover:text-primary transition-colors">{article.title}</h3>

          {article.excerpt ? <p className="text-text-muted mb-4 line-clamp-2">{article.excerpt}</p> : null}

          <div className="flex items-center justify-between text-sm text-text-muted">
            <div className="flex items-center space-x-4">
              <span>{article.author_name || 'Staff Writer'}</span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{publishedDate}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{readingTime} min</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border-default">
            <span className="text-xs text-text-muted">{article.views?.toLocaleString() || 0} views</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
