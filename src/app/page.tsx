import { serverNewsApi } from '@/lib/api-server'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import {
  HomeFeaturedArticleBlock,
  HomeGridArticleBlock,
  HomeSideArticleBlock,
  HomeTrendingMeta,
} from '@/components/home/HomeArticleBlocks'
import HomeFeaturedBusinessesSlideshow from '@/components/home/HomeFeaturedBusinessesSlideshow'
import { getArticleImageUrl } from '@/lib/image-utils'

interface Article {
  id: string
  title: string
  slug: string
  subtitle?: string
  excerpt: string
  content: string
  published_at: string
  /** API may send published + featured as status=featured; is_featured is derived in list serializer. */
  status?: string
  is_breaking_news: boolean
  is_trending: boolean
  is_featured: boolean
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
    const [articlesPage1, articlesPage2]: [any, any] = await Promise.all([
      serverNewsApi.articles.list({ 
        status: 'published',
        page: 1,
        skipTenant: true
      }),
      serverNewsApi.articles.list({ 
        status: 'published',
        page: 2,
        skipTenant: true
      }).catch(() => ({ results: [] })),
    ])

    const raw1 = articlesPage1?.results ?? articlesPage1 ?? []
    const raw2 = articlesPage2?.results ?? articlesPage2 ?? []
    const seenIds = new Set<string>()
    const mergedRaw: any[] = []
    for (const article of [...raw1, ...raw2]) {
      const id = article?.id
      if (!id || seenIds.has(id)) continue
      seenIds.add(id)
      mergedRaw.push(article)
    }

    // Transform articles to match expected format
    const articles: Article[] = mergedRaw.map((article: any) => {
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
        status: article.status,
        is_featured: Boolean(article.is_featured) || article.status === 'featured',
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
    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '')
    const businessHomeBannerBySlug = new Map<string, string>()
    await Promise.all(
      businessesArray.map(async (business: any) => {
        const slug = String(business?.slug || '').trim()
        if (!slug) return
        try {
          const response = await fetch(
            `${apiBaseUrl}/news/page-heroes/?page_slug=home&enabled=true`,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Company-Slug': slug,
              },
              cache: 'no-store',
            }
          )
          if (!response.ok) return
          const heroData: any = await response.json()
          const rows = Array.isArray(heroData) ? heroData : (heroData?.results || [])
          const imageUrl = rows?.[0]?.image?.file_url
          if (typeof imageUrl === 'string' && imageUrl.length > 0) {
            businessHomeBannerBySlug.set(slug, imageUrl)
          }
        } catch {
          // Ignore individual banner fetch errors so homepage still renders.
        }
      })
    )

    const businesses: Business[] = businessesArray.map((business: any) => {
      const mappedProducts = Array.isArray(business.products)
        ? business.products.map((product: any) => ({
            ...product,
            image:
              product?.image?.file_url
                ? product.image
                : product?.image
                  ? { file_url: product.image }
                  : undefined,
          }))
        : []
      const bannerFromHomeHero = businessHomeBannerBySlug.get(String(business.slug || ''))

      return {
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
        cover_image: business.cover_image?.file_url
          ? { file_url: business.cover_image.file_url }
          : bannerFromHomeHero
            ? { file_url: bannerFromHomeHero }
            : undefined,
        products: mappedProducts,
      }
    })

    const breakingNews = articles.find(article => article.is_breaking_news) || null

    const nonBreaking = articles.filter((a) => !a.is_breaking_news)
    const featuredPool = nonBreaking.filter((a) => a.is_featured)
    const heroFeaturedIds = new Set<string>()
    const featuredArticles: Article[] = []
    for (const a of featuredPool) {
      if (featuredArticles.length >= 6) break
      if (!heroFeaturedIds.has(a.id)) {
        heroFeaturedIds.add(a.id)
        featuredArticles.push(a)
      }
    }

    const trendingArticles = articles.filter(article => article.is_trending).slice(0, 5)
    const recentArticles = nonBreaking.filter((a) => !heroFeaturedIds.has(a.id)).slice(0, 8)

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

      {/* Hero: featured-first (6 slots) */}
      <section
        className="home-hero-section py-10 md:py-14 bg-gradient-to-b from-neutral-50 via-bg to-bg"
        data-cy="home-featured"
      >
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
            <p className="home-hero-kicker text-primary font-semibold tracking-[0.2em] uppercase text-xs mb-3">
              {siteName}
            </p>
            <h1 className="heading-xl mb-4 text-text">Today&rsquo;s top stories</h1>
            <p className="text-lg md:text-xl text-neutral-600">{tagline}</p>
          </div>

          {featuredArticles.length > 0 && (
            <div data-cy="article-list">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <h2 className="heading-sm font-serif text-text m-0 border-0 pb-0">
                  Featured
                </h2>
                <Link href="/articles" className="text-sm font-semibold text-primary hover:underline">
                  All articles →
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2">
                  <HomeFeaturedArticleBlock
                    article={featuredArticles[0]}
                    imageUrl={getImageUrl(featuredArticles[0])}
                    locale={defaultLocale}
                  />
                </div>
                <div className="space-y-4 md:space-y-5 flex flex-col">
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

              {featuredArticles.length > 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6 md:mt-8">
                  {featuredArticles.slice(4, 6).map((article) => (
                    <HomeGridArticleBlock
                      key={article.id}
                      article={article}
                      imageUrl={getImageUrl(article)}
                      locale={defaultLocale}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {businesses.length > 0 ? (
        <HomeFeaturedBusinessesSlideshow businesses={businesses} defaultCurrency={defaultCurrency} />
      ) : null}

      {/* Latest News — full width; Trending follows below */}
      <section className="home-latest-section py-10 md:py-14 border-t border-border-default">
        <div className="container-wide">
          <div className="section-header">
            <h2 className="section-title">Latest News</h2>
            <Link href="/articles" className="btn btn-secondary text-xs md:text-sm">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {recentArticles.slice(0, 6).map((article) => (
              <HomeGridArticleBlock
                key={article.id}
                article={article}
                imageUrl={getImageUrl(article)}
                locale={defaultLocale}
              />
            ))}
          </div>

          {trendingArticles.length > 0 && (
            <div className="mt-12 md:mt-16 pt-10 md:pt-12 border-t border-border-default">
              <div className="rounded-2xl border border-border-default bg-surface p-5 md:p-8 shadow-card max-w-4xl mx-auto lg:max-w-none">
                <h3 className="heading-sm mb-6 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-red-600 flex-shrink-0" />
                  Trending
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-4">
                  {trendingArticles.map((article, index) => (
                    <article key={article.id} className="flex space-x-3 min-w-0">
                      <span className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-sm leading-snug mb-1">
                          <Link href={`/articles/${article.slug}`} className="hover:text-primary">
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
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
