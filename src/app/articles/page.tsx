import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { serverNewsApi } from '@/lib/api-server'
import { loadSiteSettingsMap, siteLabelFromMap, stringFromMap } from '@/lib/site-settings'
import { getPublishedArticles, getNewsCategories } from '@/lib/articles-archive'
import ArticlesArchivePage from '@/components/articles/ArticlesArchivePage'

export async function generateMetadata(): Promise<Metadata> {
  const map = await loadSiteSettingsMap()
  const name = siteLabelFromMap(map, 'site_name', 'News')
  return {
    title: `All Articles | ${name}`,
    description: `Browse all news articles from ${name}. Stay informed with local news and community coverage.`,
  }
}

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

export default async function ArticlesPage() {
  const [articles, categories, profile, settingsMap] = await Promise.all([
    getPublishedArticles(),
    getNewsCategories(),
    getProfile(),
    loadSiteSettingsMap(),
  ])
  const locale = stringFromMap(settingsMap, 'default_locale').trim() || 'en-ZA'

  const canAddArticle = profile && ['admin', 'editor', 'author', 'business_owner'].includes(profile.role)

  return (
    <ArticlesArchivePage
      articles={articles}
      categories={categories}
      locale={locale}
      canAddArticle={!!canAddArticle}
      activeCategorySlug={null}
      title="All Articles"
      description="Stay informed with our comprehensive coverage of local news, business, sports, and community events."
    />
  )
}
