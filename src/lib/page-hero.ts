/**
 * Normalize PageHero list responses from DRF (array vs { results: [] }) and read image URL.
 * Used by public pages, profile enrichment, and business owner admin.
 */

export function unwrapPageHeroListPayload(raw: unknown): any[] {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object' && raw !== null && 'results' in raw) {
    const r = (raw as { results?: unknown }).results
    return Array.isArray(r) ? r : []
  }
  return []
}

export function getHeroImageFileUrl(row: any): string | null {
  if (!row || typeof row !== 'object') return null
  const url = row.image?.file_url ?? row.image?.url
  return typeof url === 'string' && url.trim().length > 0 ? url.trim() : null
}

/** Prefer explicit `home` slug; else first row (list filtered by page_slug). */
export function pickHomePageHeroRow(rows: any[]): any | null {
  if (!Array.isArray(rows) || rows.length === 0) return null
  const home = rows.find((r) => String(r?.page_slug || '').trim() === 'home')
  return home ?? rows[0] ?? null
}

export function getHomeHeroImageFileUrlFromPayload(raw: unknown): string | null {
  const rows = unwrapPageHeroListPayload(raw)
  const row = pickHomePageHeroRow(rows)
  return getHeroImageFileUrl(row)
}
