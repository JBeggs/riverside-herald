'use client'

import AuthButton from '@/components/auth/AuthButton'

export default function ClientHeader({ onAction }: { onAction?: () => void }) {
  return (
    <div className="flex items-center space-x-4">
      <AuthButton onAction={onAction} />
    </div>
  )
}