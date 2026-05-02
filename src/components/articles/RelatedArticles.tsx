import { serverNewsApi } from '@/lib/api-server'
import Link from 'next/link'
import { loadSiteSettingsMap, stringFromMap } from '@/lib/site-settings'
import { getArticleImageUrl } from '@/lib/image-utils'
import RelatedArticleCard from '@/components/articles/RelatedArticleCard'
import type { RelatedArticleCardData } from '@/components/articles/RelatedArticleCard'

interface RelatedArticlesProps {
  currentArticleId: string
  categoryId?: string
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

async function getRelatedArticles(currentArticleId: string, categoryId?: string) {
  try {
    const params: Record<string, unknown> = {
      status: 'published',
      limit: 3,
      skipTenant: true,
    }

    if (categoryId) {
      params.category = categoryId
    }

    const articlesData: unknown = await serverNewsApi.articles.list(params)
    const articles = (articlesData as { results?: unknown[] })?.results || (articlesData as unknown[]) || []

    const filtered = (articles as { id: string }[])
      .filter((article) => article.id !== currentArticleId)
      .slice(0, 3) as any[]

    if (filtered.length < 3 && categoryId) {
      const fallbackData: unknown = await serverNewsApi.articles.list({
        status: 'published',
        limit: 6,
        skipTenant: true,
      })
      const fallback = ((fallbackData as { results?: unknown[] })?.results ||
        (fallbackData as unknown[]) ||
        []) as any[]
      const more = fallback
        .filter(
          (article) =>
            article.id !== currentArticleId && !filtered.some((f) => f.id === article.id),
        )
        .slice(0, 3 - filtered.length)

      filtered.push(...more)
    }

    return filtered.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || '',
      content: article.content || '',
      published_at: article.published_at,
      views: article.views || 0,
      featured_media: article.featured_media
        ? {
            file_url: article.featured_media.file_url,
            alt_text: article.featured_media.alt_text || article.title,
          }
        : undefined,
      author_name: article.author_name || 'Staff Writer',
      category: article.category
        ? {
            name: article.category.name,
            color: article.category.color,
          }
        : undefined,
    }))
  } catch (error) {
    console.error('Error fetching related articles:', error)
    return []
  }
}

export default async function RelatedArticles({ currentArticleId, categoryId }: RelatedArticlesProps) {
  const [relatedArticles, settingsMap] = await Promise.all([
    getRelatedArticles(currentArticleId, categoryId),
    loadSiteSettingsMap(),
  ])
  const locale = stringFromMap(settingsMap, 'default_locale').trim() || 'en-ZA'

  if (relatedArticles.length === 0) {
    return null
  }

  return (
    <section className="bg-surface-raised py-16">
      <div className="container-wide">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text mb-4">Related Articles</h2>
            <p className="text-lg text-text-muted">Continue reading with these related stories</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedArticles.map((article: RelatedArticleCardData) => {
              const readingTime = calculateReadingTime(article.content)
              const imageUrl = getArticleImageUrl(article)
              return (
                <RelatedArticleCard
                  key={article.id}
                  article={article}
                  imageUrl={imageUrl || null}
                  readingTime={readingTime}
                  locale={locale}
                />
              )
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/articles" className="inline-flex items-center px-6 py-3 bg-primary text-[rgb(var(--color-on-accent))] font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-card">
              View All Articles
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
