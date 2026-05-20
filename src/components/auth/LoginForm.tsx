'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { authApi } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'
import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react'

const loginInputClass =
  'block w-full pl-10 pr-3 py-3 border rounded-lg transition-colors bg-[rgb(var(--color-surface))] text-text border-border-default placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]'
const loginPasswordClass =
  'block w-full pl-10 pr-12 py-3 border rounded-lg transition-colors bg-[rgb(var(--color-surface))] text-text border-border-default placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-ring))]'

interface LoginFormProps {
  onSuccess?: () => void
  className?: string
}

export default function LoginForm({ onSuccess, className = '' }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [needsVerifyHint, setNeedsVerifyHint] = useState(false)
  const [needsPhoneVerifyHint, setNeedsPhoneVerifyHint] = useState(false)
  const [resendBusy, setResendBusy] = useState(false)

  const { signIn } = useAuth()
  const { showError, showSuccess } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    setNeedsVerifyHint(false)
    setNeedsPhoneVerifyHint(false)

    // Basic validation
    if (!username || !password) {
      const errorMsg = 'Please fill in all fields'
      setError(errorMsg)
      showError(errorMsg)
      setIsLoading(false)
      return
    }

    if (username.trim().length < 3) {
      const errorMsg = 'Username must be at least 3 characters'
      setError(errorMsg)
      showError(errorMsg)
      setIsLoading(false)
      return
    }

    try {
      const {
        error: signInError,
        code,
        verificationEmailSent,
        verificationEmailCooldown,
      } = await signIn(username, password)

      if (signInError) {
        if (code === 'email_not_verified') {
          let detail =
            'Your account is not verified yet. Check your email (including spam) for a verification link, then sign in here.'
          if (verificationEmailSent) {
            detail += ' We sent another verification email—inbox and spam.'
          } else if (verificationEmailCooldown) {
            detail +=
              ' A verification email was sent recently. Check existing messages or try “Resend email” when eligible.'
          }
          setError(detail)
          showError(detail)
          setNeedsVerifyHint(true)
        } else if (code === 'phone_not_verified') {
          const detail =
            typeof signInError === 'string' && signInError.trim()
              ? signInError
              : 'Your cellphone number must be verified before you can sign in. Open your profile to complete verification.'
          setError(detail)
          showError(detail)
          setNeedsPhoneVerifyHint(true)
        } else {
          setError(signInError)
          showError(signInError)
        }
      } else {
        showSuccess('Login successful!')
        onSuccess?.()
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred'
      setError(errorMsg)
      showError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-surface rounded-2xl shadow-card border border-border-default p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-[rgb(var(--color-on-accent))]" />
          </div>
          <h2 className="text-2xl font-playfair font-semibold text-text mb-2">Welcome Back</h2>
          <p className="text-text-muted">Sign in to your account to continue</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-text-muted" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-cy="login-username"
                className={loginInputClass}
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>
            <p className="mt-1 text-xs text-text-muted">Use your username to sign in</p>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-text-muted" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-cy="login-password"
                className={loginPasswordClass}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-text"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            data-cy="login-submit"
            className="btn btn-primary w-full flex justify-center py-3 items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[rgb(var(--color-on-accent))] mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {needsVerifyHint ? (
          <div className="mt-6 p-4 bg-[rgb(var(--color-surface-raised))] border border-border-default rounded-lg text-sm space-y-3">
            <p className="text-text font-medium">Email verification is required before sign-in.</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/auth/verify-email?email=${encodeURIComponent(username.trim())}`}
                className="inline-flex justify-center py-2 px-3 rounded-lg border border-border-default text-text text-sm font-medium hover:bg-[rgb(var(--color-surface-raised)/0.65)]"
              >
                Verification help
              </Link>
              <button
                type="button"
                disabled={resendBusy}
                onClick={async () => {
                  try {
                    setResendBusy(true)
                    await authApi.resendVerificationEmail(username.trim())
                    showSuccess(
                      'If your account exists and still needs verification, we sent another email.',
                    )
                  } catch {
                    showError('Could not resend. Try again shortly.')
                  } finally {
                    setResendBusy(false)
                  }
                }}
                className="py-2 px-3 rounded-lg btn btn-primary text-sm font-medium disabled:opacity-50"
              >
                {resendBusy ? 'Sending…' : 'Resend email'}
              </button>
            </div>
          </div>
        ) : null}

        {needsPhoneVerifyHint ? (
          <div className="mt-6 p-4 bg-[rgb(var(--color-surface-raised))] border border-border-default rounded-lg text-sm space-y-3">
            <p className="text-text font-medium">
              Phone verification is required. Complete verification from your profile, then sign in again.
            </p>
            <Link
              href="/profile"
              className="inline-flex justify-center py-2 px-3 rounded-lg border border-border-default text-text text-sm font-medium hover:bg-[rgb(var(--color-surface-raised)/0.65)]"
            >
              Go to profile
            </Link>
          </div>
        ) : null}

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:opacity-90 transition-opacity">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}