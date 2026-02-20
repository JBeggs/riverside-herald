import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { serverNewsApi } from '@/lib/api-server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AdminSection from '@/components/profile/AdminSection'
import type { Profile } from '@/lib/types'

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // Check for auth token in cookies
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth_token')?.value

  if (!authToken) {
    redirect('/login')
  }

  try {
    // Get user profile to check role
    let profile: Profile | null = null
    try {
      profile = (await serverNewsApi.profile.get()) as Profile
    } catch (profileError: unknown) {
      console.error('Profile fetch error:', profileError)
      const err = profileError as { code?: string }
      if (err.code === 'HTTP_401' || err.code === 'HTTP_403') {
        redirect('/login')
      }
      if (err.code === 'HTTP_404') {
        redirect('/profile')
      }
      throw err
    }
    
    if (!profile || !profile.user) {
      redirect('/login')
    }

    // Check if user has admin/editor/business_owner role
    if (!['admin', 'editor', 'business_owner'].includes(profile.role)) {
      redirect('/dashboard')
    }

    // Get system stats for admin panel
    let systemStats: { totalArticles: number; totalUsers: number; totalBusinesses: number } | null = null
    if (['admin', 'editor', 'business_owner'].includes(profile.role)) {
      try {
        const stats = await serverNewsApi.stats.dashboard() as Record<string, unknown>
        systemStats = {
          totalArticles: Number(stats?.total_articles) || 0,
          totalUsers: Number(stats?.total_users) || 0,
          totalBusinesses: Number(stats?.total_businesses) || 0,
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
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
        <div className="p-4 md:p-6">
          <AdminSection 
            profile={profile}
            systemStats={systemStats ?? undefined}
          />
        </div>
      </DashboardLayout>
    )
  } catch (error: unknown) {
    console.error('Error loading admin page:', error)
    const err = error as { code?: string }
    if (err.code === 'HTTP_401' || err.code === 'HTTP_403') {
      redirect('/login')
    }
    
    // For other errors, redirect to dashboard
    redirect('/dashboard')
  }
}

