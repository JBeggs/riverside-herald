'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import FeaturedBusinessCard from '@/components/businesses/FeaturedBusinessCard'

type Business = {
  id: string
  name: string
  slug: string
  description: string
  industry: string
  city: string
  rating: number
  review_count?: number
  website_url?: string
  phone?: string
  email?: string
  is_verified?: boolean
  logo?: { file_url: string }
  cover_image?: { file_url: string }
  products?: Array<{
    id: string
    name: string
    price?: number
    currency?: string
    image?: { file_url: string }
    description?: string
  }>
}

export default function HomeFeaturedBusinessesSlideshow({
  businesses,
  defaultCurrency,
}: {
  businesses: Business[]
  defaultCurrency: string
}) {
  const labelId = useId()
  const [index, setIndex] = useState(0)
  const n = businesses.length
  const safeIdx = n === 0 ? 0 : Math.min(index, n - 1)

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1))
  }, [])

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(n - 1, i + 1))
  }, [n])

  useEffect(() => {
    if (index > 0 && index >= n) setIndex(Math.max(0, n - 1))
  }, [index, n])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null
      if (el?.closest?.('input, textarea, select, [contenteditable="true"]')) return
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goPrev, goNext])

  if (n === 0) return null

  return (
    <section
      className="home-business-slideshow py-10 md:py-14 border-y border-border-default bg-[rgb(var(--color-surface-raised)/0.35)]"
      aria-labelledby={labelId}
      data-cy="home-business-slideshow"
    >
      <div className="container-wide">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end sm:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h2 id={labelId} className="section-title text-2xl md:text-3xl font-serif tracking-tight">
              Featured businesses
            </h2>
            <p className="mt-2 text-text-muted max-w-2xl text-sm md:text-base">
              Local spots worth knowing — browse products, ratings, and how to get in touch.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={goPrev}
              disabled={safeIdx <= 0}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border-default bg-surface text-text shadow-sm hover:bg-[rgb(var(--color-surface-raised)/0.85)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous business"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <span className="min-w-[4.5rem] text-center text-sm tabular-nums text-text-muted font-medium" aria-live="polite">
              {safeIdx + 1} / {n}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={safeIdx >= n - 1}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border-default bg-surface text-text shadow-sm hover:bg-[rgb(var(--color-surface-raised)/0.85)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next business"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
            <Link href="/businesses" className="ml-2 text-sm font-semibold text-primary hover:underline whitespace-nowrap">
              View all →
            </Link>
          </div>
        </div>

        <div
          className="relative rounded-2xl border border-border-default bg-surface p-3 md:p-6 shadow-card focus-within:ring-2 focus-within:ring-primary/30 outline-none"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Featured business carousel"
        >
          <div className="max-w-4xl mx-auto transition-opacity duration-200">
            <FeaturedBusinessCard
              key={businesses[safeIdx].id}
              business={businesses[safeIdx] as any}
              showProducts
              showWebsiteLink
              defaultCurrency={defaultCurrency}
              prominent
            />
          </div>
        </div>
      </div>
    </section>
  )
}
