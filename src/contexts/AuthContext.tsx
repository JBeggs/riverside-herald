'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { authApi, apiClient, newsApi } from '@/lib/api'

interface User {
  id: string
  email: string
  username?: string
  first_name?: string
  last_name?: string
}

interface Profile {
  user: string
  email: string
  username?: string
  full_name?: string
  bio?: string
  avatar_url?: string
  role: 'user' | 'admin' | 'editor' | 'author' | 'business_owner' | 'subscriber' | 'premium_subscriber'
  is_verified: boolean
  social_links: Record<string, string>
  preferences: Record<string, any>
  last_seen_at?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  companyId: string | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, fullName: string, companyName?: string, userType?: 'author' | 'business_owner') => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage
  useEffect(() => {
    const token = apiClient.getToken()
    const storedCompanyId = apiClient.getCompanyId()
    
    if (token && storedCompanyId) {
      apiClient.setToken(token)
      apiClient.setCompanyId(storedCompanyId)
      setCompanyId(storedCompanyId)
      
      // Fetch user profile
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const profileData: any = await newsApi.profile.get()
      setProfile(profileData)
      
      // Extract user data from profile
      if (profileData.user) {
        // If user is just an ID, we need to get full user data
        // For now, construct from profile
          setUser({
            id: profileData.user,
            email: profileData.email,
            username: profileData.username,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
          })
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      // If profile doesn't exist, that's okay - user might not have one yet
      if (error.code !== 'HTTP_404') {
        // Only clear auth if it's not a 404 (profile not found)
        // For 404, we'll keep the token and let them create a profile
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    await fetchProfile()
  }

  const signIn = async (username: string, password: string) => {
    setLoading(true)
    try {
      const response = await authApi.login(username, password)
      
      setUser(response.user)
      setCompanyId(response.company?.id || null)
      
      // Fetch profile after login
      await fetchProfile()
      
      return { error: null }
    } catch (error: any) {
      console.error('Login error:', error)
      // Extract error message from response
      const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please check your username and password.'
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    companyName?: string,  // Optional - if provided, creates business; otherwise regular user
    userType?: 'author' | 'business_owner'  // User type: author or business_owner
  ) => {
    setLoading(true)
    try {
      const response = await authApi.register({
        email,
        password,
        password_confirm: password,
        full_name: fullName,
        role: userType === 'business_owner' ? undefined : 'author', // Set role for authors
        // Only include company fields if companyName is provided (business registration)
        ...(companyName ? {
          company_name: companyName,
          company_email: email,
        } : {}),
      })
      
      setUser(response.user)
      setCompanyId(response.company?.id || null)
      
      // Fetch profile after registration
      await fetchProfile()
      
      return { error: null }
    } catch (error: any) {
      // Log full error structure for debugging - use JSON.stringify to avoid circular reference issues
      try {
        console.error('Registration error - message:', error?.message)
        console.error('Registration error - code:', error?.code)
        console.error('Registration error - status:', error?.status)
        console.error('Registration error - url:', error?.url)
        console.error('Registration error - details:', error?.details)
        console.error('Registration error - full error (stringified):', JSON.stringify(error, null, 2))
      } catch (e) {
        console.error('Registration error - could not serialize:', error)
      }
      
      // Extract error message from API error structure
      let errorMessage = 'Registration failed. Please try again.'
      
      // Backend returns {error: {field: ['message']}} structure in details
      if (error?.details?.error) {
        const errorDetails = error.details.error
        if (typeof errorDetails === 'string') {
          errorMessage = errorDetails
        } else if (typeof errorDetails === 'object' && errorDetails !== null) {
          // Format field errors in a user-friendly way
          const fieldLabels: Record<string, string> = {
            email: 'Email',
            username: 'Username',
            password: 'Password',
            password_confirm: 'Password confirmation',
            company_name: 'Company name',
            company_email: 'Company email',
            first_name: 'First name',
            last_name: 'Last name',
            full_name: 'Full name',
          }
          
          const errorMessages = Object.entries(errorDetails).map(([field, messages]: [string, any]) => {
            const fieldLabel = fieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')
            const messageArray = Array.isArray(messages) ? messages : [messages]
            const messageText = messageArray.join(', ')
            return `${fieldLabel}: ${messageText}`
          })
          errorMessage = errorMessages.join('. ')
        }
      } else if (error?.details && typeof error.details === 'object') {
        // Try to extract from details object directly
        if (error.details.detail) {
          errorMessage = error.details.detail
        } else if (error.details.message) {
          errorMessage = error.details.message
        } else if (Object.keys(error.details).length > 0) {
          // If there are field errors in details, format them
          const fieldLabels: Record<string, string> = {
            email: 'Email',
            username: 'Username',
            password: 'Password',
            company_name: 'Company name',
          }
          
          const errorMessages = Object.entries(error.details)
            .filter(([key]) => key !== 'error' && key !== 'message' && key !== 'detail')
            .map(([field, value]: [string, any]) => {
              const fieldLabel = fieldLabels[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')
              const messageText = Array.isArray(value) ? value.join(', ') : String(value)
              return `${fieldLabel}: ${messageText}`
            })
          
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('. ')
          }
        }
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      authApi.logout()
      setUser(null)
      setProfile(null)
      setCompanyId(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    profile,
    companyId,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
