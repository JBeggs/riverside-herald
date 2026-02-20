import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { serverNewsApi } from '@/lib/api-server'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import CategoryManager from '@/components/dashboard/CategoryManager'
import { Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth_token')?.value

  if (!authToken) {
    redirect('/login')
  }

  let profile: Profile | null = null
  try {
    profile = await serverNewsApi.profile.get() as Profile
  } catch (error) {
    console.error('Error loading admin categories page:', error)
    redirect('/dashboard')
  }

  if (!profile) {
    redirect('/login')
  }

  if (!['admin', 'editor', 'business_owner'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout profile={profile}>
      <div className="p-4 md:p-6">
        <CategoryManager profile={profile} />
      </div>
    </DashboardLayout>
  )
}
