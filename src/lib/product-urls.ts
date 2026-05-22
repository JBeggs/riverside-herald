/** Build a link to the product detail page on the business storefront. */
export function normalizeStorefrontOrigin(website?: string | null): string {
  const raw = (website || '').trim().replace(/\/$/, '')
  if (!raw) return ''
  if (!/^https?:\/\//i.test(raw)) return `https://${raw}`
  return raw.replace(/\/$/, '')
}

export function buildProductDetailUrl(options: {
  website?: string | null
  productSlug?: string | null
  canonicalUrl?: string | null
  sourceUrl?: string | null
}): string {
  const canonical = (options.canonicalUrl || '').trim()
  if (canonical) return canonical

  const slug = (options.productSlug || '').trim()
  const origin = normalizeStorefrontOrigin(options.website)
  if (origin && slug) {
    return `${origin}/products/${slug.replace(/^\/+/, '')}`
  }

  const source = (options.sourceUrl || '').trim()
  if (source) return source

  return ''
}
