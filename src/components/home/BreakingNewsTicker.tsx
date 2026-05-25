'use client'

import Link from 'next/link'

export type BreakingNewsTickerItem = {
  id: string
  slug: string
  title: string
  subtitle?: string
}

export default function BreakingNewsTicker({ items }: { items: BreakingNewsTickerItem[] }) {
  if (items.length === 0) return null

  const trackItems = [...items, ...items]

  return (
    <div
      className="breaking-ticker border-b border-white/10"
      role="region"
      aria-label="Breaking news"
      data-cy="breaking-news-ticker"
    >
      <div className="breaking-ticker-inner container-wide safe-px">
        <div className="breaking-ticker-label" aria-hidden>
          <span className="breaking-ticker-live-dot" />
          Breaking
        </div>

        <div className="breaking-ticker-viewport min-w-0 flex-1">
          <div className="breaking-ticker-track">
            {trackItems.map((item, index) => (
              <span key={`${item.id}-${index}`} className="breaking-ticker-item">
                <Link href={`/articles/${item.slug}`} className="breaking-ticker-link group">
                  <span className="font-medium group-hover:underline underline-offset-2">
                    {item.title}
                  </span>
                  {item.subtitle ? (
                    <span className="breaking-ticker-subtitle hidden sm:inline">
                      {item.subtitle}
                    </span>
                  ) : null}
                </Link>
                <span className="breaking-ticker-sep" aria-hidden>
                  ◆
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
