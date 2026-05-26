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

function ChevronIcon({ direction }: { direction: 'left' | 'right' | 'up' | 'down' }) {
  const paths = {
    left: 'M15 19l-7-7 7-7',
    right: 'M9 5l7 7-7 7',
    up: 'M5 15l7-7 7 7',
    down: 'M19 9l-7 7-7-7',
  }
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paths[direction]} />
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
  const pointer = useRef({ x: 0, y: 0, active: false, moved: false })

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointer.current = {
      x: e.clientX,
      y: e.clientY,
      active: true,
      moved: false,
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointer.current.active) return
    const dx = Math.abs(e.clientX - pointer.current.x)
    const dy = Math.abs(e.clientY - pointer.current.y)
    if (dx > 8 || dy > 8) pointer.current.moved = true
  }

  const handlePointerUp = () => {
    if (pointer.current.active && !pointer.current.moved) onTap()
    pointer.current.active = false
  }

  const handlePointerCancel = () => {
    pointer.current.active = false
  }

  return (
    <div
      ref={viewportRef}
      className="h-full w-full overflow-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
      style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div className="flex min-h-full min-w-full items-center justify-center p-2 sm:p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.src}
          alt={slide.alt}
          draggable={false}
          decoding="async"
          loading="eager"
          className="block h-auto w-auto max-h-full max-w-full select-none object-contain"
          style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
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

  const [detailsExpanded, setDetailsExpanded] = useState(false)
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
      if (e.key === 'Escape') {
        if (detailsExpanded) setDetailsExpanded(false)
        else onClose()
      } else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen, onClose, goPrev, goNext, detailsExpanded])

  useEffect(() => {
    if (!isOpen) {
      setDetailsExpanded(false)
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
    if (detailsExpanded) setDetailsExpanded(false)
  }

  if (!isOpen || !current || typeof document === 'undefined') {
    return null
  }

  const hasDetails = Boolean(current.caption || current.alt)
  const detailPrimary = current.caption || current.alt
  const detailSecondary =
    current.alt && current.caption && current.alt !== current.caption ? current.alt : null

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
          'pointer-events-none absolute inset-0 z-20 flex flex-col transition-opacity duration-200',
          chromeVisible ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        <div className="pointer-events-auto flex shrink-0 items-center justify-between gap-3 px-3 py-3 sm:px-4">
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
            'flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden',
            hasMultiple ? 'scroll-smooth' : 'overflow-x-hidden',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          ].join(' ')}
          onScroll={handleScroll}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex h-full w-full shrink-0 snap-center items-stretch justify-center sm:px-4"
            >
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

        {hasDetails ? (
          <div
            className={[
              'pointer-events-auto absolute inset-x-0 bottom-0 z-30 px-3 pb-3 sm:px-6',
              chromeVisible ? 'opacity-100' : 'pointer-events-none opacity-0',
              'transition-opacity duration-200',
            ].join(' ')}
          >
            <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-black/75 shadow-2xl backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setDetailsExpanded((open) => !open)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left"
                aria-expanded={detailsExpanded}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                    Caption
                  </p>
                  <p
                    className={[
                      'mt-1 text-sm leading-relaxed text-white sm:text-base',
                      detailsExpanded ? '' : 'line-clamp-2',
                    ].join(' ')}
                  >
                    {detailPrimary}
                  </p>
                </div>
                <span className="mt-1 flex shrink-0 items-center gap-1 text-xs font-medium text-white/70">
                  {detailsExpanded ? 'Less' : 'More'}
                  <ChevronIcon direction={detailsExpanded ? 'down' : 'up'} />
                </span>
              </button>
              {detailsExpanded ? (
                <div className="max-h-[40dvh] overflow-y-auto border-t border-white/10 px-4 py-3 [-webkit-overflow-scrolling:touch]">
                  {current.caption ? (
                    <p className="text-base leading-relaxed text-white">{current.caption}</p>
                  ) : null}
                  {detailSecondary ? (
                    <p className="mt-2 text-sm text-white/70">{detailSecondary}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : hasMultiple ? (
          <p
            className={[
              'pointer-events-none absolute inset-x-0 bottom-4 z-30 text-center text-xs text-white/50',
              chromeVisible ? 'opacity-100' : 'opacity-0',
              'transition-opacity duration-200',
            ].join(' ')}
          >
            Swipe sideways for more photos · drag image to pan · tap to hide controls
          </p>
        ) : (
          <p
            className={[
              'pointer-events-none absolute inset-x-0 bottom-4 z-30 text-center text-xs text-white/50',
              chromeVisible ? 'opacity-100' : 'opacity-0',
              'transition-opacity duration-200',
            ].join(' ')}
          >
            Drag image to pan · pinch to zoom · tap to hide controls
          </p>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
