'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { shouldShowExcerptWithSubtitle, trimArticleSubtitle } from '@/lib/article-deck'
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
    : 'opacity-100 pointer-events-auto transition-opacity duration-200'
}

function ArticleCardSubtitle({
  text,
  size = 'sm',
}: {
  text: string
  size?: 'sm' | 'lg'
}) {
  const deck = trimArticleSubtitle(text)
  if (!deck) return null
  const className =
    size === 'lg'
      ? 'text-base md:text-lg text-text-muted mb-3 line-clamp-2 leading-snug'
      : 'text-xs md:text-sm text-text-muted mb-2 line-clamp-2 leading-snug'
  return (
    <p className={className} data-cy="article-card-subtitle" data-testid="article-card-subtitle">
      {deck}
    </p>
  )
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
  const subtitle = trimArticleSubtitle(article.subtitle)
  const showExcerpt = shouldShowExcerptWithSubtitle(subtitle, article.excerpt)

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
      <ArticleCardSubtitle text={subtitle} size="lg" />
      {showExcerpt && article.excerpt ? (
        <p className="body-lg mb-4 line-clamp-3 md:line-clamp-none text-text-muted">{article.excerpt}</p>
      ) : null}
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

/** Compact horizontal card (featured sidebar column). */
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
  const subtitle = trimArticleSubtitle(article.subtitle)
  const href = `/articles/${article.slug}`

  return (
    <article
      className={`card overflow-hidden flex gap-3 md:gap-4 p-3 md:p-4 items-stretch ${revealClass(revealed)}`}
    >
      {imageUrl ? (
        <Link
          href={href}
          className="relative block w-[5.5rem] sm:w-24 md:w-28 shrink-0 rounded-md overflow-hidden bg-[rgb(var(--color-surface-raised)/0.85)] self-center aspect-[4/3]"
          aria-hidden
          tabIndex={-1}
        >
          <SafeImage
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 88px, 112px"
            imgClassName="object-cover object-center"
            loading="lazy"
            decoding="async"
            onLoad={onLoad}
          />
        </Link>
      ) : null}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {article.category ? (
          <span
            translate="no"
            className="tag tag-primary mb-1.5 w-fit"
            style={{
              backgroundColor: `${article.category.color}20`,
              color: article.category.color,
            }}
          >
            {article.category.name}
          </span>
        ) : null}
        <h3 className="heading-xs mb-1 line-clamp-3 leading-snug">
          <Link href={href} className="hover:text-primary">
            {article.title}
          </Link>
        </h3>
        <ArticleCardSubtitle text={subtitle} />
        <div className="flex items-center text-[10px] md:text-xs text-neutral-500 mt-0.5">
          <span className="truncate">{article.author_name || 'Staff Writer'}</span>
          <span className="mx-1.5 flex-shrink-0">•</span>
          <time className="flex-shrink-0 whitespace-nowrap">
            {formatArticleDateShort(article.published_at, locale) || '—'}
          </time>
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
  const subtitle = trimArticleSubtitle(article.subtitle)
  const showExcerpt = shouldShowExcerptWithSubtitle(subtitle, article.excerpt)

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
        <ArticleCardSubtitle text={subtitle} />
        {showExcerpt && article.excerpt ? (
          <p className="text-xs md:text-sm mb-3 text-text-muted line-clamp-2">{article.excerpt}</p>
        ) : null}
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
