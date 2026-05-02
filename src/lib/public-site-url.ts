/** Public site URL for share links and OG (no hardcoded domain). */
export function getPublicSiteUrl(): string {
  const u = (process.env.NEXT_PUBLIC_SITE_URL || '').trim()
  if (!u) return ''
  return u.endsWith('/') ? u.slice(0, -1) : u
}
