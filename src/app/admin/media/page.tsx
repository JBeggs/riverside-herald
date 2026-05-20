import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { serverNewsApi } from '@/lib/api-server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import MediaLibrary from '@/components/admin/MediaLibrary'
import type { Profile } from '@/lib/types'

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
    let profile: Profile | null = null
    try {
      profile = (await serverNewsApi.profile.get()) as Profile
    } catch (profileError: unknown) {
      console.error('Profile fetch error:', profileError)
      const err = profileError as { code?: string }
      if (err.code === 'HTTP_401' || err.code === 'HTTP_403') {
        redirect('/login')
      }
      throw err
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
        <MediaLibrary profile={profile} />
      </DashboardLayout>
    )
  } catch (error: unknown) {
    console.error('Error loading media page:', error)
    const err = error as { code?: string }
    if (err.code === 'HTTP_401' || err.code === 'HTTP_403') {
      redirect('/login')
    }
    
    redirect('/dashboard')
  }
}