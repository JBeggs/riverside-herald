'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type GallerySlide = {
  id: string
  src: string
  alt: string
  caption?: string
}

type ArticleGalleryLightboxProps = {
  isOpen: boolean
  slides: GallerySlide[]
  activeIndex: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      {direction === 'left' ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      )}
    </svg>
  )
}

function scrollContainerTo(container: HTMLElement | null, left: number) {
  if (!container) return
  if (typeof container.scrollTo === 'function') {
    container.scrollTo({ left, top: 0 })
    return
  }
  container.scrollLeft = left
}

type GallerySlideImageProps = {
  slide: GallerySlide
  onTap: () => void
  viewportRef?: (node: HTMLDivElement | null) => void
}

function GallerySlideImage({ slide, onTap, viewportRef }: GallerySlideImageProps) {
  const touchRef = useRef({ x: 0, y: 0, time: 0, moved: false })

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    if (!touch) return
    touchRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      moved: false,
    }
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0]
    if (!touch) return
    const dx = Math.abs(touch.clientX - touchRef.current.x)
    const dy = Math.abs(touch.clientY - touchRef.current.y)
    if (dx > 10 || dy > 10) touchRef.current.moved = true
  }

  const handleTouchEnd = () => {
    const elapsed = Date.now() - touchRef.current.time
    if (!touchRef.current.moved && elapsed < 350) onTap()
  }

  return (
    <div
      ref={viewportRef}
      className="h-full w-full overflow-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex min-h-full w-max min-w-full items-center justify-center px-3 py-3 sm:px-6 sm:py-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.src}
          alt={slide.alt}
          draggable={false}
          decoding="async"
          loading="eager"
          className="block h-auto w-auto max-w-none select-none"
          style={{
            maxWidth: 'min(100vw - 1.5rem, 72rem)',
            touchAction: 'pan-x pan-y pinch-zoom',
          }}
        />
      </div>
    </div>
  )
}

export function ArticleGalleryLightbox({
  isOpen,
  slides,
  activeIndex,
  onClose,
  onIndexChange,
}: ArticleGalleryLightboxProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const slideViewportRefs = useRef(new Map<string, HTMLDivElement>())
  const programmaticScroll = useRef(false)

  const [chromeVisible, setChromeVisible] = useState(true)

  const slideCount = slides.length
  const current = slides[activeIndex]
  const hasMultiple = slideCount > 1

  const goPrev = useCallback(() => {
    if (!hasMultiple) return
    onIndexChange((activeIndex - 1 + slideCount) % slideCount)
  }, [activeIndex, hasMultiple, onIndexChange, slideCount])

  const goNext = useCallback(() => {
    if (!hasMultiple) return
    onIndexChange((activeIndex + 1) % slideCount)
  }, [activeIndex, hasMultiple, onIndexChange, slideCount])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen, onClose, goPrev, goNext])

  useEffect(() => {
    if (!isOpen) {
      setChromeVisible(true)
      return
    }

    const container = scrollerRef.current
    if (!container) return

    programmaticScroll.current = true
    scrollContainerTo(container, activeIndex * container.clientWidth)

    const frame = requestAnimationFrame(() => {
      programmaticScroll.current = false
    })

    return () => cancelAnimationFrame(frame)
  }, [activeIndex, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const slide = slides[activeIndex]
    if (!slide) return
    const viewport = slideViewportRefs.current.get(slide.id)
    if (viewport) {
      viewport.scrollLeft = 0
      viewport.scrollTop = 0
    }
  }, [activeIndex, isOpen, slides])

  const handleScroll = () => {
    if (programmaticScroll.current || !hasMultiple) return
    const container = scrollerRef.current
    if (!container || container.clientWidth <= 0) return

    const nextIndex = Math.round(container.scrollLeft / container.clientWidth)
    if (nextIndex !== activeIndex && nextIndex >= 0 && nextIndex < slideCount) {
      onIndexChange(nextIndex)
    }
  }

  const toggleChrome = () => {
    setChromeVisible((visible) => !visible)
  }

  if (!isOpen || !current || typeof document === 'undefined') {
    return null
  }

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Gallery image viewer"
      style={{
        height: '100dvh',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div
        className={[
          'shrink-0 transition-[max-height,opacity] duration-200',
          chromeVisible ? 'max-h-32 opacity-100' : 'max-h-0 overflow-hidden opacity-0',
        ].join(' ')}
      >
        <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <div className="min-w-0 flex-1">
            {hasMultiple ? (
              <>
                <p className="text-sm font-medium text-white/90">
                  {activeIndex + 1} / {slideCount}
                </p>
                <div className="mt-2 flex gap-1.5" aria-hidden="true">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => onIndexChange(index)}
                      className={[
                        'h-1.5 rounded-full transition-all',
                        index === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/35',
                      ].join(' ')}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="truncate text-sm font-medium text-white/90">Gallery</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm"
            aria-label="Close gallery"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        {hasMultiple && chromeVisible ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-2 top-1/2 z-30 hidden min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm sm:flex"
              aria-label="Previous image"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-2 top-1/2 z-30 hidden min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm sm:flex"
              aria-label="Next image"
            >
              <ChevronIcon direction="right" />
            </button>
          </>
        ) : null}

        <div
          ref={scrollerRef}
          className={[
            'flex h-full w-full snap-x snap-mandatory overflow-x-auto',
            hasMultiple ? 'scroll-smooth' : 'overflow-x-hidden',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          ].join(' ')}
          onScroll={handleScroll}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="h-full w-full shrink-0 snap-center">
              <GallerySlideImage
                slide={slide}
                onTap={toggleChrome}
                viewportRef={(node) => {
                  if (node) slideViewportRefs.current.set(slide.id, node)
                  else slideViewportRefs.current.delete(slide.id)
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
