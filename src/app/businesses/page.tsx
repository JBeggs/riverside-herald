import { serverNewsApi } from '@/lib/api-server'
import type { Metadata } from 'next'
import { Star, Building2 } from 'lucide-react'
import { BusinessSearchAndFilter } from '@/components/businesses/BusinessSearchAndFilter'
import { loadSiteSettingsMap, siteLabelFromMap } from '@/lib/site-settings'
import { getBusinessImageUrl as getBusinessImageUrlUtil, ARTICLE_IMAGE_PLACEHOLDER } from '@/lib/image-utils'
import { FeaturedBusinessListingCard, GridBusinessListingCard } from '@/components/businesses/BusinessListingCard'

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
    
    return businesses.map((business: any) => ({
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
      logo: business.logo ? {
        file_url: business.logo.file_url,
        alt_text: `${business.name} logo`
      } : business.logo_url ? { file_url: business.logo_url, alt_text: `${business.name} logo` } : null,
      cover_image: business.cover_image ? {
        file_url: business.cover_image.file_url,
        alt_text: `${business.name} cover`
      } : null,
    }))
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

function getBusinessImageUrl(business: any, type: 'logo' | 'cover' = 'cover') {
  return getBusinessImageUrlUtil(business, type)
}

export default async function BusinessesPage() {
  const [businesses, industries] = await Promise.all([
    getBusinesses(),
    getIndustries()
  ])

  const featuredBusinesses = businesses.filter((b: any) => b.is_verified).slice(0, 3)
  const otherBusinesses = businesses.filter((b: any) => !featuredBusinesses.some((fb: any) => fb.id === b.id))

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 py-16">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Local Businesses
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Discover and connect with local businesses in your community. Find services, read reviews, and support local entrepreneurs.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Component */}
      <BusinessSearchAndFilter businesses={businesses as any} industries={industries} />

      <div className="container-wide py-12">
        {/* Featured Businesses */}
        {featuredBusinesses.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center space-x-3 mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured Businesses</h2>
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                <Star className="w-3 h-3 fill-current" />
                <span>Verified</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-cy="businesses-list">
              {featuredBusinesses.map((business: any) => (
                <FeaturedBusinessListingCard
                  key={business.id}
                  business={business}
                  coverSrc={getBusinessImageUrl(business, 'cover') || ARTICLE_IMAGE_PLACEHOLDER}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Businesses */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {featuredBusinesses.length > 0 ? 'All Businesses' : 'Our Local Businesses'}
          </h2>
          
          {otherBusinesses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {otherBusinesses.map((business: any) => (
                <GridBusinessListingCard
                  key={business.id}
                  business={business}
                  coverSrc={getBusinessImageUrl(business, 'cover') || ARTICLE_IMAGE_PLACEHOLDER}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Businesses Found</h3>
              <p className="text-gray-600">
                There are no businesses listed at the moment. Check back later!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
