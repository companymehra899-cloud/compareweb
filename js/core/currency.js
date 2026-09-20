/**
 * Currency handling.
 *
 * Rules:
 * - Store the ORIGINAL retailer currency on every offer.
 * - Never swap a currency symbol without actually converting the amount.
 * - Conversion requires a configured ExchangeRateProvider. The static table below
 *   is a clearly-labelled offline fallback, not live market data.
 */

import { ExchangeRateProvider } from './providers.js'

export const CURRENCIES = {
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' }
}

/**
 * Offline fallback rates. Marked `fallback: true` so the UI can label output as
 * a "Converted estimate". Replace with a live provider before production.
 */
const FALLBACK_RATES = {
  'EUR->GBP': 0.85,
  'GBP->EUR': 1.18,
  'EUR->EUR': 1,
  'GBP->GBP': 1
}

class OfflineRateProvider extends ExchangeRateProvider {
  get id() { return 'offline-fallback' }
  get status() { return 'fallback' }
  async rate(from, to) {
    const key = `${from}->${to}`
    if (!(key in FALLBACK_RATES)) return null
    return { rate: FALLBACK_RATES[key], source: this.id, fallback: true, timestamp: null }
  }
}

let activeProvider = new OfflineRateProvider()

export function setExchangeRateProvider(provider) {
  activeProvider = provider
}

export function exchangeRateProviderStatus() {
  return { id: activeProvider.id, status: activeProvider.status }
}

export async function convert(amount, from, to) {
  if (from === to) return { amount, rate: 1, source: activeProvider.id, converted: false }
  const r = await activeProvider.rate(from, to)
  if (!r) return { amount: null, rate: null, source: activeProvider.id, converted: false, unavailable: true }
  return { amount: amount * r.rate, rate: r.rate, source: r.source, converted: true, fallback: !!r.fallback }
}

export function formatAmount(amount, currency, locale) {
  const c = CURRENCIES[currency]
  return new Intl.NumberFormat(locale || c?.locale || 'de-DE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Synchronous conversion using only the labelled offline fallback table.
 * Used by list rendering where an async round-trip is not practical.
 */
export function convertSync(amount, from, to) {
  if (!from || from === to) return { amount, rate: 1, converted: false }
  const key = `${from}->${to}`
  if (!(key in FALLBACK_RATES)) return { amount: null, rate: null, converted: false, unavailable: true }
  return { amount: amount * FALLBACK_RATES[key], rate: FALLBACK_RATES[key], converted: true, fallback: true }
}

export function displayPriceSync(amount, originalCurrency, visitorCurrency, locale) {
  const same = !originalCurrency || originalCurrency === visitorCurrency
  if (same) {
    return {
      text: formatAmount(amount, visitorCurrency || originalCurrency, locale),
      converted: false,
      originalText: formatAmount(amount, originalCurrency || visitorCurrency, locale)
    }
  }
  const c = convertSync(amount, originalCurrency, visitorCurrency)
  if (c.unavailable) {
    return {
      text: `${formatAmount(amount, originalCurrency, locale)} (no conversion available)`,
      converted: false,
      unavailable: true,
      originalText: formatAmount(amount, originalCurrency, locale)
    }
  }
  return {
    text: formatAmount(c.amount, visitorCurrency, locale),
    converted: true,
    label: 'Converted estimate',
    rateSource: 'offline-fallback',
    originalText: formatAmount(amount, originalCurrency, locale)
  }
}

/**
 * Produce a display string for an offer total in the visitor currency.
 * If currencies differ, the result is explicitly labelled "Converted estimate".
 */
export async function displayPrice(amount, originalCurrency, visitorCurrency, locale) {
  const same = !originalCurrency || originalCurrency === visitorCurrency
  if (same) {
    return {
      text: formatAmount(amount, visitorCurrency, locale),
      converted: false,
      originalText: formatAmount(amount, originalCurrency || visitorCurrency, locale)
    }
  }
  const c = await convert(amount, originalCurrency, visitorCurrency)
  if (c.unavailable) {
    return {
      text: `${formatAmount(amount, originalCurrency, locale)} (no conversion available)`,
      converted: false,
      unavailable: true,
      originalText: formatAmount(amount, originalCurrency, locale)
    }
  }
  return {
    text: formatAmount(c.amount, visitorCurrency, locale),
    converted: true,
    label: 'Converted estimate',
    rateSource: c.source,
    originalText: formatAmount(amount, originalCurrency, locale)
  }
}
