export type ArticleReactionType = 'like' | 'dislike'

const VOTER_ID_KEY = 'rsh_article_voter_id'
const REACTIONS_CACHE_KEY = 'rsh_article_reactions'

type ReactionCache = Record<string, ArticleReactionType>

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getOrCreateVoterId(): string {
  if (!canUseStorage()) return 'ssr-anonymous'

  const existing = window.localStorage.getItem(VOTER_ID_KEY)?.trim()
  if (existing) return existing

  const id =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `v-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

  window.localStorage.setItem(VOTER_ID_KEY, id)
  return id
}

function readReactionCache(): ReactionCache {
  if (!canUseStorage()) return {}
  try {
    const raw = window.localStorage.getItem(REACTIONS_CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as ReactionCache
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeReactionCache(cache: ReactionCache): void {
  if (!canUseStorage()) return
  window.localStorage.setItem(REACTIONS_CACHE_KEY, JSON.stringify(cache))
}

export function getCachedArticleReaction(articleId: string): ArticleReactionType | null {
  const value = readReactionCache()[articleId]
  return value === 'like' || value === 'dislike' ? value : null
}

export function setCachedArticleReaction(
  articleId: string,
  reaction: ArticleReactionType | null,
): void {
  const cache = readReactionCache()
  if (reaction) cache[articleId] = reaction
  else delete cache[articleId]
  writeReactionCache(cache)
}

export type ArticleReactionResponse = {
  likes: number
  dislikes: number
  user_reaction: ArticleReactionType | null
}
