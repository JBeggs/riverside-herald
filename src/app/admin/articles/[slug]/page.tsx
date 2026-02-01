'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ArticleEditPage() {
  const router = useRouter()
  const params = useParams()
  const articleId = params.slug as string

  useEffect(() => {
    // Redirect to the correct route with query parameter
    if (articleId) {
      router.replace(`/admin/articles?id=${articleId}`)
    }
  }, [articleId, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-600">Loading article...</div>
    </div>
  )
}
