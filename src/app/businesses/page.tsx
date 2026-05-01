import { serverNewsApi } from '@/lib/api-server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { MapPin, Phone, Globe, Star, Building2 } from 'lucide-react'
import { BusinessSearchAndFilter } from '@/components/businesses/BusinessSearchAndFilter'

export const metadata: Metadata = {
  title: 'Local Businesses | The Riverside Herald',
  description: 'Discover and connect with local businesses in your community. Find services, read reviews, and support local entrepreneurs.',
}

function renderStars(rating: number, size: 'sm' | 'md' = 'sm') {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star key={i} className={`${starSize} fill-yellow-400 text-yellow-400`} />
    )
  }
  
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <Star className={`${starSize} text-gray-300`} />
        <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
          <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
        </div>
      </div>
    )
  }
  
  const remainingStars = 5 - Math.ceil(rating)
  for (let i = 0; i < remainingStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className={`${starSize} text-gray-300`} />
    )
  }
  
  return stars
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

import { getBusinessImageUrl as getBusinessImageUrlUtil } from '@/lib/image-utils'

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
                <article
                  key={business.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden border border-gray-100"
                >
                  <div className="relative h-48 overflow-hidden">
                      <Image
                      src={getBusinessImageUrl(business, 'cover')}
                      alt={business.cover_image?.alt_text || business.name}
                        fill
                        className="object-cover"
                      />
                    {business.is_verified && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Verified</span>
                        </div>
                      </div>
                    )}
                    {business.industry && (
                      <div className="absolute top-4 left-4">
                        <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-full">
                          {business.industry}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {business.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(business.rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          {business.rating.toFixed(1)} ({business.review_count} reviews)
                        </span>
                      </div>
                    </div>

                    {business.description && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {business.description}
                      </p>
                    )}

                    {(business.address || business.city) && (
                      <div className="flex items-start space-x-2 mb-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 line-clamp-1">
                          {business.address && business.city 
                            ? `${business.address}, ${business.city}${business.state ? `, ${business.state}` : ''}`
                            : business.city || business.address
                          }
                        </span>
                      </div>
                    )}

                    {business.services && business.services.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {business.services.slice(0, 3).map((service: string, index: number) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                          {business.services.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                              +{business.services.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-3">
                        {business.phone && (
                          <a 
                            href={`tel:${business.phone}`}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            Call
                          </a>
                        )}
                        {business.website_url && (
                          <a 
                            href={business.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Globe className="w-4 h-4 mr-1" />
                            Visit
                          </a>
                        )}
                      </div>
                      
                      {business.slug && (
                        <Link 
                          href={`/businesses/${business.slug}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
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
                <article
                  key={business.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-100"
                >
                  <div className="relative h-40 overflow-hidden">
                      <Image
                      src={getBusinessImageUrl(business, 'cover')}
                      alt={business.cover_image?.alt_text || business.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-200"
                      />
                    {business.industry && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-full">
                          {business.industry}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                      {business.name}
                    </h3>

                    <div className="flex items-center space-x-2 mb-3">
                      <div className="flex items-center space-x-1">
                        {renderStars(business.rating, 'sm')}
                      </div>
                      <span className="text-xs text-gray-600">
                        {business.rating.toFixed(1)} ({business.review_count})
                      </span>
                    </div>

                    {business.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {business.description}
                      </p>
                    )}

                    {business.city && (
                      <div className="flex items-center space-x-1 mb-3">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600">
                          {business.city}{business.state ? `, ${business.state}` : ''}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        {business.phone && (
                          <a 
                            href={`tel:${business.phone}`}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            <Phone className="w-3 h-3" />
                          </a>
                        )}
                        {business.website_url && (
                          <a 
                            href={business.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            <Globe className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      
                      {business.slug && (
                        <Link 
                          href={`/businesses/${business.slug}`}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800"
                        >
                          Details →
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
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
