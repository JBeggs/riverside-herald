'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/lib/api'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Clear any invalid tokens/cookies when landing on login page
    // This handles cases where server redirected here due to 401 errors
    if (typeof window !== 'undefined') {
      // Clear localStorage tokens
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('company_id')
      // Clear cookies
      document.cookie = 'auth_token=; path=/; max-age=0'
      document.cookie = 'company_id=; path=/; max-age=0'
      // Clear API client state
      authApi.logout()
    }
  }, [])

  useEffect(() => {
    // Only redirect if user is logged in AND has a profile
    // This prevents redirect loops when profile doesn't exist yet
    if (!loading && user && profile) {
      const timer = setTimeout(() => {
        router.push('/profile')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg font-body">
        <div className="animate-pulse text-text-muted">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4 font-body">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-playfair font-semibold text-text mb-2">Welcome Back</h1>
          <p className="text-text-muted text-sm">Sign in to access your profile and dashboard</p>
        </div>
        <LoginForm onSuccess={() => router.push('/profile')} />
        <p className="mt-6 text-center text-sm text-text-muted">
          <a href="/register" className="text-primary font-medium hover:opacity-90">
            Create an account
          </a>
        </p>
      </div>
    </div>
  )
}

