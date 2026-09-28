/**
 * Awin product feed adapter.
 *
 * Awin has no single universal product API: each advertiser publishes a feed in
 * its own column layout. Configure one or more feeds as JSON in AWIN_FEED_URLS:
 *
 *   AWIN_FEED_URLS='[{"retailerId":"mediamarkt","name":"MediaMarkt","domain":"mediamarkt.de","advertiserId":1234,"url":"https://productdata.awin.com/.../format/csv/"}]'
 *
 * The parser understands the standard Awin CSV columns and falls back to common
 * aliases. Feeds are only fetched when AWIN_FEED_URLS is set, so the adapter is
 * inert until you join Awin and paste real feed URLs.
 */

import { PRODUCTS } from '../../../js/data.js'
import { awinAffiliateUrl } from '../lib/affiliate.js'

const COLUMN_ALIASES = {
  id: ['aw_product_id', 'product_id', 'id'],
  name: ['product_name', 'name', 'title'],
  brand: ['brand_name', 'brand'],
  price: ['search_price', 'price', 'store_price'],
  rrp: ['rrp_price', 'was_price'],
  link: ['merchant_deep_link', 'aw_deep_link', 'link'],
  image: ['merchant_image_url', 'aw_image_url', 'image_url'],
  stock: ['in_stock', 'stock_status', 'availability'],
  delivery: ['delivery_time', 'delivery_ts', 'shipping_time'],
  ean: ['ean', 'product_gtin'],
  mpn: ['mpn', 'product_mpn']
}

export function isConfigured(env) {
  return Boolean(env.AWIN_FEED_URLS)
}

export function parseFeeds(env) {
  if (!env.AWIN_FEED_URLS) return []
  try {
    const feeds = JSON.parse(env.AWIN_FEED_URLS)
    return Array.isArray(feeds) ? feeds.filter((f) => f && f.url) : []
  } catch {
    return []
  }
}

/** Minimal CSV parser that respects quoted fields and escaped quotes. */
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          quoted = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      quoted = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (ch !== '\r') {
      field += ch
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c !== ''))
}

function headerIndex(header, key) {
  const aliases = COLUMN_ALIASES[key] || []
  for (const alias of aliases) {
    const i = header.indexOf(alias)
    if (i >= 0) return i
  }
  return -1
}

const NOISE = new Set(['the', 'with', 'and', 'gen', 'inch', 'new', 'uk', 'de', 'eu'])

function tokens(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !NOISE.has(t))
}

/** Attach a feed row to a known catalogue entry only when the model matches. */
export function matchProduct(feedName) {
  const hay = tokens(feedName)
  if (!hay.length) return null
  let best = null
  for (const p of PRODUCTS) {
    const needle = tokens(`${p.brand} ${p.model || p.name}`)
    if (!needle.length) continue
    const hits = needle.filter((t) => hay.includes(t)).length
    const score = hits / needle.length
    if (score >= 0.6 && (!best || score > best.score)) best = { id: p.id, score }
  }
  return best ? best.id : null
}

export function rowsToOffers(rows, feed, env, nowIso) {
  if (!rows.length) return []
  const header = rows[0].map((h) => String(h).trim().toLowerCase())
  const idx = {
    id: headerIndex(header, 'id'),
    name: headerIndex(header, 'name'),
    price: headerIndex(header, 'price'),
    link: headerIndex(header, 'link'),
    stock: headerIndex(header, 'stock'),
    delivery: headerIndex(header, 'delivery')
  }
  if (idx.name < 0 || idx.price < 0) return []

  const offers = []
  for (const row of rows.slice(1)) {
    const name = row[idx.name]
    const price = Number(String(row[idx.price] || '').replace(/[^0-9.]/g, ''))
    if (!name || !Number.isFinite(price) || price <= 0) continue
    const productId = matchProduct(name)
    if (!productId) continue

    const target = idx.link >= 0 ? row[idx.link] : null
    const affiliate = awinAffiliateUrl(env, target, feed.advertiserId)
    const stockRaw = idx.stock >= 0 ? String(row[idx.stock] || '').toLowerCase() : ''
    const inStock = stockRaw === '' || stockRaw === '1' || stockRaw === 'yes' || stockRaw === 'true' || stockRaw.includes('stock')

    offers.push({
      id: `${productId}-${feed.retailerId}-${idx.id >= 0 ? row[idx.id] : name.slice(0, 24)}`,
      retailer_id: feed.retailerId,
      product_id: productId,
      price,
      shipping: 0,
      total: price,
      currency: 'EUR',
      original_currency: 'EUR',
      delivery: idx.delivery >= 0 ? row[idx.delivery] || 'See shop' : 'See shop',
      stock: inStock ? 'in_stock' : 'out_of_stock',
      availability: inStock ? 'in_stock' : 'out_of_stock',
      shipping_conditions: null,
      source: 'awin_feed',
      url: target,
      affiliate_url: affiliate,
      tracking_parameters: affiliate ? { awinmid: feed.advertiserId, clickref: 'dealpilot' } : null,
      commission_status: affiliate ? 'configured' : 'not_configured',
      timestamp: nowIso,
      last_verified: nowIso,
      demo: false
    })
  }
  return offers
}

export function retailersFromFeeds(feeds, nowIso) {
  return feeds.map((f) => ({
    id: f.retailerId,
    name: f.name || f.retailerId,
    logo: (f.name || f.retailerId).slice(0, 1).toUpperCase(),
    country: f.country || 'DE',
    website: f.website || (f.domain ? `https://www.${f.domain}` : null),
    domain: f.domain || null,
    affiliate_url: null,
    affiliate_network: 'Awin',
    rating: null,
    shipping_policy: 'See shop',
    active: true,
    status: 'live',
    data_source: 'awin_feed',
    last_updated: nowIso
  }))
}

/** Fetch every configured feed and return normalized offers. */
export async function fetchAwinOffers(env, nowIso) {
  const feeds = parseFeeds(env)
  if (!feeds.length) return { offers: [], retailers: [] }

  const offers = []
  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url)
      if (!res.ok) continue
      const text = await res.text()
      offers.push(...rowsToOffers(parseCsv(text), feed, env, nowIso))
    } catch {
      /* skip a broken feed; others still run */
    }
  }
  return { offers, retailers: retailersFromFeeds(feeds, nowIso) }
}
