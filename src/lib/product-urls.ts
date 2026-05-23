/** Build a link to the product detail page on the business storefront. */
export function normalizeStorefrontOrigin(website?: string | null): string {
  const raw = (website || '').trim().replace(/\/$/, '')
  if (!raw) return ''
  if (!/^https?:\/\//i.test(raw)) return `https://${raw}`
  return raw.replace(/\/$/, '')
}

/**
 * Product URL for Riverside Herald business listings.
 * Always the linked business's own shop site — never supplier/source URLs.
 */
export function buildListingStorefrontProductUrl(
  website?: string | null,
  productSlug?: string | null,
): string {
  const slug = (productSlug || '').trim()
  const origin = normalizeStorefrontOrigin(website)
  if (!origin || !slug) return ''
  return `${origin}/products/${slug.replace(/^\/+/, '')}`
}

/** @deprecated Prefer buildListingStorefrontProductUrl for Herald business pages. */
export function buildProductDetailUrl(options: {
  website?: string | null
  productSlug?: string | null
  canonicalUrl?: string | null
  sourceUrl?: string | null
}): string {
  const fromListing = buildListingStorefrontProductUrl(options.website, options.productSlug)
  if (fromListing) return fromListing

  const canonical = (options.canonicalUrl || '').trim()
  if (canonical) return canonical

  const source = (options.sourceUrl || '').trim()
  if (source) return source

  return ''
}
