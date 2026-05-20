'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { authApi, apiClient, newsApi, getApiErrorMessage, drfErrorToMessage } from '@/lib/api'
import { Profile } from '@/lib/types'

interface User {
  id: string
  email: string
  username?: string
  first_name?: string
  last_name?: string
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  companyId: string | null
  /** True when logged-in user is owner of the active company (news tenant on login). */
  isCompanyOwner: boolean
  loading: boolean
  signIn: (
    username: string,
    password: string,
  ) => Promise<{
    error: string | null
    code?: string
    verificationEmailSent?: boolean
    verificationEmailCooldown?: boolean
  }>
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
    companyName?: string,
    userType?: 'author' | 'business_owner',
  ) => Promise<{
    error: string | null
    fieldErrors?: Record<string, string>
    verificationRequired?: boolean
    email?: string
  }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const RH_OWNER_STORAGE = 'rh_is_company_owner'

const REGISTRATION_FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  username: 'Username',
  password: 'Password',
  password_confirm: 'Password confirmation',
  phone: 'Cellphone',
  company_name: 'Company name',
  company_email: 'Company email',
  company_phone: 'Company phone',
  first_name: 'First name',
  last_name: 'Last name',
  full_name: 'Full name',
}

function registrationFieldErrorsFromApi(errorDetails: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (!errorDetails || typeof errorDetails !== 'object' || Array.isArray(errorDetails)) return out
  for (const [field, messages] of Object.entries(errorDetails as Record<string, unknown>)) {
    const text = drfErrorToMessage(messages, '').trim()
    if (text) out[field] = text
  }
  return out
}

