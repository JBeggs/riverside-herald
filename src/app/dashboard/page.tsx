import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { serverNewsApi } from '@/lib/api-server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardOverview from '@/components/dashboard/DashboardOverview'

export default async function DashboardPage() {
  // Check for auth token in cookies
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth_token')?.value

  if (!authToken) {
    redirect('/login')
  }

  try {
    // Get user profile to check role
    let profile: any
    try {
      profile = await serverNewsApi.profile.get()
    } catch (profileError: any) {
      console.error('Profile fetch error:', {
        code: profileError.code,
        message: profileError.message,
        url: profileError.url,
        status: profileError.status,
      })
      // If 401/403, not authenticated - redirect to login
      if (profileError.code === 'HTTP_401' || profileError.code === 'HTTP_403') {
        redirect('/login')
      }
      // If 404, endpoint might not exist or profile missing
      if (profileError.code === 'HTTP_404') {
        console.error('Profile endpoint returned 404. Check:')
        console.error('1. Is the endpoint registered? /api/news/profiles/me/')
        console.error('2. Is the user authenticated? (check auth_token cookie)')
        console.error('3. Does the profile exist? (run seed command)')
        throw new Error(`Profile endpoint not found (404). URL: ${profileError.url || '/api/news/profiles/me/'}`)
      }
      throw profileError
    }
    
    if (!profile || !profile.user) {
      redirect('/login')
    }

    // Check if user has admin/editor/author/business_owner role
    if (!['admin', 'editor', 'author', 'business_owner'].includes(profile.role)) {
      redirect('/profile')
    }

    // Get dashboard stats (requires company ID)
    let stats: any = null
    if (profile.role === 'admin' || profile.role === 'editor') {
      try {
        const raw: any = await serverNewsApi.stats.dashboard()
        const s = raw || {}
        stats = {
          totalArticles: Number(s.total_articles ?? s.totalArticles ?? 0) || 0,
          totalUsers: Number(s.total_users ?? s.totalUsers ?? 0) || 0,
          totalBusinesses: Number(s.total_businesses ?? s.totalBusinesses ?? 0) || 0
        }
      } catch (statsError: any) {
        console.error('Error fetching stats:', statsError)
        stats = { totalArticles: 0, totalUsers: 0, totalBusinesses: 0 }
      }
    }

    // Get recent articles (also requires company ID, but more forgiving)
    let recentArticles: any[] = []
    try {
      const articleParams: any = {
        limit: 10,
        ordering: '-created_at'
      }
      
      // Filter by author if user is author or business_owner (not admin/editor)
      if ((profile.role === 'author' || profile.role === 'business_owner') && profile.user) {
        articleParams.author = profile.user
      }
      
      const articlesData: any = await serverNewsApi.articles.list(articleParams)
      recentArticles = articlesData?.results || articlesData || []
    } catch (articlesError: any) {
      console.error('Error fetching articles:', articlesError)
      // Continue without articles if company ID missing
    }

    return (
      <DashboardLayout profile={profile}>
        <DashboardOverview 
          profile={profile}
          stats={stats}
          recentArticles={recentArticles}
        />
      </DashboardLayout>
    )
  } catch (error: any) {
    console.error('Error loading dashboard:', error)
    
    // Only redirect to login for authentication errors
    if (error.code === 'HTTP_401' || error.code === 'HTTP_403') {
      redirect('/login')
    }
    
    // Show error page for other errors
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-6">{error.message || 'An error occurred'}</p>
          <a
            href="/profile"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Profile
          </a>
        </div>
      </div>
    )
  }
}

