/**
 * Backend API client.
 *
 * The browser never holds a provider key. It only talks to our own backend at
 * VITE_PROJECT_API_BASE_URL; the backend holds the eBay/Awin credentials and
 * calls the providers. When that variable is empty the app runs fully on the
 * local demo seed and makes no network calls at all.
 */
const RAW_BASE = (import.meta && import.meta.env && import.meta.env.VITE_PROJECT_API_BASE_URL) || ''
export const API_BASE = RAW_BASE.replace(/\/+$/, '')

export function apiEnabled() {
  return API_BASE.length > 0
}

async function request(path, { timeout = 2500, method = 'GET', body } = {}) {
  if (!apiEnabled()) return null
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      signal: ctrl.signal,
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

/** Full catalogue in the same shape js/db.js already uses. */
export async function fetchCatalogue(timeout = 2500) {
  const data = await request('/api/catalogue', { timeout })
  if (!data || !Array.isArray(data.products) || !data.products.length) return null
  return data
}

export async function fetchProduct(id) {
  return request(`/api/products/${encodeURIComponent(id)}`)
}

export async function fetchHistory(id) {
  const data = await request(`/api/history/${encodeURIComponent(id)}`)
  return Array.isArray(data?.history) ? data.history : null
}

/** Fire-and-forget click beacon; ignored when no backend is configured. */
export function reportClick(row) {
  if (!apiEnabled()) return
  const payload = JSON.stringify(row)
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${API_BASE}/api/clicks`, new Blob([payload], { type: 'application/json' }))
      return
    }
  } catch {}
  fetch(`${API_BASE}/api/clicks`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: payload,
    keepalive: true
  }).catch(() => {})
}
