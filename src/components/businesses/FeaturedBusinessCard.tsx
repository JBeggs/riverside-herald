'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Phone, Mail, Globe, CheckCircle } from 'lucide-react'

// Custom ShoppingBag icon to avoid lucide-react version issues
const ShoppingBag = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 12H6L5 9z" />
  </svg>
)

interface Product {
  id: string
  name: string
  price?: number
  currency?: string
  image_id?: string
  image?: { file_url: string }
  description?: string
  externalUrl?: string
}

interface Business {
  id: string
  name: string
  slug: string
  description?: string
  industry?: string
  address_city?: string
  city?: string  // legacy alias
  rating?: number
  review_count?: number
  website?: string
  website_url?: string  // legacy alias
  logo_url?: string
  phone?: string
  email?: string
  is_verified?: boolean
  logo?: { file_url: string }
  cover_image?: { file_url: string }
  products?: Product[]
}

interface FeaturedBusinessCardProps {
  business: Business
  showProducts?: boolean
  showWebsiteLink?: boolean
}

const getImageUrl = (url?: string) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  // For relative URLs, assume they're from the API base
  return `${process.env.NEXT_PUBLIC_API_URL || 'https://3pillars.pythonanywhere.com/api'}${url}`
}

export default function FeaturedBusinessCard({ 
  business, 
  showProducts = true, 
  showWebsiteLink = true 
}: FeaturedBusinessCardProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (key: string) => {
    setImageErrors(prev => ({ ...prev, [key]: true }))
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const formatPrice = (price: number, currency = 'USD') => {
    if (currency === 'ZAR') {
      return `R${price.toFixed(2)}`
    }
    return `$${price.toFixed(2)}`
  }

  const logoUrl = getImageUrl(business.logo?.file_url || (business as any).logo_url)
  const coverUrl = getImageUrl(business.cover_image?.file_url)
  const hasProducts = business.products && business.products.length > 0

  return (
    <article className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
        {coverUrl && !imageErrors.cover ? (
          <Image
            src={coverUrl}
            alt={`${business.name} cover`}
            fill
            className="object-cover"
            onError={() => handleImageError('cover')}
          />
        ) : null}
        
        {/* Verified Badge */}
        {business.is_verified && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 bg-green-600 rounded-full text-white text-xs font-medium shadow-lg">
            <CheckCircle className="w-3 h-3" />
            <span>Verified</span>
          </div>
        )}

        {/* Logo */}
        <div className="absolute -bottom-6 left-4">
          <div className="w-12 h-12 bg-white rounded-lg border-2 border-white shadow-md overflow-hidden">
            {logoUrl && !imageErrors.logo ? (
              <Image
                src={logoUrl}
                alt={`${business.name} logo`}
                width={48}
                height={48}
                className="w-full h-full object-cover"
                onError={() => handleImageError('logo')}
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-lg">
                {business.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Business Info */}
      <div className="pt-8 pb-4 px-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {business.name}
            </h3>
            {business.industry && (
              <p className="text-sm text-gray-600">{business.industry}</p>
            )}
          </div>
        </div>

        {/* Rating */}
        {business.rating && business.rating > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-0.5">
              {renderStars(business.rating)}
            </div>
            <span className="text-sm text-gray-600">
              {business.rating.toFixed(1)} ({business.review_count || 0})
            </span>
          </div>
        )}

        {/* Location */}
        {(business.address_city || business.city) && (
          <div className="flex items-center space-x-2 mb-3 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{business.address_city || business.city}</span>
          </div>
        )}

        {/* Description */}
        {business.description && (
          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
            {business.description}
          </p>
        )}

        {/* Products Section */}
        {showProducts && hasProducts && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">Featured Products</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {business.products!.slice(0, 4).map((product) => {
                const productImageUrl = getImageUrl(product.image?.file_url)
                return (
                  <div key={product.id} className="group cursor-pointer">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-1">
                      {productImageUrl && !imageErrors[`product-${product.id}`] ? (
                        <Image
                          src={productImageUrl}
                          alt={product.name}
                          width={100}
                          height={100}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={() => handleImageError(`product-${product.id}`)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-900 font-medium truncate">{product.name}</p>
                    {product.price && (
                      <p className="text-xs text-gray-600">{formatPrice(product.price, product.currency)}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          {/* Business Detail Link */}
          <Link
            href={`/businesses/${business.slug}`}
            className="w-full py-2 px-4 text-center bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            View Details
          </Link>

          {/* Website Link */}
          {showWebsiteLink && (business.website || business.website_url) && (
            <a
              href={business.website || business.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-4 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>Visit Website</span>
              <Globe className="w-3 h-3" />
            </a>
          )}
          
          {/* Contact Options */}
          {(business.phone || business.email) && (
            <div className="flex space-x-2">
              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex-1 py-2 px-3 text-center bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              )}
              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="flex-1 py-2 px-3 text-center bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <Mail className="w-3 h-3" />
                  <span>Email</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}