import { describe, expect, it } from 'vitest'
import { DEFAULT_CURRENCY, formatPrice, resolveCurrency } from './format-price'

describe('formatPrice', () => {
  it('defaults to ZAR when currency is missing', () => {
    expect(resolveCurrency(undefined)).toBe('ZAR')
    const out = formatPrice(99.5)
    expect(out).toMatch(/99[.,]50/)
    expect(out.startsWith('R')).toBe(true)
  })

  it('formats ZAR with rand symbol', () => {
    const out = formatPrice(1234.5, 'ZAR')
    expect(out).toMatch(/234[.,]50/)
    expect(out.startsWith('R')).toBe(true)
  })

  it('respects explicit currency codes', () => {
    const out = formatPrice(10, 'USD', DEFAULT_CURRENCY, 'en-US')
    expect(out).toContain('10')
    expect(out).toContain('$')
  })
})
