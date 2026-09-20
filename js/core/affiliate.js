/**
 * Affiliate link safety + click tracking.
 *
 * Admin-entered URLs must never become an open redirect. A link is only usable
 * when its host is an approved retailer domain. Otherwise the UI shows
 * "Retailer link unavailable" and does not redirect anywhere.
 */

const CLICKS_KEY = 'dealpilot.clicks.v2'

export function approvedDomains(retailers) {
  return retailers
    .filter((r) => r.active && r.domain)
    .map((r) => ({ id: r.id, name: r.name, domain: r.domain.toLowerCase() }))
}

export function hostOf(url) {
  try {
    return new URL(url).host.replace(/^www\./, '').toLowerCase()
  } catch {
    return null
  }
}

function hostMatches(host, domain) {
  const d = domain.toLowerCase()
  return host === d || host.endsWith('.' + d)
}

/**
 * Resolve a safe affiliate link for an offer.
 * Returns { ok, url, reason } and never a redirect unless host is approved.
 */
export function resolveAffiliateLink(offer, retailer, retailers) {
  if (!offer || !retailer) return { ok: false, url: null, reason: 'Retailer link unavailable' }
  if (!offer.affiliate_url) return { ok: false, url: null, reason: 'Retailer link unavailable' }
  if (retailer.status === 'pending' || !retailer.active) {
    return { ok: false, url: null, reason: 'Partnership pending — link unavailable' }
  }
  const host = hostOf(offer.affiliate_url)
  if (!host) return { ok: false, url: null, reason: 'Retailer link unavailable' }
  const allowed = approvedDomains(retailers).some((d) => hostMatches(host, d.domain))
  if (!allowed) return { ok: false, url: null, reason: 'Domain not approved' }
  return { ok: true, url: offer.affiliate_url, reason: 'ok' }
}

export function loadClicks() {
  try {
    return JSON.parse(localStorage.getItem(CLICKS_KEY) || '[]')
  } catch {
    return []
  }
}

export function trackClick({ productId, offerId, retailerId, country, source }) {
  const list = loadClicks()
  const click_id = 'clk-' + crypto.randomUUID()
  const row = {
    click_id,
    product_id: productId,
    offer_id: offerId,
    retailer_id: retailerId,
    country,
    timestamp: new Date().toISOString(),
    referrer: source || (typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct'),
    conversion: null,
    commission: null,
    revenue: null
  }
  list.push(row)
  localStorage.setItem(CLICKS_KEY, JSON.stringify(list.slice(-5000)))
  return row
}

/**
 * Conversion data only exists when the affiliate network reports it. Until then
 * these totals stay zero and are labelled as such in admin.
 */
export function clickStats() {
  const list = loadClicks()
  return {
    clicks: list.length,
    conversions: null,
    commission: null,
    revenue: null,
    hasConversionData: false
  }
}
