'use client'

import Link from 'next/link'
import { MapPin, Star, Phone, Mail, Globe, CheckCircle } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'
import { getAbsoluteImageUrl } from '@/lib/image-utils'

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
  city?: string
  rating?: number
  review_count?: number
  website?: string
  website_url?: string
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
  /** From SiteSetting `default_currency` when product has no currency */
  defaultCurrency?: string
  /** Larger cover + more context for homepage slideshow */
  prominent?: boolean
}

function resolveImageUrl(url?: string | null) {
  if (!url) return null
  return getAbsoluteImageUrl(url)
}

export default function FeaturedBusinessCard({
  business,
  showProducts = true,
  showWebsiteLink = true,
  defaultCurrency = 'USD',
  prominent = false,
}: FeaturedBusinessCardProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const formatPrice = (price: number, currency?: string) => {
    const cur = (currency || defaultCurrency || 'USD').toUpperCase()
    if (cur === 'ZAR') {
      return `R${price.toFixed(2)}`
    }
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(price)
    } catch {
      return `$${price.toFixed(2)}`
    }
  }

  const logoUrl = resolveImageUrl(business.logo?.file_url || (business as any).logo_url)
  const coverUrl = resolveImageUrl(business.cover_image?.file_url)
  const hasProducts = business.products && business.products.length > 0

  return (
    <article className="bg-surface rounded-xl border border-border-default shadow-card hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Cover: keep overflow hidden only on this band */}
      <div className={`relative overflow-hidden bg-gradient-to-r from-primary/80 to-accent/40 ${prominent ? 'h-44 md:h-52' : 'h-32'}`}>
        {coverUrl ? (
          <SafeImage src={coverUrl} alt="" fill imgClassName="object-cover" />
        ) : null}

        {business.is_verified ? (
          <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 bg-green-600 rounded-full text-white text-xs font-medium shadow-lg z-[1]">
            <CheckCircle className="w-3 h-3" />
            <span>Verified</span>
          </div>
        ) : null}
      </div>

      {/* Logo overlaps cover from below — not clipped by cover overflow */}
      <div className={`relative z-[1] pb-1 ${prominent ? 'px-5 -mt-10' : 'px-4 -mt-8'}`}>
        <div className={`rounded-lg border-2 border-surface shadow-md overflow-hidden bg-surface ${prominent ? 'w-16 h-16' : 'w-12 h-12'}`}>
          {logoUrl ? (
            <SafeImage
              src={logoUrl}
              alt=""
              width={prominent ? 64 : 48}
              height={prominent ? 64 : 48}
              className="rounded-md"
              imgClassName="h-full w-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[rgb(var(--color-surface-raised)/0.85)] flex items-center justify-center text-text font-semibold text-lg">
              {business.name?.charAt(0) || '?'}
            </div>
          )}
        </div>
      </div>

      <div className={`pt-3 pb-4 ${prominent ? 'px-5' : 'px-4'}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-text truncate ${prominent ? 'text-xl md:text-2xl' : 'text-lg'}`}>{business.name}</h3>
            {business.industry ? <p className={`text-text-muted ${prominent ? 'text-sm md:text-base mt-1' : 'text-sm'}`}>{business.industry}</p> : null}
          </div>
        </div>

        {business.rating != null && business.rating > 0 ? (
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-0.5">{renderStars(business.rating)}</div>
            <span className="text-sm text-text-muted">
              {business.rating.toFixed(1)} ({business.review_count || 0})
            </span>
          </div>
        ) : null}

        {(business.address_city || business.city) ? (
          <div className="flex items-center space-x-2 mb-3 text-text-muted">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{business.address_city || business.city}</span>
          </div>
        ) : null}

        {business.description ? (
          <p className={`text-text-muted mb-4 ${prominent ? 'text-sm md:text-base line-clamp-4' : 'text-sm line-clamp-2'}`}>
            {business.description}
          </p>
        ) : null}

        {showProducts && hasProducts ? (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-text-muted" />
              <span className="text-sm font-medium text-text">Featured Products</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {business.products!.slice(0, 4).map((product) => {
                const productImageUrl = resolveImageUrl(product.image?.file_url)
                return (
                  <div key={product.id} className="group cursor-pointer">
                    <div className="aspect-square bg-[rgb(var(--color-surface-raised)/0.85)] rounded-lg overflow-hidden mb-1 relative">
                      {productImageUrl ? (
                        <SafeImage
                          src={productImageUrl}
                          alt=""
                          width={100}
                          height={100}
                          className="rounded-lg"
                          imgClassName="h-full w-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-text-muted" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-text font-medium truncate">{product.name}</p>
                    {product.price != null ? (
                      <p className="text-xs text-text-muted">
                        {formatPrice(product.price, product.currency)}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col space-y-2">
          <Link
            href={`/businesses/${business.slug}`}
            className="w-full py-2 px-4 text-center bg-[rgb(var(--color-surface-raised)/0.85)] text-text rounded-lg hover:bg-[rgb(var(--color-border)/0.25)] transition-colors text-sm font-medium border border-border-default"
          >
            View Details
          </Link>

          {showWebsiteLink && (business.website || business.website_url) ? (
            <a
              href={business.website || business.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 px-4 text-center bg-primary text-[rgb(var(--color-on-accent))] rounded-lg hover:opacity-90 transition-opacity text-sm font-medium flex items-center justify-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>Visit Website</span>
            </a>
          ) : null}

          {(business.phone || business.email) ? (
            <div className="flex space-x-2">
              {business.phone ? (
                <a
                  href={`tel:${business.phone}`}
                  className="flex-1 py-2 px-3 text-center bg-green-500/15 text-green-800 dark:text-green-300 rounded-lg hover:bg-green-500/25 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call</span>
                </a>
              ) : null}
              {business.email ? (
                <a
                  href={`mailto:${business.email}`}
                  className="flex-1 py-2 px-3 text-center bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <Mail className="w-3 h-3" />
                  <span>Email</span>
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
