/**
 * Article / news dates: guard null, epoch quirks, invalid strings.
 */

const EPOCH_MS = 0

function isInvalidOrEpoch(d: Date): boolean {
  return Number.isNaN(d.getTime()) || d.getTime() === EPOCH_MS
}

export function toLocalDateTimeInput(value: string | Date | null | undefined): string {
  if (value == null || value === '') return ''
  const d = value instanceof Date ? value : new Date(value)
  if (isInvalidOrEpoch(d)) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Default "publish" picker for new articles: now, local. */
export function nowLocalDateTimeInput(): string {
  return toLocalDateTimeInput(new Date())
}

export function formatArticleDate(
  value: string | Date | null | undefined,
  opts?: {
    locale?: string
    draftLabel?: string
    emptyLabel?: string
  },
): string {
  const locale = opts?.locale ?? 'en-ZA'
  const draftLabel = opts?.draftLabel ?? 'Draft'
  const emptyLabel = opts?.emptyLabel ?? '—'
  if (value == null || value === '') return draftLabel
  const d = value instanceof Date ? value : new Date(value)
  if (isInvalidOrEpoch(d)) return emptyLabel
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatArticleDateShort(
  value: string | Date | null | undefined,
  locale = 'en-ZA',
): string {
  if (value == null || value === '') return ''
  const d = value instanceof Date ? value : new Date(value)
  if (isInvalidOrEpoch(d)) return ''
  return d.toLocaleDateString(locale)
}

export function parseLocalDateTimeToIso(local: string): string | null {
  if (!local?.trim()) return null
  const d = new Date(local)
  if (isInvalidOrEpoch(d)) return null
  return d.toISOString()
}
