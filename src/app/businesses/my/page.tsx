import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { serverNewsApi } from '@/lib/api-server'

export default async function MyBusinessPage() {
  // Check for auth token in cookies
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth_token')?.value

  if (!authToken) {
    redirect('/login')
  }

  try {
    // Get user profile first
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

    // Check if user is business owner
    if (profile.role !== 'business_owner') {
      redirect('/dashboard')
    }

    // Try to find user's business
    try {
      const businessesData: any = await serverNewsApi.businesses.list({
        owner: profile.user,
        limit: 1
      })
      
      const businesses = Array.isArray(businessesData) ? businessesData : (businessesData?.results || [])
      
      if (businesses.length > 0) {
        // User has a business - redirect to edit page
        const business = businesses[0]
        redirect(`/businesses/${business.slug}/edit`)
      } else {
        // User doesn't have a business - redirect to creation
        redirect('/businesses/create')
      }
      
    } catch (businessError: any) {
      console.error('Error fetching user businesses:', businessError)
      // If there's an error fetching businesses, default to creation page
      redirect('/businesses/create')
    }
    
  } catch (error: any) {
    console.error('Error in MyBusinessPage:', error)
    
    // Only redirect to login for authentication errors
    if (error.code === 'HTTP_401' || error.code === 'HTTP_403') {
      redirect('/login')
    }
    
    // For other errors, redirect to dashboard
    redirect('/dashboard')
  }
}