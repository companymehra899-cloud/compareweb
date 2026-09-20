/**
 * AI service boundary.
 *
 * Hard rules:
 * - The AI API key is NEVER in frontend code. Requests go to our own backend,
 *   which holds the key server-side.
 * - Input is validated and length-capped. There is a timeout and a fallback.
 * - The model never invents products, prices or specs: it only explains rows we
 *   retrieved from the product database.
 *
 * When no backend is configured the deterministic catalogue matcher is used and
 * the response is labelled `source: "local"`. It is never presented as an LLM.
 */

const API = (import.meta && import.meta.env && import.meta.env.VITE_PROJECT_API_BASE_URL) || null
const MAX_INPUT = 500
const TIMEOUT_MS = 12000
const RATE_LIMIT = { max: 20, windowMs: 60 * 1000 }
const RATE_KEY = 'dealpilot.ai.rate.v1'

export function aiStatus() {
  return {
    backendConfigured: !!API,
    mode: API ? 'server' : 'local-fallback',
    maxInput: MAX_INPUT,
    rateLimit: RATE_LIMIT
  }
}

export function validateInput(text) {
  const raw = String(text || '')
  if (!raw.trim()) return { ok: false, error: 'Enter a question.' }
  if (raw.length > MAX_INPUT) return { ok: false, error: `Please keep your question under ${MAX_INPUT} characters.` }
  const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, ' ').trim()
  return { ok: true, value: cleaned }
}

function rateCheck() {
  const now = Date.now()
  let hits = []
  try { hits = JSON.parse(localStorage.getItem(RATE_KEY) || '[]') } catch { hits = [] }
  hits = hits.filter((t) => now - t < RATE_LIMIT.windowMs)
  if (hits.length >= RATE_LIMIT.max) {
    return { ok: false, retryInMs: RATE_LIMIT.windowMs - (now - hits[0]) }
  }
  hits.push(now)
  localStorage.setItem(RATE_KEY, JSON.stringify(hits))
  return { ok: true }
}

/**
 * Ask the assistant.
 * `retrieve(query, country)` must return { products, parsed } from OUR database.
 * Returns { source, text, products, parsed, unavailable? }.
 */
export async function ask(query, country, retrieve) {
  const v = validateInput(query)
  if (!v.ok) return { source: 'validation', error: v.error, products: [], unavailable: true }

  const rl = rateCheck()
  if (!rl.ok) {
    return {
      source: 'rate-limit',
      error: `Too many requests. Try again in ${Math.ceil(rl.retryInMs / 1000)}s.`,
      products: [],
      unavailable: true
    }
  }

  const hits = retrieve(v.value, country)
  if (!hits || !hits.products || !hits.products.length) {
    return {
      source: 'retrieval',
      text: "Currently, I couldn't find verified offers matching all of your requirements.",
      products: [],
      parsed: hits?.parsed || null,
      noMatch: true
    }
  }

  if (!API) {
    return {
      source: 'local',
      products: hits.products,
      parsed: hits.parsed,
      text: 'Here are products matching your requirements, based on the catalogue rows we hold.'
    }
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(`${API}/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        question: v.value,
        country,
        candidates: hits.products.map((p) => ({
          id: p.id, name: p.name, brand: p.brand, specs: p.specs,
          offers: (p.offers || []).map((o) => ({ retailer_id: o.retailer_id, total: o.total, currency: o.currency }))
        }))
      })
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return { source: 'server', text: data.text || '', products: hits.products, parsed: hits.parsed }
  } catch (err) {
    return {
      source: 'fallback',
      error: 'AI explanation unavailable. Showing catalogue matches only.',
      products: hits.products,
      parsed: hits.parsed,
      text: 'Here are products matching your requirements.'
    }
  }
}
