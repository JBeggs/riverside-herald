import { serverNewsApi } from '@/lib/api-server'

export type SocialLink = { platform?: string; label?: string; url: string }
export type ServiceLink = { label: string; href: string }

export type SiteSettingsMap = Record<string, unknown>

export function parseSiteSettingsRows(settingsData: unknown): SiteSettingsMap {
  const settingsArray = Array.isArray(settingsData)
    ? settingsData
    : (settingsData as { results?: unknown[] })?.results || []

  const map: SiteSettingsMap = {}
  for (const row of settingsArray as { key: string; value: string; type?: string }[]) {
    if (!row?.key) continue
    try {
      map[row.key] =
        row.type === 'json' && typeof row.value === 'string'
          ? JSON.parse(row.value)
          : row.value
    } catch {
      map[row.key] = row.value
    }
  }
  return map
}

export function stringFromMap(map: SiteSettingsMap, key: string): string {
  const v = map[key]
  if (v == null) return ''
  if (typeof v === 'string') return v
  return String(v)
}

export function parseSocialLinksJson(map: SiteSettingsMap): SocialLink[] {
  const raw = map.social_links
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.filter((x): x is SocialLink => typeof x?.url === 'string')
  }
  return []
}

export function parseServicesLinksJson(map: SiteSettingsMap): ServiceLink[] {
  const raw = map.services_links
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.filter(
      (x): x is ServiceLink =>
        typeof x?.label === 'string' && typeof x?.href === 'string',
    )
  }
  return []
}

export function defaultThemeFromMap(map: SiteSettingsMap): 'classic' | 'modern' | 'dark' | null {
  const v = stringFromMap(map, 'default_theme').toLowerCase().trim()
  if (v === 'classic' || v === 'modern' || v === 'dark') return v
  return null
}

/**
 * Server-side: load site settings once (e.g. metadata, locale).
 */
export async function loadSiteSettingsMap(): Promise<SiteSettingsMap> {
  try {
    const raw = await serverNewsApi.siteSettings.list({ skipTenant: true })
    return parseSiteSettingsRows(raw)
  } catch {
    return {}
  }
}

export function siteLabelFromMap(map: SiteSettingsMap, key: 'site_name' | 'site_tagline', fallback: string): string {
  const s = stringFromMap(map, key).trim()
  return s || fallback
}
