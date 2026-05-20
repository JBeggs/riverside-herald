'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { FALLBACK_COMPANY, type Company } from '@/lib/company-shared'

const CompanyContext = createContext<Company | null>(null)

interface CompanyProviderProps {
  children: ReactNode
  company: Company
}

export function CompanyProvider({ children, company }: CompanyProviderProps) {
  return <CompanyContext.Provider value={company}>{children}</CompanyContext.Provider>
}

export function useCompany(): Company {
  return useContext(CompanyContext) ?? FALLBACK_COMPANY
}
