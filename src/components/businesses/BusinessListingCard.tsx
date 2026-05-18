'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Globe, Star } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'

function renderStars(rating: number, size: 'sm' | 'md' = 'sm') {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={i} className={`${starSize} fill-yellow-400 text-yellow-400`} />)
  }

  if (hasHalfStar) {
    stars.push(
      <div key="half" className="relative">
        <Star className={`${starSize} text-gray-300`} />
        <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
          <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
        </div>
      </div>,
    )
  }

  const remainingStars = 5 - Math.ceil(rating)
  for (let i = 0; i < remainingStars; i++) {
    stars.push(<Star key={`empty-${i}`} className={`${starSize} text-gray-300`} />)
  }

  return stars
}

export type BusinessListingCardBusiness = {
  id: string
  name: string
  slug: string
  description?: string
  industry?: string
  is_verified?: boolean
  rating: number
  review_count: number
  address?: string
  city?: string
  state?: string
  phone?: string
  website_url?: string
  services?: string[]
  cover_image?: { file_url?: string; alt_text?: string } | null
}

export function FeaturedBusinessListingCard({
  business,
  coverSrc,
}: {
  business: BusinessListingCardBusiness
  coverSrc: string
}) {
  const [revealed, setRevealed] = useState(false)
  const onLoad = useCallback(() => setRevealed(true), [])

  return (
    <article
      className={`bg-surface rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden border border-border-default ${
        revealed ? 'opacity-100 pointer-events-auto transition-opacity duration-200' : 'opacity-0 pointer-events-none transition-opacity duration-200'
      }`}
    >
      <div className="relative h-48 overflow-hidden">
        <SafeImage
          src={coverSrc}
          alt=""
          fill
          loading="eager"
          imgClassName="object-cover"
          onLoad={onLoad}
        />
        {business.is_verified ? (
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded-full text-xs font-medium">
              <Star className="w-3 h-3 fill-current" />
              <span>Verified</span>
            </div>
          </div>
        ) : null}
        {business.industry ? (
          <div className="absolute top-4 left-4">
            <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-full">{business.industry}</span>
          </div>
        ) : null}
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-text mb-2">{business.name}</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">{renderStars(business.rating)}</div>
            <span className="text-sm text-text-muted">
              {business.rating.toFixed(1)} ({business.review_count} reviews)
            </span>
          </div>
        </div>

        {business.description ? <p className="text-text-muted mb-4 line-clamp-2">{business.description}</p> : null}

        {(business.address || business.city) && (
          <div className="flex items-start space-x-2 mb-3">
            <MapPin className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
            <span className="text-sm text-text-muted line-clamp-1">
              {business.address && business.city
                ? `${business.address}, ${business.city}${business.state ? `, ${business.state}` : ''}`
                : business.city || business.address}
            </span>
          </div>
        )}

        {business.services && business.services.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {business.services.slice(0, 3).map((service: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-[rgb(var(--color-surface-raised)/0.85)] text-text-muted text-xs rounded-full">
                  {service}
                </span>
              ))}
              {business.services.length > 3 && (
                <span className="px-2 py-1 bg-[rgb(var(--color-surface-raised)/0.85)] text-text-muted text-xs rounded-full">
                  +{business.services.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border-default">
          <div className="flex items-center space-x-3">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex items-center text-sm text-primary hover:opacity-80">
                <Phone className="w-4 h-4 mr-1" />
                Call
              </a>
            )}
            {business.website_url && (
              <a
                href={business.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-primary hover:opacity-80"
              >
                <Globe className="w-4 h-4 mr-1" />
                Visit
              </a>
            )}
          </div>

          {business.slug ? (
            <Link href={`/businesses/${business.slug}`} className="text-sm font-medium text-primary hover:opacity-80">
              View Details →
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function GridBusinessListingCard({ business, coverSrc }: { business: BusinessListingCardBusiness; coverSrc: string }) {
  const [revealed, setRevealed] = useState(false)
  const onLoad = useCallback(() => setRevealed(true), [])

  return (
    <article
      className={`bg-surface rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-border-default ${
        revealed ? 'opacity-100 pointer-events-auto transition-opacity duration-200' : 'opacity-0 pointer-events-none transition-opacity duration-200'
      }`}
    >
      <div className="relative h-40 overflow-hidden">
        <SafeImage src={coverSrc} alt="" fill imgClassName="object-cover hover:scale-105 transition-transform duration-200" onLoad={onLoad} />
        {business.industry ? (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-full">{business.industry}</span>
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-text mb-2 line-clamp-1">{business.name}</h3>

        <div className="flex items-center space-x-2 mb-3">
          <div className="flex items-center space-x-1">{renderStars(business.rating, 'sm')}</div>
          <span className="text-xs text-text-muted">
            {business.rating.toFixed(1)} ({business.review_count})
          </span>
        </div>

        {business.description ? <p className="text-text-muted text-sm mb-3 line-clamp-2">{business.description}</p> : null}

        {business.city ? (
          <div className="flex items-center space-x-1 mb-3">
            <MapPin className="w-3 h-3 text-text-muted" />
            <span className="text-xs text-text-muted">
              {business.city}
              {business.state ? `, ${business.state}` : ''}
            </span>
          </div>
        ) : null}

        <div className="flex items-center justify-between pt-3 border-t border-border-default">
          <div className="flex items-center space-x-2">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="text-xs text-primary hover:opacity-80">
                <Phone className="w-3 h-3" />
              </a>
            )}
            {business.website_url && (
              <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:opacity-80">
                <Globe className="w-3 h-3" />
              </a>
            )}
          </div>

          {business.slug ? (
            <Link href={`/businesses/${business.slug}`} className="text-xs font-medium text-primary hover:opacity-80">
              Details →
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
