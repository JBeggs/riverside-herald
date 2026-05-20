'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Building2, Phone } from 'lucide-react'

interface SignUpFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
  className?: string
  showCompanyName?: boolean
  defaultUserType?: 'author' | 'business_owner' | 'user'
}

const inputIconWrap =
  'block w-full pl-10 pr-3 py-3 border rounded-lg transition-colors bg-[rgb(var(--color-surface))] text-text border-border-default placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]'
const inputIconWrapPassword =
  'block w-full pl-10 pr-12 py-3 border rounded-lg transition-colors bg-[rgb(var(--color-surface))] text-text border-border-default placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]'
const inputErrorRing = 'border-red-500 focus:ring-red-500/40'

function countDigits(value: string) {
  return value.replace(/\D/g, '').length
}

function scrollFieldIntoView(id: string) {
  if (typeof document === 'undefined') return
  const el = document.getElementById(id)
  if (el && typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

export default function SignUpForm({ onSuccess, onSwitchToLogin, className = '', defaultUserType }: SignUpFormProps) {
  const [userType, setUserType] = useState<'author' | 'business_owner'>(
    defaultUserType === 'business_owner' ? 'business_owner' : 'author',
  )
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { signUp } = useAuth()
  const { showError, showSuccess } = useToast()
  const router = useRouter()

  const clearFieldError = (apiField: string) => {
    setFieldErrors((prev) => {
      if (!prev[apiField]) return prev
      const next = { ...prev }
      delete next[apiField]
      return next
    })
  }

  const handleInputChange = (apiField: string, formKey: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [formKey]: value }))
    setError('')
    clearFieldError(apiField)
  }

  const validateForm = (): { message?: string; focusId?: string } => {
    if (!formData.firstName.trim()) {
      return { message: 'Please enter your first name', focusId: 'register-first-name' }
    }

    if (!formData.lastName.trim()) {
      return { message: 'Please enter your last name', focusId: 'register-last-name' }
    }

    if (userType === 'business_owner' && !formData.companyName.trim()) {
      return { message: 'Please enter your company name', focusId: 'register-company-name' }
    }

    const phoneTrim = formData.phone.trim()
    if (!phoneTrim) {
      return { message: 'Please enter your cellphone number', focusId: 'register-phone' }
    }
    if (countDigits(phoneTrim) < 8) {
      return {
        message: 'Cellphone must include at least 8 digits',
        focusId: 'register-phone',
      }
    }

    if (!formData.email.trim()) {
      return { message: 'Please enter your email address', focusId: 'register-email' }
    }

    if (!formData.email.includes('@')) {
      return { message: 'Please enter a valid email address', focusId: 'register-email' }
    }

    if (!formData.password) {
      return { message: 'Please enter a password', focusId: 'register-password' }
    }

    if (formData.password.length < 6) {
      return { message: 'Password must be at least 6 characters long', focusId: 'register-password' }
    }

    if (formData.password !== formData.confirmPassword) {
      return { message: 'Passwords do not match', focusId: 'register-password-confirm' }
    }

    return {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setSuccess('')
    setIsLoading(true)

    const { message: validationError, focusId } = validateForm()
    if (validationError) {
      setError(validationError)
      setIsLoading(false)
      if (focusId) scrollFieldIntoView(focusId)
      return
    }

    try {
      const {
        error: signUpError,
        fieldErrors: serverFieldErrors,
        verificationRequired,
        email: verificationEmail,
      } = await signUp(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.phone.trim(),
        userType === 'business_owner' ? formData.companyName.trim() : undefined,
        userType,
      )

      if (signUpError) {
        setError(signUpError)
        showError(signUpError)
        if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
          setFieldErrors(serverFieldErrors)
          const order = [
            'first_name',
            'last_name',
            'company_name',
            'phone',
            'email',
            'password',
            'password_confirm',
          ]
          const first = order.find((k) => serverFieldErrors[k])
          if (first === 'first_name') scrollFieldIntoView('register-first-name')
          else if (first === 'last_name') scrollFieldIntoView('register-last-name')
          else if (first === 'company_name') scrollFieldIntoView('register-company-name')
          else if (first === 'phone') scrollFieldIntoView('register-phone')
          else if (first === 'email') scrollFieldIntoView('register-email')
          else if (first === 'password') scrollFieldIntoView('register-password')
          else if (first === 'password_confirm') scrollFieldIntoView('register-password-confirm')
        }
      } else if (verificationRequired && verificationEmail) {
        showSuccess('Check your email to verify your account before signing in.')
        router.push(`/auth/verify-email?email=${encodeURIComponent(verificationEmail.trim())}`)
      } else {
        const successMessage =
          userType === 'business_owner'
            ? 'Business account created successfully! You can now login with your credentials.'
            : 'Account created successfully! You can now login with your credentials.'
        setSuccess(successMessage)
        showSuccess(successMessage)
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          companyName: '',
          password: '',
          confirmPassword: '',
        })
        setUserType('author')
        setFieldErrors({})
        setTimeout(() => {
          onSuccess?.()
        }, 2000)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const fe = fieldErrors

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-surface rounded-2xl shadow-card border border-border-default p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-[rgb(var(--color-on-accent))]" />
          </div>
          <h2 className="text-2xl font-playfair font-semibold text-text mb-2">Create Account</h2>
          <p className="text-text-muted">Choose your account type and join our community</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-text mb-3">Account Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setUserType('author')
                setFormData((prev) => ({ ...prev, companyName: '' }))
                setError('')
                setFieldErrors({})
              }}
              className={`p-4 border-2 rounded-lg transition-all ${
                userType === 'author'
                  ? 'border-[rgb(var(--color-ring))] bg-[rgb(var(--color-surface-raised)/0.5)] text-text ring-2 ring-[rgb(var(--color-ring)/0.25)]'
                  : 'border-border-default bg-[rgb(var(--color-surface))] text-text-muted hover:border-border-default'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <User className="w-6 h-6" />
                <span className="font-medium text-text">Author</span>
                <span className="text-xs text-center text-text-muted">Create articles and content</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => {
                setUserType('business_owner')
                setError('')
                setFieldErrors({})
              }}
              className={`p-4 border-2 rounded-lg transition-all ${
                userType === 'business_owner'
                  ? 'border-[rgb(var(--color-ring))] bg-[rgb(var(--color-surface-raised)/0.5)] text-text ring-2 ring-[rgb(var(--color-ring)/0.25)]'
                  : 'border-border-default bg-[rgb(var(--color-surface))] text-text-muted hover:border-border-default'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <Building2 className="w-6 h-6" />
                <span className="font-medium text-text">Business Owner</span>
                <span className="text-xs text-center text-text-muted">Register your business</span>
              </div>
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        ) : null}

        {success ? (
          <div className="mb-6 p-4 bg-[rgb(var(--color-surface-raised))] border border-border-default rounded-lg">
            <p className="text-text text-sm">{success}</p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="register-first-name" className="block text-sm font-medium text-text mb-2">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  id="register-first-name"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('first_name', 'firstName', e.target.value)}
                  data-cy="register-first-name"
                  aria-invalid={Boolean(fe.first_name)}
                  className={`${inputIconWrap} ${fe.first_name ? inputErrorRing : ''}`}
                  placeholder="First name"
                  required
                />
              </div>
              {fe.first_name ? <p className="mt-1 text-xs text-red-600">{fe.first_name}</p> : null}
            </div>

            <div>
              <label htmlFor="register-last-name" className="block text-sm font-medium text-text mb-2">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  id="register-last-name"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('last_name', 'lastName', e.target.value)}
                  data-cy="register-last-name"
                  aria-invalid={Boolean(fe.last_name)}
                  className={`${inputIconWrap} ${fe.last_name ? inputErrorRing : ''}`}
                  placeholder="Last name"
                  required
                />
              </div>
              {fe.last_name ? <p className="mt-1 text-xs text-red-600">{fe.last_name}</p> : null}
            </div>
          </div>

          {userType === 'business_owner' ? (
            <div>
              <label htmlFor="register-company-name" className="block text-sm font-medium text-text mb-2">
                Company Name <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-text-muted" />
                </div>
                <input
                  id="register-company-name"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('company_name', 'companyName', e.target.value)}
                  aria-invalid={Boolean(fe.company_name)}
                  className={`${inputIconWrap} ${fe.company_name ? inputErrorRing : ''}`}
                  placeholder="Enter your company name"
                  required={userType === 'business_owner'}
                />
              </div>
              {fe.company_name ? <p className="mt-1 text-xs text-red-600">{fe.company_name}</p> : null}
              <p className="mt-1 text-xs text-text-muted">This will create your business listing on the platform.</p>
            </div>
          ) : null}

          <div>
            <label htmlFor="register-phone" className="block text-sm font-medium text-text mb-2">
              Cellphone <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-text-muted" />
              </div>
              <input
                id="register-phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', 'phone', e.target.value)}
                data-cy="register-phone"
                aria-invalid={Boolean(fe.phone)}
                className={`${inputIconWrap} ${fe.phone ? inputErrorRing : ''}`}
                placeholder="Your mobile number"
                required
              />
            </div>
            {fe.phone ? <p className="mt-1 text-xs text-red-600">{fe.phone}</p> : null}
            <p className="mt-1 text-xs text-text-muted">Used for your profile and sign-in verification where required.</p>
          </div>

          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-text mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-text-muted" />
              </div>
              <input
                id="register-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', 'email', e.target.value)}
                data-cy="register-email"
                aria-invalid={Boolean(fe.email)}
                className={`${inputIconWrap} ${fe.email ? inputErrorRing : ''}`}
                placeholder="Enter your email"
                required
              />
            </div>
            {fe.email ? <p className="mt-1 text-xs text-red-600">{fe.email}</p> : null}
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-text mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-text-muted" />
              </div>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', 'password', e.target.value)}
                data-cy="register-password"
                aria-invalid={Boolean(fe.password)}
                className={`${inputIconWrapPassword} ${fe.password ? inputErrorRing : ''}`}
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {fe.password ? <p className="mt-1 text-xs text-red-600">{fe.password}</p> : null}
            <p className="mt-1 text-xs text-text-muted">Must be at least 6 characters</p>
          </div>

          <div>
            <label htmlFor="register-password-confirm" className="block text-sm font-medium text-text mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-text-muted" />
              </div>
              <input
                id="register-password-confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('password_confirm', 'confirmPassword', e.target.value)}
                data-cy="register-password-confirm"
                aria-invalid={Boolean(fe.password_confirm)}
                className={`${inputIconWrapPassword} ${fe.password_confirm ? inputErrorRing : ''}`}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {fe.password_confirm ? <p className="mt-1 text-xs text-red-600">{fe.password_confirm}</p> : null}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            data-cy="register-submit"
            className="btn btn-primary w-full flex justify-center items-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-[rgb(var(--color-on-accent))] mr-2" />
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-text-muted">
            Already have an account?{' '}
            {onSwitchToLogin ? (
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-primary hover:opacity-90 transition-opacity"
              >
                Sign in here
              </button>
            ) : (
              <Link href="/login" className="font-medium text-primary hover:opacity-90 transition-opacity">
                Sign in here
              </Link>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
