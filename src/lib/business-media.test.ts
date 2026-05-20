import { describe, it, expect } from 'vitest'
import {
  getEcommerceCompanySlug,
  resolveBusinessLogo,
  resolveProductImage,
} from './business-media'

describe('business-media', () => {
  it('getEcommerceCompanySlug prefers ecommerce_slug', () => {
    expect(
      getEcommerceCompanySlug({
        slug: 'news-slug',
        ecommerce_slug: 'past-and-present',
      }),
    ).toBe('past-and-present')
  })

  it('resolveBusinessLogo uses nested logo', () => {
    expect(
      resolveBusinessLogo({
        name: 'Past and Present',
        logo: { file_url: '/media/logo.png' },
      }),
    ).toEqual({
      file_url: '/media/logo.png',
      alt_text: 'Past and Present logo',
    })
  })

  it('resolveBusinessLogo falls back to logo_url', () => {
    expect(
      resolveBusinessLogo({
        name: 'Shop',
        logo_url: 'https://cdn.example/logo.png',
      }),
    ).toEqual({
      file_url: 'https://cdn.example/logo.png',
      alt_text: 'Shop logo',
    })
  })

  it('resolveProductImage handles string image and images array', () => {
    expect(resolveProductImage({ image: 'https://cdn.example/p1.jpg' })).toEqual({
      file_url: 'https://cdn.example/p1.jpg',
    })
    expect(resolveProductImage({ images: ['https://cdn.example/p2.jpg'] })).toEqual({
      file_url: 'https://cdn.example/p2.jpg',
    })
  })
})
