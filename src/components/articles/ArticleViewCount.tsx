'use client'

import { useEffect, useState } from 'react'
import { newsApi } from '@/lib/api'
import {
  getOrCreateVoterId,
  hasViewedArticle,
  markArticleViewed,
  type ArticleViewResponse,
} from '@/lib/article-views'

type ArticleViewCountProps = {
  articleId: string
  initialViews: number
}

export function ArticleViewCount({ articleId, initialViews }: ArticleViewCountProps) {
  const [views, setViews] = useState(initialViews)

  useEffect(() => {
    if (!articleId || hasViewedArticle(articleId)) return

    const voterId = getOrCreateVoterId()
    newsApi.articles
      .incrementViews(articleId, { voter_id: voterId })
      .then((response) => {
        const data = response as ArticleViewResponse
        if (typeof data.views === 'number') {
          setViews(data.views)
        } else if (data.counted) {
          setViews((value) => value + 1)
        }
        markArticleViewed(articleId)
      })
      .catch(console.error)
  }, [articleId])

  return <span>{views.toLocaleString()} views</span>
}
