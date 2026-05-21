import { describe, expect, it } from 'vitest'
import { resolveBusinessLogo } from './business-media'
import { getLogoCardUrl } from './image-utils'

describe('business-media logo cards', () => {
  it('resolveBusinessLogo exposes thumbnail_url from nested logo', () => {
    const resolved = resolveBusinessLogo({
      name: 'Acme',
      logo: {
        file_url: '/media/logo.png',
        thumbnail_url: '/media/logo-thumb.png',
      },
    })
    expect(resolved?.file_url).toBe('/media/logo.png')
    expect(resolved?.thumbnail_url).toBe('/media/logo-thumb.png')
  })

  it('getLogoCardUrl uses logo thumbnail for cards', () => {
    const resolved = resolveBusinessLogo({
      name: 'Acme',
      logo: {
        file_url: 'https://example.com/media/logo.png',
        thumbnail_url: 'https://example.com/media/logo-thumb.png',
      },
    })
    expect(
      getLogoCardUrl(
        { file_url: resolved!.file_url, thumbnail_url: resolved!.thumbnail_url },
      ),
    ).toBe('https://example.com/media/logo-thumb.png')
  })
})
