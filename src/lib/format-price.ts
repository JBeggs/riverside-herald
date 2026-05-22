/** South African storefront defaults — products inherit company currency (ZAR). */
export const DEFAULT_CURRENCY = 'ZAR'
export const DEFAULT_LOCALE = 'en-ZA'

export function resolveCurrency(
  currency?: string | null,
  fallback: string = DEFAULT_CURRENCY,
): string {
  const cur = (currency || fallback || DEFAULT_CURRENCY).trim().toUpperCase()
  return cur || DEFAULT_CURRENCY
}

export function formatPrice(
  amount: number,
  currency?: string | null,
  fallback: string = DEFAULT_CURRENCY,
  locale: string = DEFAULT_LOCALE,
): string {
  const cur = resolveCurrency(currency, fallback)
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    if (cur === 'ZAR') return `R${amount.toFixed(2)}`
    return `${cur} ${amount.toFixed(2)}`
  }
}
