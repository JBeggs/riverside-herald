import { serverNewsApi } from '@/lib/api-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Calendar, Clock, User, Tag } from 'lucide-react'
import EnhancedArticleEditor from '@/components/articles/EnhancedArticleEditor'
import ShareButtons from '@/components/articles/ShareButtons'
import StaffLinkedInPostHint from '@/components/articles/StaffLinkedInPostHint'
import RelatedArticles from '@/components/articles/RelatedArticles'
import { ArticleHero } from '@/components/articles/ArticleHero'
import { ArticleGallery } from '@/components/articles/ArticleGallery'
import { formatArticleDate } from '@/lib/date-utils'
import {
  getArticleImageUrl,
  getArticleOpenGraphImageUrls,
} from '@/lib/image-utils'
import {
  parseSiteSettingsRows,
  stringFromMap,
} from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

async function getArticlePageSettings() {
  try {
    const raw = await serverNewsApi.siteSettings.list({ skipTenant: true } as Record<string, unknown>)
    const map = parseSiteSettingsRows(raw)
    return {
      siteOrigin: stringFromMap(map, 'site_canonical_url'),
      defaultLocale: stringFromMap(map, 'default_locale') || 'en-ZA',
    }
  } catch {
    return { siteOrigin: '', defaultLocale: 'en-ZA' }
  }
}

function calculateReadingTime(content: string | undefined | null): number {
  if (!content) return 5
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

async function getArticleData(slug: string) {
  try {
    const article = await serverNewsApi.articles.getBySlug(slug)
    
    if (!article) {
      return null
    }
    
    // For anonymous users, only show published articles
    // For authenticated users, show all articles
    // (This check is handled by the backend, but we can add client-side check if needed)

    // Increment view count (async, don't wait)
    if (article.id) {
      serverNewsApi.articles.incrementViews(article.id).catch(console.error)
    }
    
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      subtitle: article.subtitle,
      excerpt: article.excerpt,
      content: article.content || '',
      featured_media: article.featured_media,
      social_image: article.social_image,
      published_at: article.published_at,
      views: article.views || 0,
      likes: article.likes || 0,
      shares: article.shares || 0,
      read_time_minutes: article.read_time_minutes,
      status: article.status,
      created_at: article.created_at,
      updated_at: article.updated_at,
      author_id: article.author,
      category_id: article.category?.id,
      author: {
        id: article.author,
        full_name: article.author_name,
        avatar_url: null, // Will need to fetch from profile if needed
        role: 'author'
      },
      category: article.category ? {
        id: article.category.id,
        name: article.category.name,
        slug: article.category.slug,
        color: article.category.color
      } : null,
      tags: article.tags || [],
      seo_title: article.seo_title,
      seo_description: article.seo_description,
      article_media: article.article_media || [],
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

async function getArticleDataBuildTime(slug: string) {
  try {
    const article = await serverNewsApi.articles.getBySlug(slug)
    
    if (!article || article.status !== 'published') {
      return null
    }
    
    return {
      title: article.title,
      subtitle: article.subtitle,
      excerpt: article.excerpt,
      seo_title: article.seo_title,
      seo_description: article.seo_description,
      featured_media: article.featured_media,
      social_image: article.social_image,
      published_at: article.published_at,
      author: {
        full_name: article.author_name
      },
      category: article.category ? {
        name: article.category.name
      } : null,
    }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleDataBuildTime(slug)

  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  const displayTitle = (article.seo_title || article.title || '').trim()
  const ogDescription = (
    article.seo_description ||
    article.excerpt ||
    ''
  ).trim()

  return {
    title: displayTitle || article.title,
    description: ogDescription,
    openGraph: {
      title: displayTitle || article.title,
      description: ogDescription,
      images: getArticleOpenGraphImageUrls(article),
      publishedTime: article.published_at,
      authors: [article.author?.full_name || 'Staff Writer'],
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const [article, pageSettings] = await Promise.all([
    getArticleData(slug),
    getArticlePageSettings(),
  ])

  if (!article) {
    notFound()
  }

  const readingTime = article.read_time_minutes || calculateReadingTime(article.content || '')
  const heroSrc = getArticleImageUrl(article)
  const publishedDateSource =
    article.published_at ||
    (article.status === 'published' ? article.created_at : null)
  const dateLabel = formatArticleDate(publishedDateSource, {
    locale: pageSettings.defaultLocale,
    draftLabel: 'Unpublished',
    emptyLabel: '—',
  })

  return (
    <div className="min-h-screen bg-bg">
      {/* Article Header */}
      <div className="bg-surface-raised border-b border-border-default">
        <div className="container-wide py-8">
          {article.category && (
            <Link
              href={`/category/${article.category.slug}`}
              className="inline-block mb-4"
            >
              <span
                className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
            </Link>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text mb-4" data-cy="article-title">
            {article.title}
          </h1>

          {article.subtitle ? (
            <p className="text-lg sm:text-xl text-text-muted mb-6">{article.subtitle}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-text-muted">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{article.author?.full_name || 'Staff Writer'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={article.published_at || undefined}>{dateLabel}</time>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{article.views?.toLocaleString() || 0} views</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{article.likes || 0} likes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-wide py-4 md:py-8">
        <ArticleHero src={heroSrc} alt={article.featured_media?.alt_text || article.title} />
      </div>

      <ArticleGallery items={article.article_media || []} />

      <article className="container-wide py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <EnhancedArticleEditor article={article as any} chrome="public" />

          {article.content ? (
            <div
              className="prose prose-sm sm:prose-base md:prose-lg max-w-none mb-12 prose-headings:text-text prose-p:text-text-muted prose-a:text-primary prose-a:underline hover:prose-a:opacity-90"
              data-cy="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-text-muted italic">No content available for this article.</p>
            </div>
          )}

          {article.tags && article.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-12">
              {article.tags.map((tag: any) => (
                <Link
                  key={tag.id || tag}
                  href={`/tag/${typeof tag === 'string' ? tag : tag.slug}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-surface-raised text-text border border-border-default hover:opacity-90"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {typeof tag === 'string' ? tag : tag.name}
                </Link>
              ))}
            </div>
          ) : null}

          <StaffLinkedInPostHint articleSlug={article.slug} />

          <ShareButtons
            title={article.title}
            url={`/articles/${article.slug}`}
            siteOrigin={pageSettings.siteOrigin}
          />

          <RelatedArticles
            currentArticleId={article.id}
            categoryId={article.category_id || undefined}
          />
        </div>
      </article>
    </div>
  )
}
