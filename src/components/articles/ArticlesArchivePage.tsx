import Link from 'next/link'
import { Search } from 'lucide-react'
import ArticlesFeaturedSplit from '@/components/articles/ArticlesFeaturedSplit'
import RelatedArticleCard from '@/components/articles/RelatedArticleCard'
import ArticlesTopicFilters from '@/components/articles/ArticlesTopicFilters'
import { getArticleCardImageUrl } from '@/lib/image-utils'
import { calculateReadingTime } from '@/lib/articles-archive'

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

function getImageUrl(article: any) {
  return getArticleCardImageUrl(article)
}

type Category = { id: string; name: string; slug: string; color: string }

export default function ArticlesArchivePage({
  articles,
  categories,
  locale,
  canAddArticle,
  activeCategorySlug = null,
  title,
  description,
  /** When true, show all articles in the grid (no large featured slot). */
  flatList = false,
}: {
  articles: any[]
  categories: Category[]
  locale: string
  canAddArticle: boolean
  activeCategorySlug?: string | null
  title: string
  description: string
  flatList?: boolean
}) {
  const showFeatured = !flatList && articles.length > 0
  const featuredArticle = showFeatured ? articles[0] : null
  const otherArticles = showFeatured ? articles.slice(1) : articles

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-surface-raised/80 border-b border-border-default py-16">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-text mb-6">{title}</h1>
            <p className="text-xl text-text-muted leading-relaxed mb-8">{description}</p>

            {canAddArticle ? (
              <div className="flex justify-center">
                <Link
                  href="/admin/articles/add"
                  className="flex items-center space-x-2 px-6 py-3 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity font-semibold shadow-card"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Article</span>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <ArticlesTopicFilters categories={categories} activeCategorySlug={activeCategorySlug} />

      <div className="container-wide py-12">
        {featuredArticle ? (
          <div className="mb-16">
            <h2 className="text-2xl font-bold font-heading text-text mb-8">Featured Article</h2>
            <ArticlesFeaturedSplit
              article={featuredArticle}
              imageUrl={getImageUrl(featuredArticle) || ''}
              locale={locale}
              readingTimeMinutes={featuredArticle.read_time_minutes || calculateReadingTime(featuredArticle.content)}
            />
          </div>
        ) : null}

        {otherArticles.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold font-heading text-text mb-8">
              {featuredArticle ? 'Recent Articles' : 'Articles'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-cy="articles-list">
              {otherArticles.map((article: any) => {
                const readingTime = article.read_time_minutes || calculateReadingTime(article.content)
                return (
                  <RelatedArticleCard
                    key={article.id}
                    article={article}
                    imageUrl={getImageUrl(article)}
                    readingTime={readingTime}
                    locale={locale}
                  />
                )
              })}
            </div>
          </div>
        ) : null}

        {articles.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-text-muted/50 mx-auto mb-6" />
            <h3 className="text-2xl font-bold font-heading text-text mb-4">No Articles Found</h3>
            <p className="text-text-muted mb-8">
              There are no published articles here yet. Try another category or check back later.
            </p>
            <Link
              href="/articles"
              className="inline-flex items-center px-6 py-3 bg-primary text-on-primary font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              All articles
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
