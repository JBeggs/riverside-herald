'use client'

import SafeImage from '@/components/ui/SafeImage'
import { getAbsoluteImageUrl } from '@/lib/image-utils'

type GalleryItem = {
  id?: string
  media?: { id?: string; file_url?: string; alt_text?: string }
  caption?: string
}

export function ArticleGallery({ items }: { items: GalleryItem[] }) {
  if (!items?.length) return null

  return (
    <div className="container-wide py-4 md:py-8">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-text">Gallery</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {items.map((item) => {
          const imageUrl = item.media?.file_url
          if (!imageUrl) return null
          const absoluteUrl = getAbsoluteImageUrl(imageUrl)
          const alt = item.media?.alt_text || item.caption || 'Gallery image'
          return (
            <div key={item.id || item.media?.id} className="relative group">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-border-default bg-neutral-200">
                <SafeImage
                  src={absoluteUrl}
                  alt={alt}
                  fill
                  className="rounded-lg"
                  imgClassName="object-cover"
                  loading="lazy"
                />
              </div>
              {item.caption ? (
                <p className="text-sm text-text-muted mt-2">{item.caption}</p>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
