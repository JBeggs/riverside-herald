import { serverNewsApi } from '@/lib/api-server'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock } from 'lucide-react'
import { getArticleImageUrl } from '@/lib/image-utils'

interface RelatedArticlesProps {
  currentArticleId: string
  categoryId?: string
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

async function getRelatedArticles(currentArticleId: string, categoryId?: string) {
  try {
    // Get articles with category filter if provided
    const params: any = {
      status: 'published',
      limit: 3
    }
    
    if (categoryId) {
      params.category = categoryId
    }
    
    const articlesData = await serverNewsApi.articles.list(params)
    const articles = articlesData.results || articlesData || []
    
    // Filter out current article and limit to 3
    const filtered = articles
      .filter((article: any) => article.id !== currentArticleId)
      .slice(0, 3)
    
    // If we don't have enough with category filter, get more without it
    if (filtered.length < 3 && categoryId) {
      const fallbackData = await serverNewsApi.articles.list({
        status: 'published',
        limit: 6
      })
      const fallback = (fallbackData.results || fallbackData || [])
        .filter((article: any) => 
          article.id !== currentArticleId && 
          !filtered.some((f: any) => f.id === article.id)
        )
        .slice(0, 3 - filtered.length)
      
      filtered.push(...fallback)
    }
    
    return filtered.map((article: any) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || '',
      content: article.content || '',
      published_at: article.published_at,
      views: article.views || 0,
      featured_media: article.featured_media ? {
        file_url: article.featured_media.file_url,
        alt_text: article.featured_media.alt_text || article.title
      } : undefined,
      author_name: article.author_name || 'Staff Writer',
      category: article.category ? {
        name: article.category.name,
        color: article.category.color
      } : undefined,
    }))
  } catch (error) {
    console.error('Error fetching related articles:', error)
    return []
  }
}

function getImageUrl(article: any) {
  return getArticleImageUrl(article)
}

export default async function RelatedArticles({ currentArticleId, categoryId }: RelatedArticlesProps) {
  const relatedArticles = await getRelatedArticles(currentArticleId, categoryId)

  if (relatedArticles.length === 0) {
    return null
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="container-wide">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Related Articles
            </h2>
            <p className="text-lg text-gray-600">
              Continue reading with these related stories
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedArticles.map((article) => {
              const readingTime = calculateReadingTime(article.content)
              const publishedDate = formatDate(article.published_at)

              return (
                <article
                  key={article.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
                >
                  <Link href={`/articles/${article.slug}`}>
                    {/* Article Image */}
                    {getImageUrl(article) && (
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={getImageUrl(article)}
                          alt={article.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-200"
                          unoptimized
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
                    )}

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
                          {article.views?.toLocaleString() || 0} views
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>

          {/* View More Articles */}
          <div className="text-center mt-12">
            <Link
              href="/articles"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Articles
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
