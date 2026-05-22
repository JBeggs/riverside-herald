'use client'

import { useMemo, useState } from 'react'
import { resolveProductCardImage } from '@/lib/business-media'
import { getAbsoluteImageUrl } from '@/lib/image-utils'
import { DEFAULT_CURRENCY, formatPrice } from '@/lib/format-price'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ExternalProduct } from '@/lib/business-products'

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
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

type CategoryFilter = {
  key: string
  label: string
  count: number
}

/** Single source of truth for category chip keys and product filtering. */
function productCategoryKey(product: ExternalProduct): string {
  const label = (product.category || '').trim()
  const slug = (product.categorySlug || '').trim()
  if (!label && !slug) return ''
  return (slug || label).toLowerCase()
}

function buildCategoryFilters(products: ExternalProduct[]): CategoryFilter[] {
  const counts = new Map<string, CategoryFilter>()
  for (const product of products) {
    const label = (product.category || '').trim()
    const key = productCategoryKey(product)
    if (!key || !label) continue
    const existing = counts.get(key)
    if (existing) {
      existing.count += 1
    } else {
      counts.set(key, { key, label, count: 1 })
    }
  }
  return Array.from(counts.values()).sort((a, b) => a.label.localeCompare(b.label))
}

export default function ProductGallery({ products, businessName }: ProductGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categoryFilters = useMemo(() => buildCategoryFilters(products), [products])

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products
    return products.filter((product) => productCategoryKey(product) === selectedCategory)
  }, [products, selectedCategory])

  if (!products || products.length === 0) return null

  return (
    <section className="py-12 border-t border-border-default">
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-text">Products</h2>
            <p className="text-text-muted mt-1">Browse offerings from {businessName}</p>
          </div>
          <div className="hidden sm:flex items-center text-primary font-medium">
            <ShoppingBag className="w-5 h-5 mr-2" />
            <span>Direct from Shop</span>
          </div>
        </div>

        {categoryFilters.length > 0 ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter products by category">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={[
                'px-4 py-2 rounded-full text-sm font-medium border transition-colors',
                selectedCategory === null
                  ? 'bg-primary text-on-primary border-primary'
                  : 'bg-surface text-text border-border-default hover:bg-[rgb(var(--color-surface-raised)/0.85)]',
              ].join(' ')}
            >
              All ({products.length})
            </button>
            {categoryFilters.map((category) => (
              <button
                key={category.key}
                type="button"
                onClick={() => setSelectedCategory(category.key)}
                className={[
                  'px-4 py-2 rounded-full text-sm font-medium border transition-colors',
                  selectedCategory === category.key
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface text-text border-border-default hover:bg-[rgb(var(--color-surface-raised)/0.85)]',
                ].join(' ')}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {filteredProducts.length === 0 ? (
        <p className="text-text-muted text-sm">No products in this category.</p>
      ) : (
        <motion.div
          key={selectedCategory ?? 'all'}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {filteredProducts.map((product) => {
            const imageSrc = productCardImageUrl(product)
            const detailUrl = (product.externalUrl || '').trim()
            return (
              <motion.div
                key={product.id}
                variants={item}
                className="group bg-surface rounded-2xl border border-border-default overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col h-full"
              >
                <div className="relative aspect-square overflow-hidden bg-[rgb(var(--color-surface-raised)/0.85)]">
                  <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized={imageSrc.startsWith('http')}
                  />
                  {product.category ? (
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-[rgb(var(--color-surface)/0.9)] backdrop-blur-sm text-text text-xs font-bold rounded-full shadow-sm">
                        {product.category}
                      </span>
                    </div>
                  ) : null}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <h3 className="font-bold text-text group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <span className="font-bold text-primary whitespace-nowrap">
                      {formatPrice(
                        typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                        product.currency,
                        DEFAULT_CURRENCY,
                      )}
                    </span>
                  </div>

                  <p className="text-sm text-text-muted line-clamp-2 mb-6 flex-1">
                    {product.description}
                  </p>

                  {detailUrl ? (
                    <a
                      href={detailUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full px-4 py-3 bg-primary text-on-primary text-sm font-bold rounded-xl hover:opacity-90 transition-colors group/btn"
                    >
                      <span>View on Website</span>
                      <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                    </a>
                  ) : null}
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </section>
  )
}
