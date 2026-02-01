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

  try {
    const profile = await serverNewsApi.profile.get() as Profile
    
    if (!profile) {
      redirect('/login')
    }

    // Admins and Editors can access the page, but only Admin can edit (handled in component)
    if (!['admin', 'editor'].includes(profile.role)) {
      redirect('/dashboard')
    }

    return (
      <DashboardLayout profile={profile}>
        <div className="p-4 md:p-6">
          <CategoryManager profile={profile} />
        </div>
      </DashboardLayout>
    )
  } catch (error) {
    console.error('Error loading admin categories page:', error)
    redirect('/dashboard')
  }
}
