'use client'

import { useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/lib/api'
import SignUpForm from '@/components/auth/SignUpForm'

export default function RegisterPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const defaultUserType = useMemo<'author' | 'business_owner' | 'user' | undefined>(() => {
    const raw = searchParams.get('type')?.toLowerCase()
    if (raw === 'business_owner' || raw === 'business') return 'business_owner'
    if (raw === 'author') return 'author'
    if (raw === 'user') return 'user'
    return undefined
  }, [searchParams])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('company_id')
    document.cookie = 'auth_token=; path=/; max-age=0'
    document.cookie = 'company_id=; path=/; max-age=0'
    authApi.logout()
  }, [])

  useEffect(() => {
    if (!loading && user && profile) {
      const t = setTimeout(() => router.push('/profile'), 100)
      return () => clearTimeout(t)
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg font-body">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    )
  }

  if (user && profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4 font-body">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-playfair font-semibold text-text mb-2">Join Riverside Herald</h1>
          <p className="text-text-muted text-sm">Create an account to read, write, and connect</p>
        </div>
        <SignUpForm defaultUserType={defaultUserType} onSuccess={() => router.push('/profile')} />
        <p className="mt-6 text-center text-sm text-text-muted">
          <a href="/login" className="text-primary font-medium hover:opacity-90">
            Back to sign in
          </a>
        </p>
      </div>
    </div>
  )
}
