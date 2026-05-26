'use client'

import { useMemo, useState } from 'react'
import SafeImage from '@/components/ui/SafeImage'
import { getAbsoluteImageUrl } from '@/lib/image-utils'
import {
  ArticleGalleryLightbox,
  type GallerySlide,
} from '@/components/articles/ArticleGalleryLightbox'

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
      />
    </svg>
  )
}

type GalleryItem = {
  id?: string
  media?: {
    id?: string
    file_url?: string
    thumbnail_url?: string
    alt_text?: string
  }
  caption?: string
}

function normalizeSlides(items: GalleryItem[]): GallerySlide[] {
  return items.flatMap((item) => {
    const fullUrl = item.media?.file_url
    if (!fullUrl) return []
    const alt = item.media?.alt_text || item.caption || 'Gallery image'
    return [
      {
        id: item.id || item.media?.id || fullUrl,
        src: getAbsoluteImageUrl(fullUrl),
        alt,
        caption: item.caption,
      },
    ]
  })
}

function gridImageUrl(item: GalleryItem): string | null {
  const thumb = item.media?.thumbnail_url
  const full = item.media?.file_url
  const url = thumb || full
  return url ? getAbsoluteImageUrl(url) : null
}

type GalleryTileProps = {
  item: GalleryItem
  slideIndex: number
  onOpen: (index: number) => void
  featured?: boolean
}

function GalleryTile({ item, slideIndex, onOpen, featured = false }: GalleryTileProps) {
  const imageUrl = gridImageUrl(item)
  if (!imageUrl) return null

  const alt = item.media?.alt_text || item.caption || 'Gallery image'
  const label = item.caption || alt

  if (featured) {
    return (
      <figure className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => onOpen(slideIndex)}
          className="group relative block w-full overflow-hidden rounded-xl border border-border-default bg-neutral-900/5 md:rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`View full size: ${label}`}
        >
          <div className="relative h-[min(60vh,520px)] w-full sm:aspect-video sm:h-auto sm:max-h-[560px]">
            <SafeImage
              src={imageUrl}
              alt={alt}
              fill
              className="rounded-xl md:rounded-2xl"
              imgClassName="object-contain sm:object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
              <span className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white">
                <ExpandIcon className="h-4 w-4" />
                View full size
              </span>
            </div>
          </div>
        </button>
        {item.caption ? (
          <figcaption className="mt-4 text-base text-text-muted md:text-lg">{item.caption}</figcaption>
        ) : null}
      </figure>
    )
  }

  return (
    <figure className="relative">
      <button
        type="button"
        onClick={() => onOpen(slideIndex)}
        className="group relative block w-full min-h-[44px] overflow-hidden rounded-lg border border-border-default bg-neutral-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={`Open image: ${label}`}
      >
        <div className="relative aspect-[4/3] w-full sm:aspect-[4/5]">
          <SafeImage
            src={imageUrl}
            alt={alt}
            fill
            className="rounded-lg"
            imgClassName="object-contain sm:object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-2 sm:hidden">
            <span className="text-xs font-medium text-white">Tap to view</span>
          </div>
        </div>
      </button>
      {item.caption ? (
        <figcaption className="mt-2 text-sm text-text-muted">{item.caption}</figcaption>
      ) : null}
    </figure>
  )
}

export function ArticleGallery({ items }: { items: GalleryItem[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const slides = useMemo(() => normalizeSlides(items), [items])
  const visibleItems = useMemo(
    () => items.filter((item) => item.media?.file_url),
    [items],
  )

  if (!slides.length) return null

  const openLightbox = (index: number) => {
    setActiveIndex(index)
    setLightboxOpen(true)
  }

  const isSingle = visibleItems.length === 1

  return (
    <>
      <div className="container-wide py-4 md:py-8">
        {isSingle ? (
          <GalleryTile
            item={visibleItems[0]}
            slideIndex={0}
            onOpen={openLightbox}
            featured
          />
        ) : (
          <>
            <h2 className="mb-4 text-xl font-bold text-text md:mb-6 md:text-2xl">Gallery</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {visibleItems.map((item, index) => (
                <GalleryTile
                  key={item.id || item.media?.id || index}
                  item={item}
                  slideIndex={index}
                  onOpen={openLightbox}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <ArticleGalleryLightbox
        isOpen={lightboxOpen}
        slides={slides}
        activeIndex={activeIndex}
        onClose={() => setLightboxOpen(false)}
        onIndexChange={setActiveIndex}
      />
    </>
  )
}
