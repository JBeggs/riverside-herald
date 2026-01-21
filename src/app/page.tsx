import { serverNewsApi } from '@/lib/api-server'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, TrendingUp } from 'lucide-react'
import { getArticleImageUrl, getBusinessImageUrl as getBusinessImageUrlUtil } from '@/lib/image-utils'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  published_at: string
  is_breaking_news: boolean
  is_trending: boolean
  location_name?: string
  read_time_minutes?: number
  views: number
  featured_media?: {
    file_url: string
    alt_text: string
  }
  author_name: string
  category?: {
    name: string
    slug: string
    color: string
  }
}

interface Business {
  id: string
  name: string
  slug: string
  description: string
  industry: string
  city: string
  rating: number
  logo?: {
    file_url: string
  }
}

interface SiteSettings {
  site_name: string
  site_tagline: string
  breaking_news_enabled: boolean
}

async function getHomepageData() {
  try {
    // Get site settings
    const settingsData: any = await serverNewsApi.siteSettings.list()
    const settingsArray = Array.isArray(settingsData) ? settingsData : (settingsData?.results || [])
    const settingsMap: Record<string, any> = {}
    
    settingsArray.forEach((setting: any) => {
      try {
        settingsMap[setting.key] = setting.type === 'json' 
          ? JSON.parse(setting.value) 
          : setting.value
      } catch {
        settingsMap[setting.key] = setting.value
      }
    })

    // Get articles
    const articlesData: any = await serverNewsApi.articles.list({ 
      status: 'published',
      page: 1 
    })
    
    // Transform articles to match expected format
    const articles: Article[] = (articlesData?.results || articlesData || []).map((article: any) => {
      // Debug: log article data
      console.log('[DEBUG] Article:', article.id, article.title)
      console.log('[DEBUG] featured_media:', article.featured_media)
      console.log('[DEBUG] Full article object:', JSON.stringify(article, null, 2))
      
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        content: article.content || '',
        published_at: article.published_at,
        is_breaking_news: article.is_breaking_news,
        is_trending: article.is_trending,
        read_time_minutes: article.read_time_minutes,
        views: article.views || 0,
        featured_media: article.featured_media && article.featured_media.file_url ? {
          file_url: article.featured_media.file_url,
          alt_text: article.featured_media.alt_text || article.title
        } : undefined,
        author_name: article.author_name || 'Staff Writer',
        category: article.category ? {
          name: article.category.name,
          slug: article.category.slug,
          color: article.category.color
        } : undefined,
      }
    })

    // Get businesses
    const businessesData: any = await serverNewsApi.businesses.list()
    const businesses: Business[] = (businessesData.results || businessesData || []).map((business: any) => ({
      id: business.id,
      name: business.name,
      slug: business.slug,
      description: business.description || '',
      industry: business.industry || '',
      city: business.city || '',
      rating: parseFloat(business.rating) || 0,
      logo: business.logo ? {
        file_url: business.logo.file_url
      } : undefined,
    }))

    // Separate articles by type
    const breakingNews = articles.find(article => article.is_breaking_news) || null
    const featuredArticles = articles.filter(article => !article.is_breaking_news).slice(0, 6)
    const trendingArticles = articles.filter(article => article.is_trending).slice(0, 5)
    const recentArticles = articles.slice(0, 8)

    return {
      settings: settingsMap,
      breakingNews,
      featuredArticles,
      trendingArticles,
      recentArticles,
      businesses
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    return {
      settings: {},
      breakingNews: null,
      featuredArticles: [],
      trendingArticles: [],
      recentArticles: [],
      businesses: []
    }
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getImageUrl(article?: Article) {
  return getArticleImageUrl(article)
}

function getBusinessImageUrl(business?: Business) {
  return getBusinessImageUrlUtil(business, 'logo')
}

export default async function HomePage() {
  const { settings, breakingNews, featuredArticles, trendingArticles, recentArticles, businesses } = await getHomepageData()

  const siteName = settings.site_name || 'The Riverside Herald'
  const tagline = settings.site_tagline || 'Your Local News Source'

  return (
    <div className="bg-white">
      {/* Breaking News Banner */}
      {breakingNews && (
        <div className="breaking-news">
          <div className="container-wide">
            <div className="flex items-center space-x-4">
              <span className="breaking-news-text">Breaking News</span>
              <Link href={`/articles/${breakingNews.slug}`} className="hover:underline">
                <span className="font-medium">{breakingNews.title}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-neutral-50 to-white">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h1 className="heading-xl mb-4">{siteName}</h1>
            <p className="text-xl text-neutral-600 mb-8">{tagline}</p>
          </div>

          {/* Featured Articles Grid */}
          {featuredArticles.length > 0 && (
            <div className="news-grid news-grid-main mb-16">
              {/* Main Featured Article */}
              <div className="lg:col-span-2 xl:col-span-2">
                <article className="card-elevated p-6">
                  <div className="relative mb-4">
                    {getImageUrl(featuredArticles[0]) && (
                      <Image
                        src={getImageUrl(featuredArticles[0])}
                        alt={featuredArticles[0]?.title}
                        width={800}
                        height={400}
                        className="news-image-featured"
                      />
                    )}
                    {featuredArticles[0]?.category && (
                      <span 
                        className="absolute top-4 left-4 tag tag-accent"
                        style={{ backgroundColor: featuredArticles[0].category.color }}
                      >
                        {featuredArticles[0].category.name}
                      </span>
                    )}
                  </div>
                  <h2 className="heading-lg mb-3">
                    <Link href={`/articles/${featuredArticles[0]?.slug}`} className="hover:text-blue-600">
                      {featuredArticles[0]?.title}
                    </Link>
                  </h2>
                  <p className="body-lg mb-4">{featuredArticles[0]?.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-neutral-500">
                    <div className="flex items-center space-x-4">
                      <span>By {featuredArticles[0]?.author_name || 'Staff Writer'}</span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {featuredArticles[0]?.read_time_minutes || 5} min read
                      </span>
                    </div>
                    <time>{formatDate(featuredArticles[0]?.published_at)}</time>
                  </div>
                </article>
              </div>

              {/* Side Articles */}
              <div className="lg:col-span-1 xl:col-span-2 space-y-6">
                {featuredArticles.slice(1, 4).map((article) => (
                  <article key={article.id} className="card p-4">
                    <div className="flex space-x-4">
                      {getImageUrl(article) && (
                        <div className="flex-shrink-0">
                          <Image
                            src={getImageUrl(article)}
                            alt={article.title}
                            width={120}
                            height={80}
                            className="w-20 h-16 object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        {article.category && (
                          <span 
                            className="tag tag-primary mb-2"
                            style={{ backgroundColor: `${article.category.color}20`, color: article.category.color }}
                          >
                            {article.category.name}
                          </span>
                        )}
                        <h3 className="heading-xs mb-2">
                          <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                            {article.title}
                          </Link>
                        </h3>
                        <div className="flex items-center text-xs text-neutral-500">
                          <span>{article.author_name || 'Staff Writer'}</span>
                          <span className="mx-2">•</span>
                          <time>{new Date(article.published_at).toLocaleDateString()}</time>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trending & Recent News */}
      <section className="py-12">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Trending Articles */}
            <div className="lg:col-span-2">
              <div className="section-header">
                <h2 className="section-title">Latest News</h2>
                <Link href="/articles" className="btn btn-secondary">View All</Link>
              </div>
              <div className="news-grid news-grid-secondary">
                {recentArticles.slice(0, 6).map((article) => (
                  <article key={article.id} className="card">
                    {getImageUrl(article) && (
                      <div className="relative">
                        <Image
                          src={getImageUrl(article)}
                          alt={article.title}
                          width={400}
                          height={200}
                          className="news-image"
                        />
                        {article.category && (
                          <span 
                            className="absolute top-3 left-3 tag tag-primary"
                            style={{ backgroundColor: `${article.category.color}20`, color: article.category.color }}
                          >
                            {article.category.name}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="heading-xs mb-2">
                        <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                          {article.title}
                        </Link>
                      </h3>
                      <p className="body-sm mb-3 text-neutral-600 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between text-xs text-neutral-500">
                        <span>{article.author_name || 'Staff Writer'}</span>
                        <time>{new Date(article.published_at).toLocaleDateString()}</time>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Trending */}
              {trendingArticles.length > 0 && (
                <div>
                  <h3 className="heading-sm mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-red-600" />
                    Trending
                  </h3>
                  <div className="space-y-4">
                    {trendingArticles.map((article, index) => (
                      <article key={article.id} className="flex space-x-3">
                        <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold text-sm leading-snug mb-1">
                            <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                              {article.title}
                            </Link>
                          </h4>
                          <div className="text-xs text-neutral-500">
                            {(article.views || 0).toLocaleString()} views • {new Date(article.published_at).toLocaleDateString()}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Local Businesses */}
              {businesses.length > 0 && (
                <div>
                  <h3 className="heading-sm mb-4">Featured Businesses</h3>
                  <div className="space-y-4">
                    {businesses.slice(0, 4).map((business) => {
                      const logoUrl = getBusinessImageUrl(business)
                      return (
                        <article key={business.id} className="card p-4">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {logoUrl ? (
                                <Image
                                  src={logoUrl}
                                  alt={`${business.name} logo`}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded-lg"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-neutral-200 rounded-lg flex items-center justify-center">
                                  <span className="text-neutral-500 text-lg font-semibold">
                                    {business.name?.charAt(0) || '?'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">
                                <Link href={`/businesses/${business.slug}`} className="hover:text-blue-600">
                                  {business.name}
                                </Link>
                              </h4>
                              <p className="text-xs text-neutral-600 mb-1">{business.industry}</p>
                              <div className="flex items-center">
                                <div className="flex text-yellow-400">
                                  {'★'.repeat(Math.floor(business.rating || 0))}
                                </div>
                                <span className="text-xs text-neutral-500 ml-1">
                                  {business.rating} • {business.city}
                                </span>
                              </div>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                  <Link href="/businesses" className="btn btn-secondary w-full mt-4">
                    View All Businesses
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
