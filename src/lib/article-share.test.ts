import { describe, expect, it } from 'vitest'
import {
  buildArticleShareImageUrl,
  buildArticleWhatsAppMessage,
} from '@/lib/article-share'

describe('buildArticleWhatsAppMessage', () => {
  it('includes title, excerpt, url, and site name', () => {
    const msg = buildArticleWhatsAppMessage({
      title: 'Local business goes digital',
      excerpt: 'A short summary of the story.',
      pageUrl: 'https://riverside.example/articles/local-business',
      siteName: 'Riverside Herald',
    })
    expect(msg).toContain('Local business goes digital')
    expect(msg).toContain('A short summary of the story.')
    expect(msg).toContain('https://riverside.example/articles/local-business')
    expect(msg).toContain('Read on Riverside Herald')
  })
})

describe('buildArticleShareImageUrl', () => {
  it('proxies article thumbnail through /api/media', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://riverside.example'
    const url = buildArticleShareImageUrl(
      {
        title: 'Test',
        featured_media: {
          thumbnail_url: '/media/news/hero-thumb.jpg',
          file_url: '/media/news/hero.jpg',
        },
      },
      'https://riverside.example',
    )
    expect(url).toContain('https://riverside.example/api/media?src=')
  })
})
