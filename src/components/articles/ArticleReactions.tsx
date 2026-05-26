'use client'

import { useCallback, useState } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { newsApi } from '@/lib/api'
import {
  getCachedArticleReaction,
  getOrCreateVoterId,
  setCachedArticleReaction,
  type ArticleReactionType,
} from '@/lib/article-reactions'

type ArticleReactionsProps = {
  articleId: string
  initialLikes: number
  initialDislikes?: number
}

export function ArticleReactions({
  articleId,
  initialLikes,
  initialDislikes = 0,
}: ArticleReactionsProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [userReaction, setUserReaction] = useState<ArticleReactionType | null>(() =>
    getCachedArticleReaction(articleId),
  )
  const [pending, setPending] = useState<'like' | 'dislike' | null>(null)

  const submitReaction = useCallback(
    async (reaction: ArticleReactionType) => {
      if (pending) return

      const previous = {
        likes,
        dislikes,
        userReaction,
      }

      const nextReaction: ArticleReactionType | null =
        userReaction === reaction ? null : reaction

      if (userReaction === reaction) {
        if (reaction === 'like') setLikes((value) => Math.max(0, value - 1))
        else setDislikes((value) => Math.max(0, value - 1))
        setUserReaction(null)
      } else if (userReaction === null) {
        if (reaction === 'like') setLikes((value) => value + 1)
        else setDislikes((value) => value + 1)
        setUserReaction(reaction)
      } else {
        if (reaction === 'like') {
          setLikes((value) => value + 1)
          setDislikes((value) => Math.max(0, value - 1))
        } else {
          setDislikes((value) => value + 1)
          setLikes((value) => Math.max(0, value - 1))
        }
        setUserReaction(reaction)
      }

      setPending(reaction)

      try {
        const voterId = getOrCreateVoterId()
        const response = (await newsApi.articles.react(articleId, {
          voter_id: voterId,
          reaction: nextReaction,
        })) as {
          likes?: number
          dislikes?: number
          user_reaction?: ArticleReactionType | null
        }

        const syncedLikes = typeof response.likes === 'number' ? response.likes : likes
        const syncedDislikes =
          typeof response.dislikes === 'number' ? response.dislikes : dislikes
        const syncedReaction =
          response.user_reaction === 'like' || response.user_reaction === 'dislike'
            ? response.user_reaction
            : null

        setLikes(syncedLikes)
        setDislikes(syncedDislikes)
        setUserReaction(syncedReaction)
        setCachedArticleReaction(articleId, syncedReaction)
      } catch {
        setLikes(previous.likes)
        setDislikes(previous.dislikes)
        setUserReaction(previous.userReaction)
      } finally {
        setPending(null)
      }
    },
    [articleId, dislikes, likes, pending, userReaction],
  )

  const buttonClass = (active: boolean) =>
    [
      'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors',
      active
        ? 'bg-primary text-white'
        : 'bg-surface-raised text-text-muted border border-border-default hover:text-text',
      pending ? 'opacity-70' : '',
    ].join(' ')

  return (
    <div className="flex flex-wrap items-center gap-2" data-cy="article-reactions">
      <button
        type="button"
        className={buttonClass(userReaction === 'like')}
        aria-pressed={userReaction === 'like'}
        aria-label={`Like article (${likes})`}
        disabled={Boolean(pending)}
        onClick={() => submitReaction('like')}
      >
        <ThumbsUp className="h-4 w-4" aria-hidden="true" />
        <span>{likes}</span>
      </button>
      <button
        type="button"
        className={buttonClass(userReaction === 'dislike')}
        aria-pressed={userReaction === 'dislike'}
        aria-label={`Dislike article (${dislikes})`}
        disabled={Boolean(pending)}
        onClick={() => submitReaction('dislike')}
      >
        <ThumbsDown className="h-4 w-4" aria-hidden="true" />
        <span>{dislikes}</span>
      </button>
    </div>
  )
}
