'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

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

const SWIPE_THRESHOLD_PX = 50

export function ArticleGalleryLightbox({
  isOpen,
  slides,
  activeIndex,
  onClose,
  onIndexChange,
}: ArticleGalleryLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const [zoomed, setZoomed] = useState(false)

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
        onClose()
      } else if (e.key === 'ArrowLeft') {
        goPrev()
      } else if (e.key === 'ArrowRight') {
        goNext()
      }
    }

    const originalOverflow = document.body.style.overflow
    const originalPaddingRight = document.body.style.paddingRight
    document.body.style.overflow = 'hidden'
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    document.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalOverflow
      document.body.style.paddingRight = originalPaddingRight
    }
  }, [isOpen, onClose, goPrev, goNext])

  const resetScroll = () => {
    const el = scrollRef.current
    if (!el) return
    if (typeof el.scrollTo === 'function') {
      el.scrollTo(0, 0)
    } else {
      el.scrollTop = 0
      el.scrollLeft = 0
    }
  }

  useEffect(() => {
    setZoomed(false)
    resetScroll()
  }, [activeIndex, isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
    touchStartY.current = e.touches[0]?.clientY ?? null
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || !hasMultiple || zoomed) {
      touchStartX.current = null
      touchStartY.current = null
      return
    }
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
    const endY = e.changedTouches[0]?.clientY ?? touchStartY.current
    const deltaX = endX - touchStartX.current
    const deltaY = endY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null

    if (Math.abs(deltaY) > Math.abs(deltaX)) return
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return
    if (deltaX > 0) {
      goPrev()
    } else {
      goNext()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const toggleZoom = () => {
    setZoomed((value) => !value)
    requestAnimationFrame(resetScroll)
  }

  if (!isOpen || !current || typeof document === 'undefined') {
    return null
  }

  const modal = (
    <div
      className="fixed inset-0 z-[200] grid h-[100dvh] grid-rows-[auto_minmax(0,1fr)_auto] bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label="Gallery image viewer"
      onClick={handleBackdropClick}
    >
      <div className="flex shrink-0 items-center justify-end gap-2 p-3 sm:p-4 safe-px">
        <button
          type="button"
          onClick={toggleZoom}
          className="min-h-[44px] rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
          aria-pressed={zoomed}
          aria-label={zoomed ? 'Fit image to screen' : 'Zoom to full size'}
        >
          {zoomed ? 'Fit' : 'Zoom'}
        </button>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Close gallery"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="relative min-h-0">
        {hasMultiple ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            className="absolute left-2 top-1/2 z-10 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 sm:left-4"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        ) : null}

        <div
          ref={scrollRef}
          className="h-full overflow-auto overscroll-contain px-3 sm:px-12 [-webkit-overflow-scrolling:touch]"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={[
              'box-border flex w-full justify-center',
              zoomed
                ? 'min-h-min items-start py-4'
                : 'h-full min-h-full items-center py-4 sm:py-6',
            ].join(' ')}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.id}
              src={current.src}
              alt={current.alt}
              draggable={false}
              decoding="sync"
              loading="eager"
              onDoubleClick={toggleZoom}
              className={[
                'mx-auto block h-auto w-auto max-w-full select-none',
                zoomed
                  ? 'cursor-zoom-out'
                  : 'max-h-full cursor-zoom-in object-contain sm:max-w-[min(100%,72rem)]',
              ].join(' ')}
              style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
            />
          </div>
        </div>

        {hasMultiple ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            className="absolute right-2 top-1/2 z-10 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 sm:right-4"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        ) : null}
      </div>

      <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 text-center safe-px">
        {hasMultiple ? (
          <p className="mb-1 text-sm text-white/70">
            {activeIndex + 1} / {slideCount}
          </p>
        ) : null}
        {current.caption ? (
          <p className="mx-auto max-w-2xl text-sm text-white sm:text-base">{current.caption}</p>
        ) : null}
        <p className="mt-2 text-xs text-white/50 sm:hidden">
          Scroll to pan · double-tap or Zoom for full size
        </p>
        <p className="mt-1 hidden text-xs text-white/40 sm:block">
          Double-click or Zoom for full size · scroll when zoomed
        </p>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
