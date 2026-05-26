'use client'

import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import SafeImage from '@/components/ui/SafeImage'

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
  const touchStartX = useRef<number | null>(null)

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMultiple) return
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
    const delta = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return
    if (delta > 0) {
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

  if (!isOpen || !current || typeof document === 'undefined') {
    return null
  }

  const modal = (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label="Gallery image viewer"
      onClick={handleBackdropClick}
    >
      <div className="flex shrink-0 items-center justify-end p-3 sm:p-4 safe-px">
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

      <div
        className="relative flex flex-1 items-center justify-center px-3 pb-3 sm:px-6 sm:pb-6"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {hasMultiple ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            className="absolute left-2 top-1/2 z-10 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-4"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        ) : null}

        <div className="relative mx-auto h-[min(70vh,calc(100vh-8rem))] w-full max-w-6xl">
          <SafeImage
            key={current.id}
            src={current.src}
            alt={current.alt}
            fill
            className="rounded-lg"
            imgClassName="object-contain"
            loading="eager"
            decoding="sync"
          />
        </div>

        {hasMultiple ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            className="absolute right-2 top-1/2 z-10 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-4"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        ) : null}
      </div>

      <div className="shrink-0 px-4 pb-6 pt-2 text-center safe-px">
        {hasMultiple ? (
          <p className="mb-2 text-sm text-white/70">
            {activeIndex + 1} / {slideCount}
          </p>
        ) : null}
        {current.caption ? (
          <p className="mx-auto max-w-2xl text-sm text-white sm:text-base">{current.caption}</p>
        ) : null}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
