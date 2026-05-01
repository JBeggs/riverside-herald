'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import ConfirmDialog, { ConfirmOptions } from '@/components/ui/ConfirmDialog'

type Resolver = (value: boolean) => void

interface ConfirmDialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolver, setResolver] = useState<Resolver | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setOptions(opts)
      setResolver(() => resolve)
      setOpen(true)
    })
  }, [])

  const handleConfirm = useCallback(() => {
    resolver?.(true)
    setResolver(null)
    setOptions(null)
    setOpen(false)
  }, [resolver])

  const handleCancel = useCallback(() => {
    resolver?.(false)
    setResolver(null)
    setOptions(null)
    setOpen(false)
  }, [resolver])

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        open={open}
        options={options}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmDialogContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(ConfirmDialogContext)
  if (context === undefined) {
    throw new Error('useConfirm must be used within a ConfirmDialogProvider')
  }
  return context
}
