/**
 * Privacy-conscious analytics.
 *
 * Only the events below are recorded, with no personal data, no IP, no user id.
 * A consent flag gates collection. Numbers shown in admin are actual collected
 * events only — never fabricated traffic or revenue.
 */

const EVENTS_KEY = 'dealpilot.events.v1'
const CONSENT_KEY = 'dealpilot.analytics.consent.v1'

export const EVENTS = ['search', 'product_view', 'compare', 'ai_query', 'price_alert_created', 'deal_click', 'guide_view']

export function hasConsent() {
  return localStorage.getItem(CONSENT_KEY) === 'granted'
}

export function setConsent(granted) {
  localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied')
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(EVENTS_KEY) || '[]')
  } catch {
    return []
  }
}

function save(list) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(list.slice(-2000)))
}

/**
 * Track an event. `props` must not contain email addresses, names, tokens or
 * free-text user input verbatim.
 */
export function track(event, props = {}) {
  if (!EVENTS.includes(event)) return { tracked: false, reason: 'unknown event' }
  if (!hasConsent()) return { tracked: false, reason: 'no consent' }
  const safe = {}
  for (const [k, v] of Object.entries(props)) {
    if (/email|name|token|query|text|password/i.test(k)) continue
    if (typeof v === 'string' && v.length > 64) continue
    safe[k] = v
  }
  const list = load()
  list.push({ event, props: safe, at: new Date().toISOString() })
  save(list)
  return { tracked: true }
}

export function summary() {
  const list = load()
  const byEvent = {}
  for (const e of EVENTS) byEvent[e] = 0
  for (const row of list) byEvent[row.event] = (byEvent[row.event] || 0) + 1
  return { total: list.length, byEvent, events: list }
}

export function clearAnalytics() {
  save([])
}
