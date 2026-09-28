/** Convert provider payloads into the exact shapes the frontend catalogue uses. */

import { ebayAffiliateUrl } from './affiliate.js'

export const EBAY_RETAILER = {
  id: 'ebay-de',
  name: 'eBay.de',
  logo: 'eB',
  country: 'DE',
  website: 'https://www.ebay.de',
  domain: 'ebay.de',
  affiliate_url: null,
  affiliate_network: 'eBay Partner Network',
  rating: null,
  shipping_policy: 'Varies by seller',
  active: true,
  status: 'live',
  data_source: 'ebay_browse',
  last_updated: null
}

export function ebayRetailer(nowIso) {
  return { ...EBAY_RETAILER, last_updated: nowIso }
}

function deliveryWindow(shippingOptions) {
  const opt = shippingOptions?.[0]
  if (!opt) return 'See listing'
  const min = (opt.minEstimatedDeliveryDate || '').slice(0, 10)
  const max = (opt.maxEstimatedDeliveryDate || '').slice(0, 10)
  if (min && max) return `${min} – ${max}`
  if (max) return max
  return 'See listing'
}

export function offerFromEbayItem(item, productId, env, nowIso) {
  const price = Number(item?.price?.value)
  if (!Number.isFinite(price)) return null
  const rawShipping = Number(item?.shippingOptions?.[0]?.shippingCost?.value ?? 0)
  const shipping = Number.isFinite(rawShipping) ? rawShipping : 0
  const currency = item?.price?.currency || 'EUR'
  const url = item?.itemWebUrl || null
  const affiliate = ebayAffiliateUrl(env, url, item?.itemId)

  return {
    id: `${productId}-${item.itemId}`,
    retailer_id: EBAY_RETAILER.id,
    product_id: productId,
    price,
    shipping,
    total: price + shipping,
    currency,
    original_currency: currency,
    delivery: deliveryWindow(item.shippingOptions),
    stock: 'in_stock',
    availability: 'in_stock',
    shipping_conditions: item?.shippingOptions?.[0]?.shippingCostType || null,
    source: 'ebay_browse',
    url,
    affiliate_url: affiliate,
    tracking_parameters: affiliate ? { campid: env.EBAY_AFFILIATE_CAMPAIGN_ID, customid: item.itemId } : null,
    commission_status: affiliate ? 'configured' : 'not_configured',
    condition: item?.condition || null,
    seller: item?.seller?.username || null,
    timestamp: nowIso,
    last_verified: nowIso,
    demo: false
  }
}

/**
 * Merge live offers onto the editorial seed product. Specs stay curated; only
 * prices/offers come from providers.
 */
export function productWithOffers(seed, offers, nowIso, source = 'ebay_browse') {
  if (!offers.length) return null
  const prices = offers.map((o) => o.total ?? o.price).filter((n) => Number.isFinite(n))
  const cheapest = prices.length ? Math.min(...prices) : null
  const list = seed.list || cheapest
  return {
    ...seed,
    offers,
    list,
    source,
    demo: false,
    last_updated: nowIso,
    history: []
  }
}
