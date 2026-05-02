import { serverNewsApi } from '@/lib/api-server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { Search } from 'lucide-react'
import { cookies } from 'next/headers'
import { loadSiteSettingsMap, siteLabelFromMap, stringFromMap } from '@/lib/site-settings'
import ArticlesFeaturedSplit from '@/components/articles/ArticlesFeaturedSplit'
import RelatedArticleCard from '@/components/articles/RelatedArticleCard'

// Custom Plus icon
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

export async function generateMetadata(): Promise<Metadata> {
  const map = await loadSiteSettingsMap()
  const name = siteLabelFromMap(map, 'site_name', 'News')
  return {
    title: `All Articles | ${name}`,
    description: `Browse all news articles from ${name}. Stay informed with local news and community coverage.`,
  }
}

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

async function getArticles() {
  try {
    const articlesData: any = await serverNewsApi.articles.list({ 
      status: 'published',
      skipTenant: true
    })
    const articles = articlesData?.results || articlesData || []
    
    return articles.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || '',
      content: article.content || '',
      published_at: article.published_at,
      views: article.views || 0,
      likes: article.likes || 0,
      read_time_minutes: article.read_time_minutes,
      featured_media: article.featured_media ? {
        file_url: article.featured_media.file_url,
        alt_text: article.featured_media.alt_text || article.title
      } : undefined,
      author_name: article.author_name || 'Staff Writer',
      category: article.category ? {
        id: article.category.id,
        name: article.category.name,
        slug: article.category.slug,
        color: article.category.color
      } : undefined,
    }))
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

async function getCategories() {
  try {
    const categoriesData: any = await serverNewsApi.categories.list({ skipTenant: true })
    return (categoriesData?.results || categoriesData || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      color: cat.color
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

async function getProfile(): Promise<any> {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value
    if (!authToken) return null
    
    return await serverNewsApi.profile.get()
  } catch {
    return null
  }
}

import { getArticleImageUrl } from '@/lib/image-utils'

function getImageUrl(article: any) {
  return getArticleImageUrl(article)
}

export default async function ArticlesPage() {
  const [articles, categories, profile, settingsMap] = await Promise.all([
    getArticles(),
    getCategories(),
    getProfile(),
    loadSiteSettingsMap(),
  ])
  const locale = stringFromMap(settingsMap, 'default_locale').trim() || 'en-ZA'

  const canAddArticle = profile && ['admin', 'editor', 'author', 'business_owner'].includes(profile.role)

  const featuredArticle = articles[0]
  const otherArticles = articles.slice(1)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-16">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              All Articles
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Stay informed with our comprehensive coverage of local news, business, sports, and community events.
            </p>
            
            {canAddArticle && (
              <div className="flex justify-center">
                <Link
                  href="/admin/articles/add"
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Article</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="border-b border-gray-200 py-6">
        <div className="container-wide">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/articles"
              className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              All Articles
            </Link>
            {categories.map((category: any) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: `${category.color}20`,
                  color: category.color
                }}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container-wide py-12">
        {/* Featured Article */}
        {featuredArticle && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Article</h2>
            <ArticlesFeaturedSplit
              article={featuredArticle}
              imageUrl={getImageUrl(featuredArticle)}
              locale={locale}
              readingTimeMinutes={featuredArticle.read_time_minutes || calculateReadingTime(featuredArticle.content)}
            />
          </div>
        )}

        {/* Other Articles Grid */}
        {otherArticles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Articles</h2>
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
        )}

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No Articles Found</h3>
            <p className="text-gray-600 mb-8">
              There are no published articles at the moment. Check back later!
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
