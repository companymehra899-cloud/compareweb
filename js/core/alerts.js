/**
 * Guest price alerts — no login, no signup.
 *
 * Real alert delivery requires a backend + email provider. This module defines
 * the complete contract and generates cryptographically random tokens so alert
 * URLs are never predictable. Until a backend is configured it runs in
 * "architecture" mode: the UI works, records are echoed back, and status stays
 * pending_verification. The local copy is only a UI mirror, never the source of
 * truth for sending mail.
 */

const MIRROR_KEY = 'dealpilot.alerts.v2'
const EMAIL_CONFIGURED = false   // set true only when a real provider is wired
const API = (import.meta && import.meta.env && import.meta.env.VITE_PROJECT_API_BASE_URL) || null

export const ALERT_STATUS = {
  PENDING: 'pending_verification',
  ACTIVE: 'active',
  TRIGGERED: 'triggered',
  PAUSED: 'paused',
  UNSUBSCRIBED: 'unsubscribed'
}

export function emailProviderStatus() {
  return { configured: EMAIL_CONFIGURED, provider: EMAIL_CONFIGURED ? 'configured' : null }
}

function randomToken(bytes = 24) {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return btoa(String.fromCharCode(...buf)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function loadMirror() {
  try {
    return JSON.parse(localStorage.getItem(MIRROR_KEY) || '[]')
  } catch {
    return []
  }
}

function saveMirror(list) {
  localStorage.setItem(MIRROR_KEY, JSON.stringify(list.slice(-500)))
}

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || '').trim())
}

/**
 * Create an alert. Returns the full record the backend would persist.
 * In architecture mode nothing is emailed; status remains pending_verification.
 */
export async function createAlert({ email, productId, country, target, currency }) {
  if (!validateEmail(email)) return { ok: false, error: 'Enter a valid email address.' }
  const t = Number(target)
  if (!Number.isFinite(t) || t <= 0) return { ok: false, error: 'Enter a valid target price.' }

  const record = {
    email: email.trim().toLowerCase(),
    product_id: productId,
    country,
    target_price: t,
    currency,
    status: ALERT_STATUS.PENDING,
    verification_token: randomToken(),
    unsubscribe_token: randomToken(),
    created_at: new Date().toISOString(),
    last_notification_at: null,
    verified_at: null,
    email_configured: EMAIL_CONFIGURED
  }

  if (API) {
    try {
      const res = await fetch(`${API}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: record.email, productId, country, target: t, currency })
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const server = await res.json()
      saveMirror([...loadMirror(), server])
      return { ok: true, record: server, source: 'server', emailSent: true }
    } catch {
      // fall through to architecture mode
    }
  }

  saveMirror([...loadMirror(), record])
  return {
    ok: true,
    record,
    source: 'architecture',
    emailSent: false,
    message: EMAIL_CONFIGURED
      ? 'Verification email queued.'
      : 'Alert created. Email verification is not configured yet, so no message was sent.'
  }
}

export function verifyToken(token) {
  const list = loadMirror()
  const idx = list.findIndex((a) => a.verification_token === token)
  if (idx < 0) return { ok: false, error: 'This verification link is invalid or has expired.' }
  if (list[idx].status !== ALERT_STATUS.PENDING) return { ok: true, record: list[idx], already: true }
  list[idx] = { ...list[idx], status: ALERT_STATUS.ACTIVE, verified_at: new Date().toISOString() }
  saveMirror(list)
  return { ok: true, record: list[idx] }
}

export function unsubscribeToken(token) {
  const list = loadMirror()
  const idx = list.findIndex((a) => a.unsubscribe_token === token)
  if (idx < 0) return { ok: false, error: 'This link is invalid or has expired.' }
  list[idx] = { ...list[idx], status: ALERT_STATUS.UNSUBSCRIBED }
  saveMirror(list)
  return { ok: true, record: list[idx] }
}

export function setStatus(token, status) {
  const list = loadMirror()
  const idx = list.findIndex((a) => a.unsubscribe_token === token || a.verification_token === token)
  if (idx < 0) return { ok: false, error: 'Alert not found.' }
  list[idx] = { ...list[idx], status }
  saveMirror(list)
  return { ok: true, record: list[idx] }
}

export function mirrorAlerts() {
  return loadMirror()
}

export function manageUrl(unsubscribe_token) {
  return `/manage-alert.html?token=${encodeURIComponent(unsubscribe_token)}`
}

export function verifyUrl(verification_token) {
  return `/verify-alert.html?token=${encodeURIComponent(verification_token)}`
}
