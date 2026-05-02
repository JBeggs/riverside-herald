'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { formatArticleDate, formatArticleDateShort } from '@/lib/date-utils'

export type HomeArticleBlockData = {
  id: string
  title: string
  slug: string
  subtitle?: string
  excerpt?: string
  published_at?: string | null
  author_name?: string
  read_time_minutes?: number
  views?: number
  category?: { name: string; color: string; slug?: string }
}

function revealClass(revealed: boolean) {
  return revealed
    ? 'opacity-100 pointer-events-auto transition-opacity duration-200'
    : 'opacity-0 pointer-events-none transition-opacity duration-200'
}

/** Large featured tile (hero grid). */
export function HomeFeaturedArticleBlock({
  article,
  imageUrl,
  locale,
}: {
  article: HomeArticleBlockData
  imageUrl: string | null
  locale: string
}) {
  const [revealed, setRevealed] = useState(!imageUrl)
  const onLoad = useCallback(() => setRevealed(true), [])

  return (
    <article className={`card-elevated p-4 md:p-6 ${revealClass(revealed)}`}>
      <div className="relative mb-4">
        {imageUrl ? (
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] w-full overflow-hidden rounded-lg">
            <SafeImage
              src={imageUrl}
              alt=""
              fill
              className="rounded-lg"
              imgClassName="object-cover"
              loading="eager"
              decoding="async"
              onLoad={onLoad}
            />
            {article.category ? (
              <span
                translate="no"
                className="absolute top-3 left-3 md:top-4 md:left-4 tag tag-accent z-[1]"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="h-64 sm:h-80 md:h-96 lg:h-[500px] w-full rounded-lg bg-[rgb(var(--color-surface-raised)/0.85)]" />
        )}
      </div>
      <h2 className="heading-lg mb-3">
        <Link href={`/articles/${article.slug}`} className="hover:text-primary">
          {article.title}
        </Link>
      </h2>
      {article.subtitle ? (
        <p className="text-base md:text-lg text-neutral-600 mb-3 line-clamp-2">{article.subtitle}</p>
      ) : null}
      <p className="body-lg mb-4 line-clamp-3 md:line-clamp-none">{article.excerpt}</p>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs md:text-sm text-neutral-500 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-3 md:space-x-4">
          <span className="truncate max-w-[150px]">By {article.author_name || 'Staff Writer'}</span>
          <span className="flex items-center flex-shrink-0">
            <Clock className="w-4 h-4 mr-1" />
            {article.read_time_minutes || 5} min read
          </span>
        </div>
        <time className="flex-shrink-0">
          {formatArticleDate(article.published_at, {
            locale,
            draftLabel: 'Draft',
            emptyLabel: '—',
          })}
        </time>
      </div>
    </article>
  )
}

/** Compact row with thumbnail (side column). */
export function HomeSideArticleBlock({
  article,
  imageUrl,
  locale,
}: {
  article: HomeArticleBlockData
  imageUrl: string | null
  locale: string
}) {
  const [revealed, setRevealed] = useState(!imageUrl)
  const onLoad = useCallback(() => setRevealed(true), [])

  return (
    <article className={`card p-3 md:p-4 ${revealClass(revealed)}`}>
      <div className="flex space-x-3 md:space-x-4">
        {imageUrl ? (
          <div className="flex-shrink-0 relative w-20 h-16 md:w-24 md:h-20 overflow-hidden rounded">
            <SafeImage
              src={imageUrl}
              alt=""
              width={120}
              height={80}
              className="rounded"
              imgClassName="h-full w-full object-cover"
              onLoad={onLoad}
            />
          </div>
        ) : null}
        <div className="flex-1 min-w-0">
          {article.category ? (
            <span
              translate="no"
              className="tag tag-primary mb-1 md:mb-2"
              style={{
                backgroundColor: `${article.category.color}20`,
                color: article.category.color,
              }}
            >
              {article.category.name}
            </span>
          ) : null}
          <h3 className="heading-xs mb-1 md:mb-2 line-clamp-2">
            <Link href={`/articles/${article.slug}`} className="hover:text-primary">
              {article.title}
            </Link>
          </h3>
          {article.subtitle ? (
            <p className="text-xs md:text-sm text-neutral-600 mb-1 line-clamp-2">{article.subtitle}</p>
          ) : null}
          <div className="flex items-center text-[10px] md:text-xs text-neutral-500 truncate">
            <span className="truncate max-w-[80px] md:max-w-none">{article.author_name || 'Staff Writer'}</span>
            <span className="mx-1 md:mx-2 flex-shrink-0">•</span>
            <time className="flex-shrink-0">{formatArticleDateShort(article.published_at, locale) || '—'}</time>
          </div>
        </div>
      </div>
    </article>
  )
}

/** Card with top image (Latest grid). */
export function HomeGridArticleBlock({
  article,
  imageUrl,
  locale,
}: {
  article: HomeArticleBlockData
  imageUrl: string | null
  locale: string
}) {
  const [revealed, setRevealed] = useState(!imageUrl)
  const onLoad = useCallback(() => setRevealed(true), [])

  return (
    <article className={`card overflow-hidden ${revealClass(revealed)}`}>
      {imageUrl ? (
        <div className="relative h-40 sm:h-48 w-full">
          <SafeImage
            src={imageUrl}
            alt=""
            fill
            imgClassName="object-cover"
            onLoad={onLoad}
          />
          {article.category ? (
            <span
              translate="no"
              className="absolute top-3 left-3 tag tag-primary"
              style={{
                backgroundColor: `${article.category.color}20`,
                color: article.category.color,
              }}
            >
              {article.category.name}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="p-3 md:p-4">
        <h3 className="heading-xs mb-2 line-clamp-2">
          <Link href={`/articles/${article.slug}`} className="hover:text-primary">
            {article.title}
          </Link>
        </h3>
        {article.subtitle ? (
          <p className="text-xs md:text-sm text-neutral-600 mb-2 line-clamp-2">{article.subtitle}</p>
        ) : null}
        <p className="text-xs md:text-sm mb-3 text-neutral-600 line-clamp-2">{article.excerpt}</p>
        <div className="flex items-center justify-between text-[10px] md:text-xs text-neutral-500">
          <span className="truncate max-w-[100px]">{article.author_name || 'Staff Writer'}</span>
          <time className="flex-shrink-0">{formatArticleDateShort(article.published_at, locale) || '—'}</time>
        </div>
      </div>
    </article>
  )
}

/** Trending sidebar row (no lead image). */
export function HomeTrendingMeta({ article, locale }: { article: HomeArticleBlockData; locale: string }) {
  return (
    <div className="text-xs text-neutral-500">
      {(article.views ?? 0).toLocaleString()} views • {formatArticleDateShort(article.published_at, locale) || '—'}
    </div>
  )
}
