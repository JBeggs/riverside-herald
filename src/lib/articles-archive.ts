import { serverNewsApi } from '@/lib/api-server'
import { mapMediaForCard } from '@/lib/image-utils'

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export function mapListArticle(article: any) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || '',
    content: article.content || '',
    published_at: article.published_at,
    views: article.views || 0,
    likes: article.likes || 0,
    read_time_minutes: article.read_time_minutes,
    featured_media: mapMediaForCard(article.featured_media, article.title),
    author_name: article.author_name || 'Staff Writer',
    category: article.category
      ? {
          id: article.category.id,
          name: article.category.name,
          slug: article.category.slug,
          color: article.category.color,
        }
      : undefined,
  }
}

export async function getPublishedArticles(options?: {
  category__slug?: string
  tags__slug?: string
}): Promise<any[]> {
  try {
    const articlesData: any = await serverNewsApi.articles.list({
      status: 'published',
      skipTenant: true,
      ...options,
    })
    const articles = articlesData?.results || articlesData || []
    return Array.isArray(articles) ? articles.map(mapListArticle) : []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

export async function getNewsCategories(): Promise<
  Array<{ id: string; name: string; slug: string; color: string }>
> {
  try {
    const categoriesData: any = await serverNewsApi.categories.list({ skipTenant: true })
    return (categoriesData?.results || categoriesData || []).map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      color: cat.color,
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}
