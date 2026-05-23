import { describe, expect, it } from 'vitest'
import { buildListingStorefrontProductUrl, buildProductDetailUrl } from './product-urls'

describe('buildListingStorefrontProductUrl', () => {
  it('builds storefront product detail URL from business listing website + slug', () => {
    expect(
      buildListingStorefrontProductUrl('https://javamellow.co.za', 'vanilla-bean-bourbon'),
    ).toBe('https://javamellow.co.za/products/vanilla-bean-bourbon')
  })

  it('ignores supplier source_url — listing website only', () => {
    expect(
      buildListingStorefrontProductUrl('https://javamellow.co.za', 'vanilla-bean-bourbon'),
    ).toBe('https://javamellow.co.za/products/vanilla-bean-bourbon')
  })

  it('returns empty when website or slug missing', () => {
    expect(buildListingStorefrontProductUrl('', 'x')).toBe('')
    expect(buildListingStorefrontProductUrl('https://example.com', '')).toBe('')
  })
})

describe('buildProductDetailUrl', () => {
  it('prefers listing storefront over canonical/source fallbacks', () => {
    expect(
      buildProductDetailUrl({
        website: 'https://javamellow.co.za',
        productSlug: 'vanilla-bean-bourbon',
        canonicalUrl: 'https://temu.com/some-supplier-listing',
        sourceUrl: 'https://temu.com/some-supplier-listing',
      }),
    ).toBe('https://javamellow.co.za/products/vanilla-bean-bourbon')
  })

  it('falls back to source only when business website is missing', () => {
    expect(
      buildProductDetailUrl({
        website: '',
        productSlug: 'x',
        sourceUrl: 'https://temu.com/listing',
      }),
    ).toBe('https://temu.com/listing')
  })
})
