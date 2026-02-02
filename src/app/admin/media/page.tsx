import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { serverNewsApi } from '@/lib/api-server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import MediaLibrary from '@/components/admin/MediaLibrary'

// Force dynamic rendering since we use cookies
export const dynamic = 'force-dynamic'

export default async function MediaPage() {
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
      if (profileError.code === 'HTTP_401' || profileError.code === 'HTTP_403') {
        redirect('/login')
      }
      throw profileError
    }
    
    if (!profile || !profile.user) {
      redirect('/login')
    }

    // Check if user has access to media library
    if (!['admin', 'editor', 'author', 'business_owner'].includes(profile.role)) {
      redirect('/dashboard')
    }

    return (
      <DashboardLayout profile={profile}>
        <div className="p-4 md:p-6">
          <MediaLibrary profile={profile} />
        </div>
      </DashboardLayout>
    )
  } catch (error: any) {
    console.error('Error loading media page:', error)
    
    if (error.code === 'HTTP_401' || error.code === 'HTTP_403') {
      redirect('/login')
    }
    
    redirect('/dashboard')
  }
}