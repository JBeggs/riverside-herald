import { serverNewsApi } from '@/lib/api-server'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import { getArticleImageUrl } from '@/lib/image-utils'
import FeaturedBusinessCard from '@/components/businesses/FeaturedBusinessCard'
import {
  HomeFeaturedArticleBlock,
  HomeGridArticleBlock,
  HomeSideArticleBlock,
  HomeTrendingMeta,
} from '@/components/home/HomeArticleBlocks'

interface Article {
  id: string
  title: string
  slug: string
  subtitle?: string
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
      return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        subtitle: article.subtitle || '',
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
        includeProducts: true,
      })
    } catch (businessError) {
      console.error('Failed to fetch enhanced businesses, falling back to basic:', businessError)
      try {
        businessesData = await serverNewsApi.businesses.list({ skipTenant: true })
      } catch (fallbackError) {
        console.error('Basic business fetch failed:', fallbackError)
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

function getImageUrl(article?: Article) {
  const u = getArticleImageUrl(article)
  return u || null
}

export default async function HomePage() {
  const { settings, breakingNews, featuredArticles, trendingArticles, recentArticles, businesses } = await getHomepageData()

  const siteName = String(settings.site_name ?? '').trim() || 'Community News'
  const tagline = String(settings.site_tagline ?? '').trim() || 'Local stories and updates'
  const defaultLocale = String(settings.default_locale ?? '').trim() || 'en-ZA'
  const defaultCurrency = String(settings.default_currency ?? '').trim() || 'USD'

  return (
    <div className="bg-bg min-h-screen">
      {/* Breaking News Banner */}
      {breakingNews && (
        <div className="breaking-news">
          <div className="container-wide">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
              <span className="breaking-news-text flex-shrink-0">Breaking News</span>
              <div className="min-w-0 flex-1">
                <Link href={`/articles/${breakingNews.slug}`} className="hover:underline block">
                  <span className="font-medium text-sm sm:text-base line-clamp-2">{breakingNews.title}</span>
                  {breakingNews.subtitle ? (
                    <span className="block text-xs sm:text-sm text-white/90 mt-1 line-clamp-2 font-normal">
                      {breakingNews.subtitle}
                    </span>
                  ) : null}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-neutral-50 to-bg" data-cy="home-featured">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h1 className="heading-xl mb-4">{siteName}</h1>
            <p className="text-xl text-neutral-600 mb-8">{tagline}</p>
          </div>

          {/* Featured Articles Grid */}
          {featuredArticles.length > 0 && (
            <div className="news-grid news-grid-main mb-16" data-cy="article-list">
              <div className="md:col-span-1 lg:col-span-2 xl:col-span-2">
                <HomeFeaturedArticleBlock
                  article={featuredArticles[0]}
                  imageUrl={getImageUrl(featuredArticles[0])}
                  locale={defaultLocale}
                />
              </div>

              <div className="md:col-span-1 lg:col-span-1 xl:col-span-2 space-y-4 md:space-y-6">
                {featuredArticles.slice(1, 4).map((article) => (
                  <HomeSideArticleBlock
                    key={article.id}
                    article={article}
                    imageUrl={getImageUrl(article)}
                    locale={defaultLocale}
                  />
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
                  <HomeGridArticleBlock
                    key={article.id}
                    article={article}
                    imageUrl={getImageUrl(article)}
                    locale={defaultLocale}
                  />
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
                          {article.subtitle ? (
                            <p className="text-xs text-neutral-600 line-clamp-2 mb-1">{article.subtitle}</p>
                          ) : null}
                          <HomeTrendingMeta article={article} locale={defaultLocale} />
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
                  <div
                    className="space-y-6 max-h-[36rem] md:max-h-[44rem] overflow-y-auto pr-2 -mr-2 [scrollbar-gutter:stable]"
                    data-cy="business-list-scroll"
                  >
                    {businesses.map((business) => (
                      <FeaturedBusinessCard
                        key={business.id}
                        business={business}
                        showProducts={true}
                        showWebsiteLink={true}
                        defaultCurrency={defaultCurrency}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-center text-sm text-text-muted">
                    <Link href="/businesses" className="text-primary hover:underline font-medium">
                      View on Businesses page
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
