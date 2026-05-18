import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { serverNewsApi } from '@/lib/api-server'
import { getHomeHeroImageFileUrlFromPayload } from '@/lib/page-hero'
import ProfilePage from '@/components/profile/ProfilePage'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default async function Profile() {
  // Check for auth token in cookies
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth_token')?.value

  if (!authToken) {
    redirect('/login')
  }

  try {
    // Get user profile data (token is automatically read from cookies by serverApi)
    // The endpoint is /api/news/profiles/me/ which should auto-create profile if missing
    let profile: any
    try {
      profile = await serverNewsApi.profile.get()
    } catch (e: any) {
      // If 404, try without trailing slash
      if (e.code === 'HTTP_404') {
        try {
          profile = await serverNewsApi.profile.getMe()
        } catch (e2: any) {
          // If still 404, user might not be authenticated or endpoint doesn't exist
          console.error('Profile endpoint not found:', e2)
          throw new Error('Profile endpoint not available. Please ensure you are logged in and the backend is running.')
        }
      } else {
        throw e
      }
    }
    
    if (!profile || !profile.user) {
      throw new Error('Profile not found or invalid')
    }

    // Get additional data based on role
    let additionalData: any = {}
    
    if (profile?.role === 'author' || profile?.role === 'admin' || profile?.role === 'editor' || profile?.role === 'business_owner') {
      // Get author's or business owner's articles
      const articlesData: any = await serverNewsApi.articles.list({
        author: profile.user,
        limit: 10
      })
      
      additionalData = { 
        ...additionalData, 
        articles: articlesData?.results || articlesData || [] 
      }
    }

    if (profile?.role === 'admin' || profile?.role === 'editor') {
      // Get system stats for admins/editors (token is automatically read from cookies)
      try {
        const stats: any = await serverNewsApi.stats.dashboard()
        const s = stats || {}
        additionalData = { 
          ...additionalData, 
          systemStats: {
            totalArticles: Number(s.total_articles ?? s.totalArticles ?? 0) || 0,
            totalUsers: Number(s.total_users ?? s.totalUsers ?? 0) || 0,
            totalBusinesses: Number(s.total_businesses ?? s.totalBusinesses ?? 0) || 0
          }
        }
      } catch (e) {
        console.error('Error fetching dashboard stats:', e)
        additionalData = { ...additionalData, systemStats: { totalArticles: 0, totalUsers: 0, totalBusinesses: 0 } }
      }
    }

    // Get user's businesses with enhanced detection
    let ownedBusinesses: any[] = []
    
    try {
      // Method 1: Direct ownership query
      const businessesData: any = await serverNewsApi.businesses.list({
        owner: profile.user
      })
      ownedBusinesses = businessesData?.results || businessesData || []
      
      // Debug logging for business ownership detection
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Business Ownership Debug:', {
          profileUser: profile.user,
          profileEmail: profile.email,
          profileRole: profile.role,
          businessesFound: ownedBusinesses.length,
          businessNames: ownedBusinesses.map(b => b.name)
        })
      }
      
      // Method 2: If no businesses found but user has business_owner role, try email-based lookup
      if (ownedBusinesses.length === 0 && profile.role === 'business_owner' && profile.email) {
        try {
          const emailBasedData: any = await serverNewsApi.businesses.list({
            search: profile.email // Search by email in business records
          })
          const emailBusinesses = emailBasedData?.results || emailBasedData || []
          
          if (emailBusinesses.length > 0) {
            ownedBusinesses = emailBusinesses
            console.log('📧 Found businesses via email search:', emailBusinesses.length)
          }
        } catch (emailError) {
          console.log('Email-based business search failed:', emailError)
        }
      }
      
      // Method 3: If still no businesses, get all businesses and filter client-side for debugging
      if (ownedBusinesses.length === 0 && profile.role === 'business_owner') {
        try {
          const allBusinessesData: any = await serverNewsApi.businesses.list({ skipTenant: true })
          const allBusinesses = allBusinessesData?.results || allBusinessesData || []
          
          console.log('🔍 All businesses check:', {
            totalBusinesses: allBusinesses.length,
            businessOwnersIds: allBusinesses.map((b: any) => ({ name: b.name, owner_id: b.owner_id, email: b.email })),
            lookingForOwnerId: profile.user,
            lookingForEmail: profile.email
          })
          
          // Look for businesses with matching owner fields
          const possibleMatches = allBusinesses.filter((business: any) => 
            business.owner_id === profile.user || 
            business.email === profile.email ||
            (business.owner && business.owner === profile.user)
          )
          
          if (possibleMatches.length > 0) {
            console.log('🎯 Found potential business matches:', possibleMatches.map((b: any) => b.name))
          }
        } catch (allBusinessError) {
          console.log('All businesses debug check failed:', allBusinessError)
        }
      }
      
    } catch (error) {
      console.error('Error fetching businesses:', error)
      ownedBusinesses = []
    }

    // Match public homepage/cards: when Business.cover_image is empty but a home PageHero exists, show that banner in owner profile/admin cards.
    if (ownedBusinesses.length > 0) {
      ownedBusinesses = await Promise.all(
        ownedBusinesses.map(async (b: any) => {
          if (b?.cover_image?.file_url) return b
          const slug = String(b?.slug || '').trim()
          if (!slug) return b
          try {
            const raw = await serverNewsApi.pageHeroes.listForHome(slug)
            const url = getHomeHeroImageFileUrlFromPayload(raw)
            if (!url) return b
            return {
              ...b,
              cover_image: {
                ...(typeof b.cover_image === 'object' && b.cover_image ? b.cover_image : {}),
                file_url: url,
              },
            }
          } catch {
            return b
          }
        }),
      )
    }

    additionalData = { 
      ...additionalData, 
      ownedBusinesses 
    }

    // Construct user object from profile
    const user = {
      id: profile.user,
      email: profile.email || '',
      username: profile.username || '',
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
    }

    return (
      <DashboardLayout profile={profile}>
        <ProfilePage 
          user={user} 
          profile={profile} 
          additionalData={additionalData}
        />
      </DashboardLayout>
    )
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    
    // Only redirect to login for authentication errors (401/403)
    // For 404, the profile might not exist yet - don't redirect to prevent loops
    if (error.code === 'HTTP_401' || error.code === 'HTTP_403') {
      // Cannot delete cookies in server components - redirect to login
      // Invalid cookies will be ignored by the API and can be cleared client-side
      redirect('/login')
    }
    
    // For 404 or other errors, show error message instead of redirecting
    // This prevents redirect loops
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Profile</h1>
          <p className="text-gray-600 mb-2">
            {error.code === 'HTTP_404' 
              ? 'Your profile could not be found. This might happen if:'
              : 'An error occurred while loading your profile:'}
          </p>
          {error.code === 'HTTP_404' && (
            <ul className="text-left text-sm text-gray-600 mb-6 space-y-1 list-disc list-inside">
              <li>Your profile hasn't been created yet</li>
              <li>The API endpoint is not available</li>
              <li>There's a connection issue</li>
            </ul>
          )}
          {error.code !== 'HTTP_404' && (
            <p className="text-sm text-gray-600 mb-6">{error.message || 'Unknown error'}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Home
            </Link>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Login Again
            </Link>
          </div>
        </div>
      </div>
    )
  }
}
