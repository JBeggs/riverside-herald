'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { User, Calendar, Clock } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { formatArticleDateShort } from '@/lib/date-utils'

type FeaturedArticle = {
  title: string
  slug: string
  excerpt?: string
  published_at?: string | null
  author_name?: string
  content: string
  views?: number
  likes?: number
  read_time_minutes?: number
  category?: { name: string; color?: string }
}

export default function ArticlesFeaturedSplit({
  article,
  imageUrl,
  locale,
  readingTimeMinutes,
}: {
  article: FeaturedArticle
  imageUrl: string
  locale: string
  readingTimeMinutes: number
}) {
  const [revealed, setRevealed] = useState(false)
  const onLoad = useCallback(() => setRevealed(true), [])
  const published = formatArticleDateShort(article.published_at, locale) || '—'

  return (
    <article
      className={`bg-surface rounded-2xl shadow-card overflow-hidden hover:shadow-md transition-shadow duration-200 border border-border-default ${
        revealed ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      } transition-opacity duration-200`}
    >
      <div className="md:flex">
        <div className="md:w-1/2 relative h-64 md:h-80 bg-[rgb(var(--color-surface-raised)/0.85)]">
          {imageUrl ? (
            <SafeImage
              src={imageUrl}
              alt=""
              fill
              loading="eager"
              imgClassName="object-cover"
              onLoad={onLoad}
            />
          ) : null}
          {article.category ? (
            <div className="absolute top-4 left-4 z-[1]">
              <span
                translate="no"
                className="px-3 py-1 text-sm font-semibold text-[rgb(var(--color-on-accent))] rounded-full"
                style={{ backgroundColor: article.category.color || '#3B82F6' }}
              >
                {article.category.name}
              </span>
            </div>
          ) : null}
        </div>

        <div className="md:w-1/2 p-8 flex flex-col justify-center">
          <Link href={`/articles/${article.slug}`}>
            <h3 className="text-2xl md:text-3xl font-bold text-text mb-4 hover:text-primary transition-colors">{article.title}</h3>
          </Link>

          {article.excerpt ? <p className="text-text-muted mb-6 leading-relaxed">{article.excerpt}</p> : null}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-muted mb-6">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{article.author_name || 'Staff Writer'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{published}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{readingTimeMinutes} min read</span>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm text-text-muted">
            <span>{article.views?.toLocaleString() || 0} views</span>
            <span>{article.likes || 0} likes</span>
          </div>
        </div>
      </div>
    </article>
  )
}
