'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Mail, XCircle } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

function VerifyEmailInner() {
  const sp = useSearchParams()
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const token = sp.get('token')
  const emailHint = sp.get('email')
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>(
    token ? 'working' : 'idle',
  )
  const [resendBusy, setResendBusy] = useState(false)

  useEffect(() => {
    if (!token) return undefined
    let cancelled = false
    ;(async () => {
      try {
        await authApi.verifyEmail(token)
        if (!cancelled) {
          setStatus('done')
          showSuccess('Email verified!')
          router.push('/')
          router.refresh()
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setStatus('error')
          showError(err instanceof Error ? err.message : 'Invalid or expired link.')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, router, showError, showSuccess])

  const resend = async () => {
    if (!emailHint) {
      showError('Enter your email on the login page and use Resend verification.')
      return
    }
    setResendBusy(true)
    try {
      await authApi.resendVerificationEmail(emailHint)
      showSuccess('If the account exists and needs verification, a new email was sent.')
    } catch (err: unknown) {
      showError(err instanceof Error ? err.message : 'Could not send email.')
    } finally {
      setResendBusy(false)
    }
  }

  const cardClass =
    'bg-surface rounded-2xl shadow-card border border-border-default p-8 text-center space-y-4'

  if (!token) {
    return (
      <>
        <div className="text-center mb-6">
          <h1 className="text-3xl font-playfair font-semibold text-text mb-2">Check your email</h1>
          <p className="text-text-muted text-sm">
            We sent you a verification link. Open it to activate your account, then sign in.
          </p>
        </div>
        <div className={cardClass}>
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-[rgb(var(--color-on-accent))]" />
          </div>
          {emailHint ? (
            <p className="text-sm text-text-muted">
              Sent to <span className="font-medium text-text">{emailHint}</span>
            </p>
          ) : null}
          {emailHint ? (
            <button
              type="button"
              onClick={() => void resend()}
              disabled={resendBusy}
              className="btn btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendBusy ? 'Sending…' : 'Resend verification email'}
            </button>
          ) : null}
          <Link href="/login" className="btn btn-primary block w-full py-3">
            Back to sign in
          </Link>
        </div>
      </>
    )
  }

  return (
    <div className={cardClass}>
      {status === 'working' ? (
        <>
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-[rgb(var(--color-on-accent))]" />
          </div>
          <h2 className="text-2xl font-playfair font-semibold text-text">Verifying your email</h2>
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-text-muted text-sm">This only takes a moment…</p>
          </div>
        </>
      ) : null}

      {status === 'done' ? (
        <>
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-[rgb(var(--color-on-accent))]" />
          </div>
          <h2 className="text-2xl font-playfair font-semibold text-text">Email verified</h2>
          <p className="text-text-muted text-sm">Redirecting…</p>
        </>
      ) : null}

      {status === 'error' ? (
        <>
          <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto border border-red-200 dark:border-red-900">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-300" />
          </div>
          <h2 className="text-2xl font-playfair font-semibold text-text">Verification failed</h2>
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg text-left">
            <p className="text-red-800 dark:text-red-200 text-sm">
              This link is invalid or has expired. Request a fresh link below or contact support if
              this keeps failing.
            </p>
          </div>
          {emailHint ? (
            <button
              type="button"
              disabled={resendBusy}
              onClick={() => void resend()}
              className="btn btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendBusy ? 'Sending…' : 'Resend verification'}
            </button>
          ) : null}
          <Link href="/login" className="btn btn-primary block w-full py-3">
            Back to sign in
          </Link>
        </>
      ) : null}
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4 font-body">
      <div className="max-w-md w-full">
        <Suspense
          fallback={
            <div className="bg-surface p-8 rounded-2xl text-text-muted shadow-card border border-border-default text-center">
              Loading…
            </div>
          }
        >
          <VerifyEmailInner />
        </Suspense>
      </div>
    </div>
  )
}
