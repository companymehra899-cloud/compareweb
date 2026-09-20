import { PRODUCTS, RETAILERS, GUIDES, COUNTRIES, CATEGORIES, LANGUAGES, SEED_AT } from './data.js'

const DB_KEY = 'dealpilot.db.v2'
const ALERT_KEY = 'dealpilot.alerts.v1'
const CLICK_KEY = 'dealpilot.clicks.v1'
const USER_KEY = 'dealpilot.users.v1'

function clone(x) {
  return JSON.parse(JSON.stringify(x))
}

function domainFrom(website) {
  try {
    return new URL(website).host.replace(/^www\./, '')
  } catch {
    return null
  }
}

/** Country activation is independent of UI translation. */
function countryStatus(code) {
  if (code === 'DE') return 'beta'
  if (code === 'FR' || code === 'NL') return 'partnership_pending'
  return 'coming_soon'
}

/** Enrich seed rows with the phase-2 fields without touching the seed file shape. */
function enrich(db) {
  db.countries = db.countries.map((c) => ({
    ...c,
    country_status: c.country_status || countryStatus(c.code),
    data_status: c.code === 'DE' ? 'demo' : 'none'
  }))
  db.retailers = db.retailers.map((r) => ({
    ...r,
    domain: r.domain || domainFrom(r.website),
    affiliate_network: r.affiliate_network || null,
    data_source: r.data_source || 'demo_seed',
    active_offers: null,
    stale_offers: null
  }))
  db.products = db.products.map((p) => ({
    ...p,
    mpn: p.mpn || p.sku || null,
    country_status: p.country_status || 'beta',
    offers: (p.offers || []).map((o) => ({
      ...o,
      product_id: o.product_id || p.id,
      original_currency: o.original_currency || o.currency || 'EUR',
      shipping_conditions: o.shipping_conditions || null,
      availability: o.availability || o.stock || null
    }))
  }))
  return db
}

function emptyDb() {
  return enrich({
    products: clone(PRODUCTS),
    retailers: clone(RETAILERS),
    guides: clone(GUIDES),
    countries: clone(COUNTRIES),
    categories: clone(CATEGORIES),
    languages: clone(LANGUAGES),
    users: [{ id: 'local', email: '', created: SEED_AT, demo: true }],
    seedAt: SEED_AT
  })
}

export function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (!raw) {
      const db = emptyDb()
      localStorage.setItem(DB_KEY, JSON.stringify(db))
      return db
    }
    const db = JSON.parse(raw)
    if (!db.products?.length) return emptyDb()
    return enrich(db)
  } catch {
    return emptyDb()
  }
}

export function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
  window.dispatchEvent(new Event('dealpilot-db'))
}

export function resetDb() {
  const db = emptyDb()
  saveDb(db)
  return db
}

export function getProducts() {
  return loadDb().products
}

export function getProductById(id) {
  return getProducts().find((p) => p.id === id)
}

export function getCountries() {
  return loadDb().countries
}

export function getRetailers() {
  return loadDb().retailers
}

export function upsertProduct(p) {
  const db = loadDb()
  const i = db.products.findIndex((x) => x.id === p.id)
  if (i >= 0) db.products[i] = p
  else db.products.push(p)
  saveDb(db)
}

export function upsertRetailer(r) {
  const db = loadDb()
  const i = db.retailers.findIndex((x) => x.id === r.id)
  if (i >= 0) db.retailers[i] = r
  else db.retailers.push(r)
  saveDb(db)
}

export function upsertOffer(productId, offer) {
  const db = loadDb()
  const p = db.products.find((x) => x.id === productId)
  if (!p) return
  const i = p.offers.findIndex((o) => o.id === offer.id)
  if (i >= 0) p.offers[i] = offer
  else p.offers.push(offer)
  saveDb(db)
}

export function getGuides() {
  return loadDb().guides
}

/* ---- legacy local alert helpers (kept for the alerts page mirror) ---- */

export function loadAlerts() {
  try {
    return JSON.parse(localStorage.getItem(ALERT_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveAlerts(list) {
  localStorage.setItem(ALERT_KEY, JSON.stringify(list))
}

export function addAlert({ productId, target, email, country }) {
  const list = loadAlerts()
  const row = {
    id: 'al-' + Date.now(),
    productId,
    target: Number(target),
    email: email || '',
    country: country || 'DE',
    status: 'active',
    created: new Date().toISOString(),
    emailConfigured: false
  }
  list.push(row)
  saveAlerts(list)
  return row
}

export function setAlertStatus(id, status) {
  const list = loadAlerts().map((a) => (a.id === id ? { ...a, status } : a))
  saveAlerts(list)
  return list
}

export function loadClicks() {
  try {
    return JSON.parse(localStorage.getItem(CLICK_KEY) || '[]')
  } catch {
    return []
  }
}

export function trackClick({ productId, retailerId, total }) {
  const list = loadClicks()
  list.push({
    id: 'clk-' + Date.now(),
    productId,
    retailerId,
    total,
    at: new Date().toISOString(),
    affiliateConfigured: false
  })
  localStorage.setItem(CLICK_KEY, JSON.stringify(list))
  return list
}

export function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || '[]')
  } catch {
    return []
  }
}

export function upsertUser(email) {
  const list = loadUsers()
  if (email && !list.find((u) => u.email === email)) {
    list.push({ id: 'u-' + Date.now(), email, created: new Date().toISOString() })
    localStorage.setItem(USER_KEY, JSON.stringify(list))
  }
  return list
}

export function evaluateAlerts() {
  const products = getProducts()
  const list = loadAlerts().map((a) => {
    const p = products.find((x) => x.id === a.productId)
    const lo = p?.offers?.length ? [...p.offers].sort((x, y) => x.total - y.total)[0] : null
    if (a.status === 'active' && lo && lo.total <= a.target) return { ...a, status: 'triggered' }
    return a
  })
  saveAlerts(list)
  return list
}
