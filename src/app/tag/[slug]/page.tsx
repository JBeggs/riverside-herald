import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { serverNewsApi } from '@/lib/api-server'
import { loadSiteSettingsMap, siteLabelFromMap, stringFromMap } from '@/lib/site-settings'
import { getPublishedArticles, getNewsCategories } from '@/lib/articles-archive'
import ArticlesArchivePage from '@/components/articles/ArticlesArchivePage'

async function getProfile(): Promise<any> {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth_token')?.value
    if (!authToken) return null
    return await serverNewsApi.profile.get()
  } catch {
    return null
  }
}

function humanizeTagSlug(slug: string) {
  return slug
    .split(/[-_]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const map = await loadSiteSettingsMap()
  const name = siteLabelFromMap(map, 'site_name', 'News')
  const label = humanizeTagSlug(slug)
  return {
    title: `#${label} | Articles | ${name}`,
    description: `Articles tagged “${label}” on ${name}.`,
  }
}

export default async function TagArticlesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [categories, articles, profile, settingsMap] = await Promise.all([
    getNewsCategories(),
    getPublishedArticles({ tags__slug: slug }),
    getProfile(),
    loadSiteSettingsMap(),
  ])

  const locale = stringFromMap(settingsMap, 'default_locale').trim() || 'en-ZA'
  const canAddArticle =
    profile && ['admin', 'editor', 'author', 'business_owner'].includes(profile.role)
  const label = humanizeTagSlug(slug)

  return (
    <ArticlesArchivePage
      articles={articles}
      categories={categories}
      locale={locale}
      canAddArticle={!!canAddArticle}
      activeCategorySlug={null}
      title={`#${label}`}
      description={`All published articles tagged with “${label}”.`}
      flatList
    />
  )
}
