'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import LoginForm from './LoginForm'
import SignUpForm from './SignUpForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: 'login' | 'signup'
  defaultUserType?: 'author' | 'business_owner' | 'user'
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'login', defaultUserType }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode)

  // Reset mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode)
    }
  }, [isOpen, defaultMode])

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-md transform transition-all">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 sm:-top-2 sm:-right-2 z-10 bg-white rounded-full p-3 sm:p-2 shadow-lg hover:bg-gray-50 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-6 h-6 sm:w-5 sm:h-5 text-gray-500" />
          </button>

          {/* Form */}
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            {mode === 'login' ? (
              <LoginForm
                onSuccess={handleSuccess}
                onSwitchToSignup={() => setMode('signup')}
              />
            ) : (
              <SignUpForm
                onSuccess={handleSuccess}
                onSwitchToLogin={() => setMode('login')}
                defaultUserType={defaultUserType}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}