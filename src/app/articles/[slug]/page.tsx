import { serverNewsApi } from '@/lib/api-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Calendar, Clock, User, Tag } from 'lucide-react'
import EnhancedArticleEditor from '@/components/articles/EnhancedArticleEditor'
import ShareButtons from '@/components/articles/ShareButtons'
import RelatedArticles from '@/components/articles/RelatedArticles'

interface ArticlePageProps {
  params: Promise<{
    slug: string
  }>
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function calculateReadingTime(content: string | undefined | null): number {
  if (!content) return 5
  const wordsPerMinute = 200
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

async function getArticleData(slug: string) {
  try {
    const article = await serverNewsApi.articles.getBySlug(slug)
    
    if (!article) {
      return null
    }
    
    // For anonymous users, only show published articles
    // For authenticated users, show all articles
    // (This check is handled by the backend, but we can add client-side check if needed)

    // Increment view count (async, don't wait)
    if (article.id) {
      serverNewsApi.articles.incrementViews(article.id).catch(console.error)
    }
    
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      subtitle: article.subtitle,
      excerpt: article.excerpt,
      content: article.content || '',
      featured_media: article.featured_media,
      published_at: article.published_at,
      views: article.views || 0,
      likes: article.likes || 0,
      shares: article.shares || 0,
      read_time_minutes: article.read_time_minutes,
      status: article.status,
      created_at: article.created_at,
      updated_at: article.updated_at,
      author_id: article.author,
      category_id: article.category?.id,
      author: {
        id: article.author,
        full_name: article.author_name,
        avatar_url: null, // Will need to fetch from profile if needed
        role: 'author'
      },
      category: article.category ? {
        id: article.category.id,
        name: article.category.name,
        slug: article.category.slug,
        color: article.category.color
      } : null,
      tags: article.tags || [],
      seo_title: article.seo_title,
      seo_description: article.seo_description,
      article_media: article.article_media || [],
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

async function getArticleDataBuildTime(slug: string) {
  try {
    const article = await serverNewsApi.articles.getBySlug(slug)
    
    if (!article || article.status !== 'published') {
      return null
    }
    
    return {
      title: article.title,
      subtitle: article.subtitle,
      excerpt: article.excerpt,
      seo_title: article.seo_title,
      seo_description: article.seo_description,
      featured_media: article.featured_media,
      published_at: article.published_at,
      author: {
        full_name: article.author_name
      },
      category: article.category ? {
        name: article.category.name
      } : null,
    }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleDataBuildTime(slug)
  
  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt || '',
    openGraph: {
      title: article.title,
      description: article.excerpt || '',
      images: getArticleOpenGraphImageUrls(article),
      publishedTime: article.published_at,
      authors: [article.author?.full_name || 'Staff Writer'],
    },
  }
}

import { getArticleImageUrl, getArticleOpenGraphImageUrls, getAbsoluteImageUrl } from '@/lib/image-utils'

function getImageUrl(article: { featured_media?: { file_url?: string }; id?: string }) {
  return getArticleImageUrl(article)
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const article = await getArticleData(slug)

  if (!article) {
    notFound()
  }

  const readingTime = article.read_time_minutes || calculateReadingTime(article.content || '')

  return (
    <div className="min-h-screen bg-white">
      {/* Article Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container-wide py-8">
          {article.category && (
            <Link
              href={`/category/${article.category.slug}`}
              className="inline-block mb-4"
            >
              <span
                className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: article.category.color }}
              >
                {article.category.name}
              </span>
            </Link>
          )}
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4" data-cy="article-title">
            {article.title}
          </h1>
          
          {article.subtitle && (
            <p className="text-lg sm:text-xl text-gray-600 mb-6">{article.subtitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{article.author?.full_name || 'Staff Writer'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={article.published_at}>
                {formatDate(article.published_at)}
              </time>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{article.views?.toLocaleString() || 0} views</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{article.likes || 0} likes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured image or River Lodge placeholder */}
      <div className="container-wide py-4 md:py-8">
        <div className="relative w-full h-64 sm:h-80 md:h-96 lg:h-[500px] rounded-xl md:rounded-2xl overflow-hidden">
          <Image
            src={getImageUrl(article)}
            alt={article.featured_media?.alt_text || article.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      </div>

      {/* Article Gallery */}
      {article.article_media && article.article_media.length > 0 && (
        <div className="container-wide py-4 md:py-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {article.article_media.map((item: { id?: string; media?: { id?: string; file_url?: string; alt_text?: string }; caption?: string }) => {
              const imageUrl = item.media?.file_url
              if (!imageUrl) {
                console.warn('Gallery item missing file_url:', item)
                return null
              }
              
              // Ensure absolute URL
              const absoluteUrl = getAbsoluteImageUrl(imageUrl)
              
              return (
                <div key={item.id || item.media?.id} className="relative group">
                  <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-300">
                    <Image
                      src={absoluteUrl}
                      alt={item.media?.alt_text || item.caption || 'Gallery image'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  {item.caption && (
                    <p className="text-sm text-gray-600 mt-2">{item.caption}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="container-wide py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Article Editor (for authors/admins) */}
          <EnhancedArticleEditor article={article as any} />

          {/* Article Body */}
          {article.content && (
            <div
              className="prose prose-sm sm:prose-base md:prose-lg max-w-none mb-12"
              data-cy="article-content"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}
          {!article.content && (
            <div className="prose prose-lg max-w-none mb-12">
              <p className="text-gray-500 italic">No content available for this article.</p>
            </div>
          )}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {article.tags.map((tag: any) => (
                <Link
                  key={tag.id || tag}
                  href={`/tag/${typeof tag === 'string' ? tag : tag.slug}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {typeof tag === 'string' ? tag : tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Share Buttons */}
          <ShareButtons title={article.title} url={`/articles/${article.slug}`} />

          {/* Related Articles */}
          <RelatedArticles 
            currentArticleId={article.id} 
            categoryId={article.category_id || undefined} 
          />
        </div>
      </article>
    </div>
  )
}
