import { serverNewsApi } from '@/lib/api-server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Calendar, Clock, User, Search } from 'lucide-react'

// Custom Plus icon
const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'All Articles | The Riverside Herald',
  description: 'Browse all news articles from The Riverside Herald. Stay informed with our comprehensive coverage of local news, business, sports, and community events.',
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
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
  } catch (error) {
    return null
  }
}

import { getArticleImageUrl } from '@/lib/image-utils'

function getImageUrl(article: any) {
  return getArticleImageUrl(article)
}

export default async function ArticlesPage() {
  const [articles, categories, profile] = await Promise.all([
    getArticles(),
    getCategories(),
    getProfile()
  ])

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
                  href="/admin/articles?action=create"
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
            <article className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
              <div className="md:flex">
                {/* Featured Image */}
                <div className="md:w-1/2 relative h-64 md:h-80">
                  <Image
                    src={getImageUrl(featuredArticle)}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover"
                  />
                  {featuredArticle.category && (
                    <div className="absolute top-4 left-4">
                      <span
                        className="px-3 py-1 text-sm font-semibold text-white rounded-full"
                        style={{ backgroundColor: featuredArticle.category.color || '#3B82F6' }}
                      >
                        {featuredArticle.category.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <Link href={`/articles/${featuredArticle.slug}`}>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors">
                      {featuredArticle.title}
                    </h3>
                  </Link>

                  {featuredArticle.excerpt && (
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{featuredArticle.author_name || 'Staff Writer'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(featuredArticle.published_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{featuredArticle.read_time_minutes || calculateReadingTime(featuredArticle.content)} min read</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center space-x-6 text-sm text-gray-400">
                    <span>{featuredArticle.views?.toLocaleString() || 0} views</span>
                    <span>{featuredArticle.likes || 0} likes</span>
                  </div>
                </div>
              </div>
            </article>
          </div>
        )}

        {/* Other Articles Grid */}
        {otherArticles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Recent Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherArticles.map((article: any) => {
                const readingTime = article.read_time_minutes || calculateReadingTime(article.content)
                const publishedDate = formatDate(article.published_at)

                return (
                  <article
                    key={article.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                  >
                    <Link href={`/articles/${article.slug}`}>
                      {/* Article Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={getImageUrl(article)}
                          alt={article.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-200"
                        />
                        {article.category && (
                          <div className="absolute top-4 left-4">
                            <span
                              className="px-2 py-1 text-xs font-semibold text-white rounded-full"
                              style={{ backgroundColor: article.category.color || '#3B82F6' }}
                            >
                              {article.category.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Article Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                          {article.title}
                        </h3>

                        {article.excerpt && (
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm text-gray-500">
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

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <span className="text-xs text-gray-400">
                            {article.views?.toLocaleString() || 0} views • {article.likes || 0} likes
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
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