function formatRegistrationErrorMessage(errorDetails: unknown): string {
  if (typeof errorDetails === 'string' && errorDetails.trim()) return errorDetails.trim()
  if (
    errorDetails != null &&
    typeof errorDetails === 'object' &&
    !Array.isArray(errorDetails)
  ) {
    const entries = Object.entries(errorDetails as Record<string, unknown>)
      .map(([field, messages]) => {
        const inner = drfErrorToMessage(messages, '').trim()
        if (!inner) return ''
        const fieldLabel =
          REGISTRATION_FIELD_LABELS[field] || field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')
        return `${fieldLabel}: ${inner}`
      })
      .filter(Boolean)
    if (entries.length > 0) return entries.join('. ')
  }
  const flat = drfErrorToMessage(errorDetails, '').trim()
  return flat || 'Registration failed. Please try again.'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [isCompanyOwner, setIsCompanyOwner] = useState(false)
  const [loading, setLoading] = useState(true)

  // Initialize from localStorage
  useEffect(() => {
    const token = apiClient.getToken()
    const storedCompanyId = apiClient.getCompanyId()
    
    if (token && storedCompanyId) {
      apiClient.setToken(token)
      apiClient.setCompanyId(storedCompanyId)
      setCompanyId(storedCompanyId)
      if (typeof window !== 'undefined') {
        setIsCompanyOwner(localStorage.getItem(RH_OWNER_STORAGE) === '1')
      }
      
      // Fetch user profile
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const profileData: any = await newsApi.profile.get()
      console.log('[DEBUG] Profile data fetched:', profileData)
      setProfile(profileData)
      
      // Extract user data from profile
      if (profileData.user) {
        // If user is just an ID, we need to get full user data
        // For now, construct from profile
          const userData = {
            id: profileData.user,
            email: profileData.email,
            username: profileData.username,
            first_name: profileData.first_name || profileData.full_name?.split(' ')[0],
            last_name: profileData.last_name || profileData.full_name?.split(' ').slice(1).join(' '),
          }
          console.log('[DEBUG] Setting user state:', userData)
          setUser(userData)
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
    try {
      const response = await authApi.login(username, password)
      
      setUser(response.user)
      setCompanyId(response.company?.id || null)
      const owns = Boolean((response.user as any)?.is_owner)
      setIsCompanyOwner(owns)
      if (typeof window !== 'undefined') {
        localStorage.setItem(RH_OWNER_STORAGE, owns ? '1' : '0')
      }
      
      // Fetch profile after login
      await fetchProfile()
      
      return { error: null }
    } catch (error: any) {
      console.error('Login error:', error)
      const errDetail = error?.details?.error
      const errFromDetails =
        typeof error?.details === 'object' && error?.details !== null
          ? typeof error.details.error === 'string'
            ? error.details.error
            : error.details.message
          : null
      const errorMessage =
        error?.message ||
        (typeof errDetail === 'string' ? errDetail : null) ||
        errFromDetails ||
        error.response?.data?.error ||
        'Login failed. Please check your username and password.'

      const details = error?.details as
        | {
            code?: string
            verification_email_sent?: boolean
            verification_email_cooldown?: boolean
          }
        | undefined
      const apiCodeFromDetails =
        details && typeof details.code === 'string' ? details.code : ''
      const apiCode =
        apiCodeFromDetails ||
        (error?.details && typeof error.details === 'object' && error.details !== null && 'code' in error.details
          ? String((error.details as { code?: string }).code || '')
          : '')
      const codeFromError =
        typeof error?.code === 'string' && !String(error.code).startsWith('HTTP_') ? error.code : ''
      const code =
        apiCode ||
        (typeof codeFromError === 'string' && codeFromError ? codeFromError : '')

      return {
        error: String(errorMessage),
        code:
          code === 'email_not_verified'
            ? 'email_not_verified'
            : code === 'phone_not_verified'
              ? 'phone_not_verified'
              : undefined,
        verificationEmailSent: details?.verification_email_sent === true,
        verificationEmailCooldown: details?.verification_email_cooldown === true,
      }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
    companyName?: string,  // Optional - if provided, creates business; otherwise regular user
    userType?: 'author' | 'business_owner'  // User type: author or business_owner
  ) => {
    try {
      const trimmedPhone = phone.trim()
      const response = await authApi.register({
        email,
        password,
        password_confirm: password,
        first_name: firstName,
        last_name: lastName,
        phone: trimmedPhone,
        role: userType === 'business_owner' ? undefined : 'author', // Set role for authors
        // Only include company fields if companyName is provided (business registration)
        ...(companyName ? {
          company_name: companyName,
          company_email: email,
          company_phone: trimmedPhone,
        } : {}),
      })

      const needsVerify =
        'email_verification_required' in response &&
        Boolean((response as { email_verification_required?: boolean }).email_verification_required)
      const accountLinked = Boolean(
        (response as { account_linked?: boolean }).account_linked,
      )
      if (needsVerify) {
        authApi.logout()
        setUser(null)
        setProfile(null)
        setCompanyId(null)
        setIsCompanyOwner(false)
        if (typeof window !== 'undefined') {
          localStorage.removeItem(RH_OWNER_STORAGE)
        }
        return { error: null, verificationRequired: true as const, email, accountLinked }
      }

      setUser(response.user)
      setCompanyId(response.company?.id || null)
      
      // Fetch profile after registration
      await fetchProfile()
      
      return { error: null, accountLinked }
    } catch (error: unknown) {
      console.error('Registration error:', error)

      const fallback = 'Registration failed. Please try again.'
      let errorMessage = getApiErrorMessage(error, fallback).trim() || fallback
      let fieldErrors: Record<string, string> | undefined

      const details =
        error && typeof error === 'object'
          ? (error as { details?: Record<string, unknown> }).details
          : undefined
      const errPayload =
        details && typeof details === 'object' && 'error' in details ? details.error : undefined

      if (
        typeof errPayload === 'object' &&
        errPayload !== null &&
        !Array.isArray(errPayload)
      ) {
        fieldErrors = registrationFieldErrorsFromApi(errPayload)
        errorMessage = formatRegistrationErrorMessage(errPayload)
      }

      const extraDetails =
        (!fieldErrors || Object.keys(fieldErrors).length === 0) &&
        details &&
        typeof details === 'object' &&
        !('error' in details && typeof (details as { error?: unknown }).error === 'object')

      if (
        extraDetails &&
        !(typeof errPayload === 'string' && errPayload.trim())
      ) {
        const raw = Object.fromEntries(
          Object.entries(details).filter(
            ([key]) => key !== 'error' && key !== 'message' && key !== 'detail',
          ),
        )
        if (raw && typeof raw === 'object' && Object.keys(raw).length > 0) {
          fieldErrors = registrationFieldErrorsFromApi(raw)
          errorMessage = formatRegistrationErrorMessage(raw)
        }
      }

      return {
        error: errorMessage.trim() || fallback,
        ...(fieldErrors && Object.keys(fieldErrors).length ? { fieldErrors } : {}),
      }
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      authApi.logout()
      setUser(null)
      setProfile(null)
      setCompanyId(null)
      setIsCompanyOwner(false)
      if (typeof window !== 'undefined') {
        localStorage.removeItem(RH_OWNER_STORAGE)
      }
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
    isCompanyOwner,
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
