'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, ExternalLink } from 'lucide-react'

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

interface ProductPreviewProps {
  products: Product[]
  businessSlug: string
  externalWebsite?: string
  maxProducts?: number
  showPrices?: boolean
  compact?: boolean
}

const getImageUrl = (url?: string) => {
  if (!url) return null
  if (url.startsWith('http')) return url
  // For relative URLs, assume they're from the API base
  return `${process.env.NEXT_PUBLIC_API_URL || 'https://3pillars.pythonanywhere.com/api'}${url}`
}

export default function ProductPreview({
  products,
  businessSlug,
  externalWebsite,
  maxProducts = 4,
  showPrices = true,
  compact = false
}: ProductPreviewProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }))
  }

  const formatPrice = (price: number, currency = 'USD') => {
    if (currency === 'ZAR') {
      return `R${price.toFixed(2)}`
    }
    return `$${price.toFixed(2)}`
  }

  const displayProducts = products.slice(0, maxProducts)

  if (!displayProducts.length) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-4 h-4 text-gray-600" />
          <h4 className="text-sm font-medium text-gray-900">
            {compact ? 'Products' : 'Featured Products'}
          </h4>
        </div>
        {displayProducts.length < products.length && (
          <span className="text-xs text-gray-500">
            +{products.length - displayProducts.length} more
          </span>
        )}
      </div>

      {/* Products Grid */}
      <div className={`grid gap-3 ${
        compact 
          ? 'grid-cols-2' 
          : maxProducts <= 2 
            ? 'grid-cols-2' 
            : 'grid-cols-2 sm:grid-cols-4'
      }`}>
        {displayProducts.map((product) => {
          const productImageUrl = getImageUrl(product.image?.file_url)
          const productLink = product.externalUrl || externalWebsite || `/businesses/${businessSlug}`
          
          return (
            <div key={product.id} className="group">
              <a
                href={productLink}
                target={product.externalUrl || externalWebsite ? '_blank' : '_self'}
                rel={product.externalUrl || externalWebsite ? 'noopener noreferrer' : undefined}
                className="block"
              >
                {/* Product Image */}
                <div className={`${
                  compact ? 'aspect-square' : 'aspect-[4/3]'
                } bg-gray-100 rounded-lg overflow-hidden mb-2`}>
                  {productImageUrl && !imageErrors[product.id] ? (
                    <Image
                      src={productImageUrl}
                      alt={product.name}
                      width={compact ? 80 : 120}
                      height={compact ? 80 : 90}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={() => handleImageError(product.id)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <ShoppingBag className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} text-gray-400`} />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-1">
                  <p className={`${
                    compact ? 'text-xs' : 'text-sm'
                  } text-gray-900 font-medium line-clamp-2 group-hover:text-blue-600 transition-colors`}>
                    {product.name}
                  </p>
                  
                  {showPrices && product.price && (
                    <p className={`${
                      compact ? 'text-xs' : 'text-sm'
                    } text-gray-600 font-medium`}>
                      {formatPrice(product.price, product.currency)}
                    </p>
                  )}
                  
                  {!compact && product.description && (
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {product.description}
                    </p>
                  )}
                </div>
              </a>
            </div>
          )
        })}
      </div>

      {/* View More Link */}
      {(products.length > maxProducts || externalWebsite) && (
        <div className="pt-2">
          <a
            href={externalWebsite || `/businesses/${businessSlug}`}
            target={externalWebsite ? '_blank' : '_self'}
            rel={externalWebsite ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>
              {products.length > maxProducts 
                ? `View all ${products.length} products` 
                : 'View products'
              }
            </span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  )
}