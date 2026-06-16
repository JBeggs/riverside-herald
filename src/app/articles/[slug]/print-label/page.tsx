import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { serverNewsApi } from '@/lib/api-server'
import { getCompany } from '@/lib/company'
import { formatArticleDate } from '@/lib/date-utils'
import { getArticleImageUrl, getLogoCardUrl, ARTICLE_IMAGE_PLACEHOLDER } from '@/lib/image-utils'
import { absoluteProxyMediaUrl, getRequestSiteOrigin } from '@/lib/media-proxy'
import {
  extractArticlePrintBlurb,
  extractArticlePrintContent,
  resolveLabelAccentColor,
} from '@/lib/article-print-label'
import PrintLabelClient from './PrintLabelClient'

export const dynamic = 'force-dynamic'

interface PrintLabelPageProps {
  params: Promise<{ slug: string }>
}

async function getArticle(slug: string) {
  try {
    return await serverNewsApi.articles.getBySlug(slug)
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PrintLabelPageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  return {
    title: article ? `Print — ${article.title}` : 'Print article',
    robots: { index: false, follow: false },
  }
}

export default async function ArticlePrintLabelPage({ params }: PrintLabelPageProps) {
  const { slug } = await params
  const [article, company, siteOrigin] = await Promise.all([
    getArticle(slug),
    getCompany(),
    getRequestSiteOrigin(),
  ])

  if (!article) notFound()

  const accent = resolveLabelAccentColor(company.brandColor)
  const tagline = company.tagline?.trim() || null
  const logoCandidate = company.logoUrl ? getLogoCardUrl(null, company.logoUrl) : ''
  const logoSrc =
    logoCandidate && !logoCandidate.includes('default.svg')
      ? absoluteProxyMediaUrl(logoCandidate, siteOrigin)
      : null

  const heroRaw = getArticleImageUrl(article)
  const imageSrc =
    heroRaw && heroRaw !== ARTICLE_IMAGE_PLACEHOLDER
      ? absoluteProxyMediaUrl(heroRaw, siteOrigin)
      : null

  const blurb = extractArticlePrintBlurb({
    excerpt: article.excerpt,
    subtitle: article.subtitle,
    seo_description: article.seo_description,
  })
  const contentExcerpt = extractArticlePrintContent(article.content || '')

  const origin = siteOrigin || ''
  const articleUrl = origin
    ? `${origin.replace(/\/$/, '')}/articles/${article.slug}`
    : `/articles/${article.slug}`

  const publishedDateSource =
    article.published_at || (article.status === 'published' ? article.created_at : null)
  const publishedLabel = formatArticleDate(publishedDateSource, {
    locale: company.localeTag,
    draftLabel: 'Unpublished',
    emptyLabel: '',
  })

  return (
    <div data-print-label-page>
      <PrintLabelClient
        articleSlug={article.slug}
        companyName={company.name}
        tagline={tagline}
        accent={accent}
        logoSrc={logoSrc}
        articleTitle={article.title}
        blurb={blurb}
        contentExcerpt={contentExcerpt}
        imageSrc={imageSrc}
        articleUrl={articleUrl}
        authorName={article.author_name?.trim() || null}
        publishedLabel={publishedLabel || null}
      />
    </div>
  )
}
