/**
 * Data freshness.
 *
 * Every offer carries a timestamp. The UI must never present stale data as live.
 * Thresholds are configurable so they can be tuned per feed later.
 */

export const FRESHNESS = {
  FRESH: 'fresh',
  RECENT: 'recently_updated',
  STALE: 'stale',
  UNAVAILABLE: 'unavailable',
  UNKNOWN: 'unknown'
}

export const THRESHOLDS = {
  freshMs: 6 * 60 * 60 * 1000,        // < 6 hours
  recentMs: 48 * 60 * 60 * 1000,       // < 48 hours
  staleMs: 14 * 24 * 60 * 60 * 1000    // < 14 days, else stale
}

export function freshnessState(timestamp, availability, now = Date.now()) {
  if (availability === 'out_of_stock') return FRESHNESS.UNAVAILABLE
  if (!timestamp) return FRESHNESS.UNKNOWN
  const t = new Date(timestamp).getTime()
  if (Number.isNaN(t)) return FRESHNESS.UNKNOWN
  const age = now - t
  if (age < 0) return FRESHNESS.FRESH
  if (age < THRESHOLDS.freshMs) return FRESHNESS.FRESH
  if (age < THRESHOLDS.recentMs) return FRESHNESS.RECENT
  if (age < THRESHOLDS.staleMs) return FRESHNESS.RECENT
  return FRESHNESS.STALE
}

export function relativeTime(timestamp, now = Date.now()) {
  if (!timestamp) return 'never'
  const t = new Date(timestamp).getTime()
  if (Number.isNaN(t)) return 'unknown'
  const diff = Math.max(0, now - t)
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`
  const months = Math.round(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}

const LABELS = {
  [FRESHNESS.FRESH]: 'Fresh',
  [FRESHNESS.RECENT]: 'Recently updated',
  [FRESHNESS.STALE]: 'Stale',
  [FRESHNESS.UNAVAILABLE]: 'Unavailable',
  [FRESHNESS.UNKNOWN]: 'Timestamp missing'
}

export function freshnessLabel(state, timestamp) {
  if (state === FRESHNESS.FRESH) return `Updated ${relativeTime(timestamp)}`
  if (state === FRESHNESS.RECENT) return `Recently updated · ${relativeTime(timestamp)}`
  if (state === FRESHNESS.STALE) return `Stale · last updated ${relativeTime(timestamp)}`
  if (state === FRESHNESS.UNAVAILABLE) return 'Currently unavailable'
  return 'Update time unknown'
}

export function freshnessClass(state) {
  if (state === FRESHNESS.FRESH) return 'fresh-fresh'
  if (state === FRESHNESS.RECENT) return 'fresh-recent'
  if (state === FRESHNESS.STALE) return 'fresh-stale'
  if (state === FRESHNESS.UNAVAILABLE) return 'fresh-unavailable'
  return 'fresh-unknown'
}

/**
 * Demo seed timestamps are fixed and therefore "stale" by definition. That is
 * intentional: the UI shows it instead of pretending the row is live.
 */
export function seedFreshness(timestamp, availability) {
  return freshnessState(timestamp, availability)
}
