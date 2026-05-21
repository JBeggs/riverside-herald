import { serverNewsApi } from '@/lib/api-server'
import type { Metadata } from 'next'
import { BusinessSearchAndFilter } from '@/components/businesses/BusinessSearchAndFilter'
import { loadSiteSettingsMap, siteLabelFromMap } from '@/lib/site-settings'
import { getEcommerceCompanySlug, mapCoverImageForCard, resolveBusinessLogo } from '@/lib/business-media'
import { getMediaCardUrl } from '@/lib/image-utils'

export async function generateMetadata(): Promise<Metadata> {
  const map = await loadSiteSettingsMap()
  const name = siteLabelFromMap(map, 'site_name', 'News')
  return {
    title: `Local Businesses | ${name}`,
    description:
      'Discover and connect with local businesses in your community. Find services, read reviews, and support local entrepreneurs.',
  }
}

async function getBusinesses() {
  try {
    const businessesData: any = await serverNewsApi.businesses.list({ skipTenant: true })
    const businesses = businessesData?.results || businessesData || []

    const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '')
    const bannerBySlug = new Map<string, string>()

    await Promise.all(
      businesses.map(async (business: any) => {
        const heroSlug = getEcommerceCompanySlug(business)
        if (!heroSlug) return
        try {
          const response = await fetch(
            `${apiBaseUrl}/news/page-heroes/?page_slug=home&enabled=true`,
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Company-Slug': heroSlug,
              },
              cache: 'no-store',
            }
          )
          if (!response.ok) return
          const data: any = await response.json()
          const rows = Array.isArray(data) ? data : (data?.results || [])
          const heroImage = rows?.[0]?.image
          const imageUrl = getMediaCardUrl(heroImage)
          if (imageUrl) {
            bannerBySlug.set(String(business.slug || heroSlug), imageUrl)
          }
        } catch {
          // Ignore per-business banner fetch failures.
        }
      })
    )

    return businesses.map((business: any) => {
      const slug = String(business.slug || '')
      const homeBanner = bannerBySlug.get(slug)

      return {
        id: business.id,
        name: business.name,
        slug: business.slug,
        description: business.description || '',
        long_description: business.long_description || '',
        industry: business.industry || '',
        website_url: business.website || business.website_url || '',
        website: business.website || '',
        phone: business.phone || '',
        email: business.email || '',
        address: business.address_street || business.address || '',
        address_street: business.address_street || '',
        address_city: business.address_city || '',
        city: business.address_city || business.city || '',
        address_province: business.address_province || '',
        state: business.address_province || business.state || '',
        address_postal_code: business.address_postal_code || '',
        zip_code: business.address_postal_code || business.zip_code || '',
        address_country: business.address_country || '',
        services: business.services || [],
        is_verified: business.is_verified || false,
        rating: parseFloat(business.rating) || 0,
        review_count: business.review_count || 0,
        business_hours: business.business_hours || {},
        social_links: business.social_links || {},
        created_at: business.created_at,
        owner_id: business.owner,
        logo: resolveBusinessLogo(business),
        cover_image: mapCoverImageForCard(
          business.cover_image,
          `${business.name} cover`,
          homeBanner,
        ),
      }
    })
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return []
  }
}

async function getIndustries() {
  try {
    const businessesData: any = await serverNewsApi.businesses.list({ skipTenant: true })
    const businesses = businessesData?.results || businessesData || []
    const industries = [...new Set(businesses.map((b: any) => b.industry).filter(Boolean))] as string[]
    return industries.sort()
  } catch (error: any) {
    console.error('Error fetching industries:', {
      message: error?.message || 'Unknown error',
      code: error?.code,
      status: error?.status,
      url: error?.url,
      details: error?.details,
      fullError: error
    })
    return []
  }
}

export default async function BusinessesPage() {
  const [businesses, industries] = await Promise.all([
    getBusinesses(),
    getIndustries()
  ])

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Header */}
      <div className="bg-[rgb(var(--color-surface-raised)/0.35)] py-16 border-b border-border-default">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-text mb-6">
              Local Businesses
            </h1>
            <p className="text-xl text-text-muted leading-relaxed">
              Discover and connect with local businesses in your community. Find services, read reviews, and support local entrepreneurs.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Component */}
      <BusinessSearchAndFilter businesses={businesses as any} industries={industries} />
    </div>
  )
}
