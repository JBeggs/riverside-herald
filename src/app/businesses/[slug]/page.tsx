import { serverNewsApi } from '@/lib/api-server'
import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Globe, Star, CheckCircle } from 'lucide-react'
import { notFound } from 'next/navigation'
import { BusinessEditButton } from '@/components/businesses/BusinessEditButton'
import ProductGallery from '@/components/businesses/ProductGallery'
import BusinessHeroCover from '@/components/businesses/BusinessHeroCover'
import { getBusinessImageUrl as getBusinessImageUrlUtil, ARTICLE_IMAGE_PLACEHOLDER } from '@/lib/image-utils'
import { loadSiteSettingsMap, siteLabelFromMap } from '@/lib/site-settings'

function formatPhone(phone?: string): string {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

function formatBusinessHours(hours?: any) {
  if (!hours || typeof hours !== 'object') return null
  
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  return daysOfWeek.map((day, index) => {
    const dayData = hours[day]
    
    // Handle object format { open: '...', close: '...' }
    if (dayData && typeof dayData === 'object' && dayData.open && dayData.close) {
      return {
        day: dayNames[index],
        hours: `${dayData.open} - ${dayData.close}`
      }
    } 
    
    // Handle object format { closed: true }
    if (dayData && typeof dayData === 'object' && dayData.closed) {
      return {
        day: dayNames[index],
        hours: 'Closed'
      }
    }

    // Handle string format (e.g. "9:00 am to 5:00 pm")
    if (typeof dayData === 'string' && dayData.trim() !== '') {
      // Capitalize first letter if it's "closed"
      const displayHours = dayData.toLowerCase() === 'closed' ? 'Closed' : dayData
      return {
        day: dayNames[index],
        hours: displayHours
      }
    }

    // Default to Closed
    return {
      day: dayNames[index],
      hours: 'Closed'
    }
  })
}

function renderStars(rating: number, size: 'sm' | 'md' = 'md') {
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

interface BusinessPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getBusiness(slug: string) {
  try {
    const business = await serverNewsApi.businesses.getBySlug(slug)
    
    if (!business) {
      return null
    }

    // Get reviews
    const reviewsData: any = await serverNewsApi.businessReviews.list({ 
      business: business.id,
      is_approved: true 
    })
    const reviews = reviewsData?.results || reviewsData || []

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
      owner_name: business.owner_name || '',
      logo: business.logo ? {
        file_url: business.logo.file_url,
        alt_text: `${business.name} logo`
      } : business.logo_url ? { file_url: business.logo_url, alt_text: `${business.name} logo` } : null,
      cover_image: business.cover_image ? {
        file_url: business.cover_image.file_url,
        alt_text: `${business.name} cover`
      } : null,
      reviews: reviews,
    }
  } catch (error) {
    console.error('Error fetching business:', error)
    return null
  }
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { slug } = await params
  const [business, settingsMap] = await Promise.all([getBusiness(slug), loadSiteSettingsMap()])
  const siteLabel = siteLabelFromMap(settingsMap, 'site_name', 'News')

  if (!business) {
    return {
      title: 'Business Not Found',
    }
  }

  return {
    title: (business as any).seo_title || `${business.name} | ${siteLabel}`,
    description: (business as any).seo_description || business.description || '',
    openGraph: {
      title: business.name,
      description: business.description || '',
      images: business.cover_image?.file_url ? [business.cover_image.file_url] : [],
    },
  }
}

function getBusinessImageUrl(business: any, type: 'logo' | 'cover' = 'cover') {
  return getBusinessImageUrlUtil(business, type)
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { slug } = await params
  const business = await getBusiness(slug)

  if (!business) {
    notFound()
  }

  const businessHours = formatBusinessHours(business.business_hours)
  
  // Fetch products from the real API
  let products: any[] = []
  try {
    if (business.slug) {
      const productsData: any = await serverNewsApi.products.getByBusiness(business.slug)
      products = productsData?.data || []
    }
  } catch (error) {
    console.error('Error fetching products for business:', error)
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Cover Image */}
      <div className="relative h-64 md:h-96 overflow-hidden">
        <BusinessHeroCover src={getBusinessImageUrl(business, 'cover') || ARTICLE_IMAGE_PLACEHOLDER} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        
        {/* Verification Badge */}
        {business.is_verified && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Verified Business</span>
            </div>
          </div>
        )}
      </div>

      {/* Business Header */}
      <div className="container-wide py-6 md:py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3 md:mb-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text">
                {business.name}
              </h1>
            </div>
            
            {business.industry && (
              <p className="text-base md:text-lg text-text-muted mb-3 md:mb-4">{business.industry}</p>
            )}

            {/* Rating */}
            <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
              <div className="flex items-center space-x-0.5 md:space-x-1">
                {renderStars(business.rating || 0, 'sm')}
              </div>
              <span className="text-base md:text-lg font-semibold text-text">
                {(business.rating || 0).toFixed(1)}
              </span>
              <span className="text-sm md:text-base text-text-muted">
                ({business.review_count || 0} {(business.review_count || 0) === 1 ? 'review' : 'reviews'})
              </span>
            </div>

            {/* Location */}
            {(business.address || business.city) && (
              <div className="flex items-start space-x-2 text-sm md:text-base text-text-muted mb-3 md:mb-4">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0" />
                <span>
                  {business.address && business.city 
                    ? `${business.address}, ${business.city}${business.state ? `, ${business.state}` : ''} ${business.zip_code || ''}`
                    : business.city || business.address
                  }
                </span>
              </div>
            )}

            {/* Contact Info */}
            <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
              {business.phone && (
                <a 
                  href={`tel:${business.phone}`}
                  className="flex items-center space-x-2 text-primary hover:opacity-80 min-h-[32px]"
                >
                  <Phone className="w-4 h-4" />
                  <span>{formatPhone(business.phone)}</span>
                </a>
              )}
              {business.email && (
                <a 
                  href={`mailto:${business.email}`}
                  className="flex items-center space-x-2 text-primary hover:opacity-80 min-h-[32px]"
                >
                  <Mail className="w-4 h-4" />
                  <span>{business.email}</span>
                </a>
              )}
              {business.website_url && (
                <a 
                  href={business.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-primary hover:opacity-80 min-h-[32px]"
                >
                  <Globe className="w-4 h-4" />
                  <span>Visit Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Edit Button (for owners) */}
          <div className="mt-2 md:mt-0">
            <BusinessEditButton businessId={business.id} ownerId={business.owner_id} />
          </div>
        </div>
      </div>

      {/* Business Content */}
      <div className="container-wide pb-12">
        {/* Product Gallery Section */}
        {products && products.length > 0 && (
          <div className="mb-12">
            <ProductGallery products={products} businessName={business.name} />
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Description */}
            {business.long_description && (
              <section>
                <h2 className="text-2xl font-bold text-text mb-4">About</h2>
                <div className="prose max-w-none">
                  <p className="text-text-muted leading-relaxed whitespace-pre-line">
                    {business.long_description}
                  </p>
                </div>
              </section>
            )}

            {/* Services */}
            {business.services && business.services.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-text mb-4">Services</h2>
                <div className="flex flex-wrap gap-2">
                  {business.services.map((service: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews */}
            {business.reviews && business.reviews.length > 0 && (
              <section>
                <h2 className="text-xl md:text-2xl font-bold text-text mb-4 md:mb-6">
                  Reviews ({business.review_count})
                </h2>
                <div className="space-y-4 md:space-y-6">
                  {business.reviews.map((review: any) => (
                    <div key={review.id} className="border-b border-border-default pb-4 md:pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 mr-2">
                          <h4 className="font-semibold text-text truncate">
                            {review.reviewer_name || review.reviewer || 'Anonymous'}
                          </h4>
                          {review.title && (
                            <p className="text-sm md:text-base text-text font-medium line-clamp-1">{review.title}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-0.5 flex-shrink-0">
                          {renderStars(review.rating, 'sm')}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm md:text-base text-text-muted mt-2 line-clamp-4 md:line-clamp-none">{review.comment}</p>
                      )}
                      <time className="text-[10px] md:text-sm text-text-muted mt-2 block">
                        {new Date(review.created_at).toLocaleDateString()}
                      </time>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Business Hours */}
            {businessHours && (
              <section className="bg-surface rounded-lg p-6 border border-border-default">
                <h3 className="text-lg font-bold text-text mb-4">Business Hours</h3>
                <div className="space-y-2">
                  {businessHours.map((dayInfo, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="font-medium text-text">{dayInfo.day}</span>
                      <span className="text-text-muted">{dayInfo.hours}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Social Links */}
            {business.social_links && Object.keys(business.social_links).length > 0 && (
              <section className="bg-surface rounded-lg p-6 border border-border-default">
                <h3 className="text-lg font-bold text-text mb-4">Follow Us</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(business.social_links).map(([platform, url]: [string, any]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-[rgb(var(--color-surface-raised)/0.85)] text-text rounded-lg text-sm font-medium hover:bg-[rgb(var(--color-border)/0.25)]"
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
