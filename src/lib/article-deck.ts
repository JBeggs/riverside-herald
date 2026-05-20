/** Public deck line under the headline (Article.subtitle). */
export function trimArticleSubtitle(subtitle?: string | null): string {
  return (subtitle ?? '').trim()
}

/** True when excerpt adds information beyond the subtitle deck line. */
export function shouldShowExcerptWithSubtitle(subtitle: string, excerpt?: string | null): boolean {
  const deck = subtitle.trim()
  const body = (excerpt ?? '').trim()
  if (!body) return false
  if (!deck) return true
  return body.toLowerCase() !== deck.toLowerCase()
}
