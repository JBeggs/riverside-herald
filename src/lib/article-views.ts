import { getOrCreateVoterId } from './article-reactions'

const VIEWED_CACHE_KEY = 'rsh_article_views'

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readViewedCache(): Record<string, true> {
  if (!canUseStorage()) return {}
  try {
    const raw = window.localStorage.getItem(VIEWED_CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, true>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeViewedCache(cache: Record<string, true>): void {
  if (!canUseStorage()) return
  window.localStorage.setItem(VIEWED_CACHE_KEY, JSON.stringify(cache))
}

export function hasViewedArticle(articleId: string): boolean {
  return Boolean(readViewedCache()[articleId])
}

export function markArticleViewed(articleId: string): void {
  const cache = readViewedCache()
  cache[articleId] = true
  writeViewedCache(cache)
}

export { getOrCreateVoterId }

export type ArticleViewResponse = {
  views: number
  counted: boolean
}
