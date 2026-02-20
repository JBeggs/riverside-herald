import { serverNewsApi } from '@/lib/api-server'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, TrendingUp } from 'lucide-react'
import { getArticleImageUrl, getBusinessImageUrl as getBusinessImageUrlUtil } from '@/lib/image-utils'
import FeaturedBusinessCard from '@/components/businesses/FeaturedBusinessCard'

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
  review_count?: number
  website_url?: string
  phone?: string
  email?: string
  is_verified?: boolean
  logo?: {
    file_url: string
  }
  cover_image?: {
    file_url: string
  }
  products?: Array<{
    id: string
    name: string
    price?: number
    currency?: string
    image?: { file_url: string }
    description?: string
  }>
}

interface SiteSettings {
  site_name: string
  site_tagline: string
  breaking_news_enabled: boolean
}

async function getHomepageData() {
  try {
    // Get site settings
    const settingsData: any = await serverNewsApi.siteSettings.list({ skipTenant: true })
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
      page: 1,
      skipTenant: true
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

    // Get businesses with products for enhanced display
    let businessesData: any
    try {
      businessesData = await serverNewsApi.businesses.listEnhanced({ 
        skipTenant: true,
        includeProducts: true // Include products for featured display
      })
      console.log('📋 Homepage businesses data:', {
        hasData: !!businessesData,
        isArray: Array.isArray(businessesData),
        count: Array.isArray(businessesData) ? businessesData.length : (businessesData?.results?.length || 0)
      })
    } catch (businessError) {
      console.error('❌ Failed to fetch enhanced businesses, falling back to basic:', businessError)
      // Fallback to basic business list if enhanced fails
      try {
        businessesData = await serverNewsApi.businesses.list({ skipTenant: true })
        console.log('📋 Fallback businesses data:', {
          hasData: !!businessesData,
          count: Array.isArray(businessesData) ? businessesData.length : (businessesData?.results?.length || 0)
        })
      } catch (fallbackError) {
        console.error('❌ Even basic business fetch failed:', fallbackError)
        businessesData = []
      }
    }
    const businessesArray = Array.isArray(businessesData) ? businessesData : (businessesData?.results || [])
    const businesses: Business[] = businessesArray.map((business: any) => ({
      id: business.id,
      name: business.name,
      slug: business.slug,
      description: business.description || '',
      industry: business.industry || '',
      city: business.address_city || business.city || '',
      rating: parseFloat(business.rating) || 0,
      review_count: business.review_count || 0,
      website_url: business.website || business.website_url,
      phone: business.phone,
      email: business.email,
      is_verified: business.is_verified,
      logo: business.logo ? {
        file_url: business.logo.file_url
      } : business.logo_url ? { file_url: business.logo_url } : undefined,
      cover_image: business.cover_image ? {
        file_url: business.cover_image.file_url
      } : undefined,
      products: business.products || [],
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
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <span className="breaking-news-text flex-shrink-0">Breaking News</span>
              <Link href={`/articles/${breakingNews.slug}`} className="hover:underline line-clamp-1 sm:line-clamp-none">
                <span className="font-medium text-sm sm:text-base">{breakingNews.title}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-neutral-50 to-white" data-cy="home-featured">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h1 className="heading-xl mb-4">{siteName}</h1>
            <p className="text-xl text-neutral-600 mb-8">{tagline}</p>
          </div>

          {/* Featured Articles Grid */}
          {featuredArticles.length > 0 && (
            <div className="news-grid news-grid-main mb-16" data-cy="article-list">
              {/* Main Featured Article */}
              <div className="md:col-span-1 lg:col-span-2 xl:col-span-2">
                <article className="card-elevated p-4 md:p-6">
                  <div className="relative mb-4">
                    {getImageUrl(featuredArticles[0]) && (
                      <Image
                        src={getImageUrl(featuredArticles[0])}
                        alt={featuredArticles[0]?.title}
                        width={800}
                        height={400}
                        className="news-image-featured h-64 sm:h-80 md:h-96 lg:h-[500px]"
                      />
                    )}
                    {featuredArticles[0]?.category && (
                      <span 
                        className="absolute top-3 left-3 md:top-4 md:left-4 tag tag-accent"
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
                  <p className="body-lg mb-4 line-clamp-3 md:line-clamp-none">{featuredArticles[0]?.excerpt}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs md:text-sm text-neutral-500 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3 md:space-x-4">
                      <span className="truncate max-w-[150px]">By {featuredArticles[0]?.author_name || 'Staff Writer'}</span>
                      <span className="flex items-center flex-shrink-0">
                        <Clock className="w-4 h-4 mr-1" />
                        {featuredArticles[0]?.read_time_minutes || 5} min read
                      </span>
                    </div>
                    <time className="flex-shrink-0">{formatDate(featuredArticles[0]?.published_at)}</time>
                  </div>
                </article>
              </div>

              {/* Side Articles */}
              <div className="md:col-span-1 lg:col-span-1 xl:col-span-2 space-y-4 md:space-y-6">
                {featuredArticles.slice(1, 4).map((article) => (
                  <article key={article.id} className="card p-3 md:p-4">
                    <div className="flex space-x-3 md:space-x-4">
                      {getImageUrl(article) && (
                        <div className="flex-shrink-0">
                          <Image
                            src={getImageUrl(article)}
                            alt={article.title}
                            width={120}
                            height={80}
                            className="w-20 h-16 md:w-24 md:h-20 object-cover rounded"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {article.category && (
                          <span 
                            className="tag tag-primary mb-1 md:mb-2"
                            style={{ backgroundColor: `${article.category.color}20`, color: article.category.color }}
                          >
                            {article.category.name}
                          </span>
                        )}
                        <h3 className="heading-xs mb-1 md:mb-2 line-clamp-2">
                          <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                            {article.title}
                          </Link>
                        </h3>
                        <div className="flex items-center text-[10px] md:text-xs text-neutral-500 truncate">
                          <span className="truncate max-w-[80px] md:max-w-none">{article.author_name || 'Staff Writer'}</span>
                          <span className="mx-1 md:mx-2 flex-shrink-0">•</span>
                          <time className="flex-shrink-0">{new Date(article.published_at).toLocaleDateString()}</time>
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
      <section className="py-8 md:py-12">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Trending Articles */}
            <div className="lg:col-span-2">
              <div className="section-header">
                <h2 className="section-title">Latest News</h2>
                <Link href="/articles" className="btn btn-secondary text-xs md:text-sm">View All</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {recentArticles.slice(0, 6).map((article) => (
                  <article key={article.id} className="card overflow-hidden">
                    {getImageUrl(article) && (
                      <div className="relative">
                        <Image
                          src={getImageUrl(article)}
                          alt={article.title}
                          width={400}
                          height={200}
                          className="w-full h-40 sm:h-48 object-cover"
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
                    <div className="p-3 md:p-4">
                      <h3 className="heading-xs mb-2 line-clamp-2">
                        <Link href={`/articles/${article.slug}`} className="hover:text-blue-600">
                          {article.title}
                        </Link>
                      </h3>
                      <p className="text-xs md:text-sm mb-3 text-neutral-600 line-clamp-2">{article.excerpt}</p>
                      <div className="flex items-center justify-between text-[10px] md:text-xs text-neutral-500">
                        <span className="truncate max-w-[100px]">{article.author_name || 'Staff Writer'}</span>
                        <time className="flex-shrink-0">{new Date(article.published_at).toLocaleDateString()}</time>
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

              {/* Featured Businesses with Products */}
              {businesses.length > 0 && (
                <div data-cy="business-list">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="heading-sm">Featured Businesses</h3>
                    <Link 
                      href="/businesses" 
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All →
                    </Link>
                  </div>
                  <div className="space-y-6">
                    {businesses.slice(0, 3).map((business) => (
                      <FeaturedBusinessCard
                        key={business.id}
                        business={business}
                        showProducts={true}
                        showWebsiteLink={true}
                      />
                    ))}
                  </div>
                  
                  {/* Debug info - remove in production */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
                      <p>Debug: {businesses.length} businesses found</p>
                      {businesses.slice(0, 3).map(business => (
                        <div key={business.id} className="text-xs">
                          {business.name} - Products: {business.products?.length || 0} - Website: {business.website_url || 'none'}
                        </div>
                      ))}
                    </div>
                  )}
                  {businesses.length > 3 && (
                    <div className="mt-6 text-center">
                      <Link 
                        href="/businesses" 
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Discover {businesses.length - 3} More Businesses
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
