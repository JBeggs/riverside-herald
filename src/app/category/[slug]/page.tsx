import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const categories = await getNewsCategories()
  const cat = categories.find((c) => c.slug === slug)
  const map = await loadSiteSettingsMap()
  const name = siteLabelFromMap(map, 'site_name', 'News')
  const label = cat?.name || slug
  return {
    title: `${label} | Articles | ${name}`,
    description: `Browse ${label} articles from ${name}.`,
  }
}

export default async function CategoryArticlesPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [categories, articles, profile, settingsMap] = await Promise.all([
    getNewsCategories(),
    getPublishedArticles({ category__slug: slug }),
    getProfile(),
    loadSiteSettingsMap(),
  ])

  const cat = categories.find((c) => c.slug === slug)
  if (!cat) notFound()

  const locale = stringFromMap(settingsMap, 'default_locale').trim() || 'en-ZA'
  const canAddArticle =
    profile && ['admin', 'editor', 'author', 'business_owner'].includes(profile.role)

  return (
    <ArticlesArchivePage
      articles={articles}
      categories={categories}
      locale={locale}
      canAddArticle={!!canAddArticle}
      activeCategorySlug={slug}
      title={cat.name}
      description={`News and stories in ${cat.name}.`}
    />
  )
}
