/**
 * Price history engine.
 *
 * A history point is only ever created from a recorded price event. There is no
 * generator and no synthetic data. If the store is empty, the graph stays empty.
 *
 * Record shape:
 * { product_id, offer_id, retailer_id, price, shipping, currency, total_price, timestamp }
 */

const HISTORY_KEY = 'dealpilot.history.v1'

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list))
}

/**
 * Record a price event. Call this only when a real offer row was observed.
 * Duplicate consecutive identical totals are collapsed to avoid noise.
 */
export function recordPriceEvent(offer, productId) {
  if (!offer || !productId) return { recorded: false, reason: 'missing data' }
  if (typeof offer.total !== 'number' || !Number.isFinite(offer.total)) {
    return { recorded: false, reason: 'invalid total price' }
  }
  const list = loadHistory()
  const last = [...list].reverse().find((r) => r.offer_id === offer.id)
  if (last && last.total_price === offer.total) {
    return { recorded: false, reason: 'unchanged total' }
  }
  const row = {
    product_id: productId,
    offer_id: offer.id,
    retailer_id: offer.retailer_id,
    price: offer.price,
    shipping: offer.shipping,
    currency: offer.currency,
    total_price: offer.total,
    timestamp: new Date().toISOString()
  }
  list.push(row)
  saveHistory(list)
  return { recorded: true, row }
}

export function historyFor(productId) {
  return loadHistory()
    .filter((r) => r.product_id === productId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

export function historyWithin(productId, days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return historyFor(productId).filter((r) => new Date(r.timestamp).getTime() >= cutoff)
}

export function historyStats(productId) {
  const rows = historyFor(productId)
  if (!rows.length) {
    return { count: 0, current: null, low: null, high: null, average: null, insufficient: true }
  }
  const totals = rows.map((r) => r.total_price)
  const current = totals[totals.length - 1]
  const low = Math.min(...totals)
  const high = Math.max(...totals)
  const average = totals.reduce((a, b) => a + b, 0) / totals.length
  return { count: rows.length, current, low, high, average, insufficient: rows.length < 3 }
}

export const HISTORY_EMPTY_MESSAGE = 'Price history will appear as we collect more verified price data.'

export function exportHistory() {
  return { exportedAt: new Date().toISOString(), records: loadHistory() }
}
