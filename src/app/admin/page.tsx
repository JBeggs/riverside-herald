import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { serverNewsApi } from '@/lib/api-server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AdminSection from '@/components/profile/AdminSection'

export default async function AdminPage() {
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
      console.error('Profile fetch error:', profileError)
      // If 401/403, not authenticated - redirect to login
      if (profileError.code === 'HTTP_401' || profileError.code === 'HTTP_403') {
        redirect('/login')
      }
      // If 404, profile might not exist
      if (profileError.code === 'HTTP_404') {
        redirect('/profile')
      }
      throw profileError
    }
    
    if (!profile || !profile.user) {
      redirect('/login')
    }

    // Check if user has admin/editor role
    if (!['admin', 'editor'].includes(profile.role)) {
      redirect('/dashboard')
    }

    // Get system stats for admin panel
    let systemStats: any = null
    if (profile.role === 'admin' || profile.role === 'editor') {
      try {
        const stats = await serverNewsApi.stats.dashboard()
        systemStats = {
          totalArticles: stats?.total_articles || 0,
          totalUsers: stats?.total_users || 0,
          totalBusinesses: stats?.total_businesses || 0,
        }
      } catch (statsError: any) {
        console.error('Error fetching stats:', statsError)
        // Continue without stats if unavailable
        systemStats = {
          totalArticles: 0,
          totalUsers: 0,
          totalBusinesses: 0,
        }
      }
    }

    return (
      <DashboardLayout profile={profile}>
        <div className="p-6">
          <AdminSection 
            profile={profile}
            systemStats={systemStats}
          />
        </div>
      </DashboardLayout>
    )
  } catch (error: any) {
    console.error('Error loading admin page:', error)
    
    // Only redirect to login for authentication errors
    if (error.code === 'HTTP_401' || error.code === 'HTTP_403') {
      redirect('/login')
    }
    
    // For other errors, redirect to dashboard
    redirect('/dashboard')
  }
}

