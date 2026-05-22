import { describe, expect, it } from 'vitest'
import { buildProductDetailUrl } from './product-urls'

describe('buildProductDetailUrl', () => {
  it('builds storefront product detail URL from website + slug', () => {
    expect(
      buildProductDetailUrl({
        website: 'https://javamellow.co.za',
        productSlug: 'vanilla-bean-bourbon',
      }),
    ).toBe('https://javamellow.co.za/products/vanilla-bean-bourbon')
  })

  it('prefers canonical_url when set', () => {
    expect(
      buildProductDetailUrl({
        website: 'https://example.com',
        productSlug: 'x',
        canonicalUrl: 'https://example.com/custom/product/x',
      }),
    ).toBe('https://example.com/custom/product/x')
  })

  it('does not fall back to products listing page', () => {
    expect(
      buildProductDetailUrl({
        website: 'https://example.com',
      }),
    ).toBe('')
  })
})
