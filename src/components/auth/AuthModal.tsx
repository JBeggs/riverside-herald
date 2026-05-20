'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import LoginForm from './LoginForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  /** Kept for compatibility: when `signup`, the modal redirects to `/register`. */
  defaultMode?: 'login' | 'signup'
  defaultUserType?: 'author' | 'business_owner' | 'user'
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login', defaultUserType }: AuthModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (!isOpen || defaultMode !== 'signup') return
    const params = new URLSearchParams()
    if (defaultUserType === 'business_owner') params.set('type', 'business_owner')
    else if (defaultUserType === 'author') params.set('type', 'author')
    else if (defaultUserType === 'user') params.set('type', 'user')
    const q = params.toString()
    router.push(q ? `/register?${q}` : '/register')
    onClose()
  }, [isOpen, defaultMode, defaultUserType, router, onClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null
  if (defaultMode === 'signup') return null

  const handleSuccess = () => {
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-md transform transition-all">
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-3 -right-3 sm:-top-2 sm:-right-2 z-10 bg-surface rounded-full p-3 sm:p-2 shadow-card border border-border-default hover:bg-[rgb(var(--color-surface-raised))] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-6 h-6 sm:w-5 sm:h-5 text-text-muted" />
          </button>

          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <LoginForm onSuccess={handleSuccess} />
          </div>
        </div>
      </div>
    </div>
  )
}
