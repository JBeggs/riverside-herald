import Link from 'next/link'

type Category = { id: string; name: string; slug: string; color: string }

const chipBase =
  'px-4 py-2 rounded-full text-sm font-medium transition-colors ring-1 ring-inset min-h-[44px] inline-flex items-center justify-center'

export default function ArticlesTopicFilters({
  categories,
  activeCategorySlug = null,
}: {
  categories: Category[]
  /** When set, highlights matching category chip; null = "All" active */
  activeCategorySlug?: string | null
}) {
  return (
    <div className="border-b border-border-default bg-surface py-6">
      <div className="container-wide">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/articles"
            className={
              activeCategorySlug == null
                ? `${chipBase} bg-primary text-on-primary ring-transparent`
                : `${chipBase} bg-surface-raised text-text-muted hover:text-text hover:bg-[rgb(var(--color-border)/0.35)] ring-border-default`
            }
          >
            All Articles
          </Link>
          {categories.map((category) => {
            const active = activeCategorySlug === category.slug
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={
                  active
                    ? `${chipBase} text-on-primary ring-transparent`
                    : `${chipBase} bg-surface-raised text-text ring-border-default hover:opacity-95`
                }
                style={
                  active
                    ? { backgroundColor: category.color || '#3b82f6' }
                    : {
                        backgroundColor: `${category.color ?? '#6b7280'}26`,
                        color: category.color ?? 'rgb(var(--color-text))',
                        boxShadow: `inset 0 0 0 1px ${category.color ?? '#6b7280'}44`,
                      }
                }
              >
                {category.name}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
