'use client'

import { resolveProductCardImage } from '@/lib/business-media'
import { getAbsoluteImageUrl } from '@/lib/image-utils'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ExternalProduct } from '@/lib/business-products'

// Custom SVG icon for ArrowUpRight since it's missing in the current lucide-react version
const ArrowUpRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
  </svg>
)

const ShoppingBag = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
)

interface ProductGalleryProps {
  products: ExternalProduct[]
  businessName: string
}

function productCardImageUrl(product: ExternalProduct & { image?: unknown; image_thumbnail?: string }): string {
  const fromProp = (product.imageUrl || '').trim()
  if (fromProp) return getAbsoluteImageUrl(fromProp)
  const resolved = resolveProductCardImage(product as Parameters<typeof resolveProductCardImage>[0])
  return getAbsoluteImageUrl(resolved?.file_url || '')
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function ProductGallery({ products, businessName }: ProductGalleryProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="py-12 border-t border-border-default">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-text">Featured Products</h2>
          <p className="text-text-muted mt-1">Explore the latest offerings from {businessName}</p>
        </div>
        <div className="hidden sm:flex items-center text-primary font-medium">
          <ShoppingBag className="w-5 h-5 mr-2" />
          <span>Direct from Shop</span>
        </div>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
      >
        {products.map((product) => {
          const imageSrc = productCardImageUrl(product)
          return (
          <motion.div
            key={product.id}
            variants={item}
            className="group bg-surface rounded-2xl border border-border-default overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col h-full"
          >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-[rgb(var(--color-surface-raised)/0.85)]">
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                unoptimized={imageSrc.startsWith('http')}
              />
              {(product.category) && (
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-[rgb(var(--color-surface)/0.9)] backdrop-blur-sm text-text text-xs font-bold rounded-full shadow-sm">
                    {product.category}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-text group-hover:text-primary transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <span className="font-bold text-primary whitespace-nowrap ml-2">
                  {product.currency || 'ZAR'} {typeof product.price === 'string' ? parseFloat(product.price).toFixed(2) : product.price.toFixed(2)}
                </span>
              </div>
              
              <p className="text-sm text-text-muted line-clamp-2 mb-6 flex-1">
                {product.description}
              </p>

              <a
                href={product.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-3 bg-primary text-[rgb(var(--color-on-accent))] text-sm font-bold rounded-xl hover:opacity-90 transition-colors group/btn"
              >
                <span>View on Website</span>
                <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
              </a>
            </div>
          </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
