import { describe, expect, it } from 'vitest'
import { resolveLinkedInShareThumbnailUrl } from '@/lib/linkedin-share'

describe('resolveLinkedInShareThumbnailUrl', () => {
  it('returns proxied media url for article thumbnails', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://riverside.example'
    const url = resolveLinkedInShareThumbnailUrl({
      social_image: {
        thumbnail_url: '/media/articles/social-thumb.jpg',
        file_url: '/media/articles/social.jpg',
      },
    })
    expect(url).toContain('https://riverside.example/api/media?src=')
  })

  it('returns absolute placeholder when no article image exists', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://riverside.example'
    const url = resolveLinkedInShareThumbnailUrl({
      featured_media: null,
      social_image: null,
    })
    expect(url).toBe('https://riverside.example/image-placeholder.png')
  })
})
