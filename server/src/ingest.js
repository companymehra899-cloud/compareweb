/**
 * Ingestion job. Pulls offers from every configured provider, merges them per
 * product onto the editorial seed entries, stores the result and appends a
 * price-history snapshot. Runs on the wrangler cron trigger, or on demand via
 * POST /api/ingest.
 */

import { TRACKED, seedProduct } from './tracked.js'
import { searchItems, isConfigured as ebayConfigured } from './providers/ebay.js'
import { fetchAwinOffers, isConfigured as awinConfigured } from './providers/awin.js'
import { ebayRetailer, offerFromEbayItem, productWithOffers } from './lib/normalize.js'
import { saveProducts, saveOffers, upsertRetailer, snapshotPrices, setMeta, countProducts } from './lib/db.js'

function mergeOffer(map, offer) {
  if (!offer?.product_id) return
  const list = map.get(offer.product_id) || []
  if (!list.some((o) => o.id === offer.id)) list.push(offer)
  map.set(offer.product_id, list)
}

export async function runIngest(env) {
  const nowIso = new Date().toISOString()
  const summary = { startedAt: nowIso, providers: {}, errors: [] }
  const offersByProduct = new Map()

  if (ebayConfigured(env)) {
    await upsertRetailer(env, ebayRetailer(nowIso), nowIso)
    let found = 0
    for (const tracked of TRACKED) {
      const seed = seedProduct(tracked.id)
      if (!seed) continue
      try {
        const items = await searchItems(env, { query: tracked.query, limit: tracked.limit || 6 })
        for (const item of items) {
          const offer = offerFromEbayItem(item, tracked.id, env, nowIso)
          if (offer) {
            mergeOffer(offersByProduct, offer)
            found += 1
          }
        }
      } catch (err) {
        summary.errors.push({ provider: 'ebay', product: tracked.id, error: String(err.message || err) })
      }
    }
    summary.providers.ebay = { offers: found }
  } else {
    summary.errors.push({ provider: 'ebay', error: 'credentials not configured' })
  }

  if (awinConfigured(env)) {
    try {
      const { offers, retailers } = await fetchAwinOffers(env, nowIso)
      for (const r of retailers) await upsertRetailer(env, r, nowIso)
      for (const offer of offers) mergeOffer(offersByProduct, offer)
      summary.providers.awin = { offers: offers.length }
    } catch (err) {
      summary.errors.push({ provider: 'awin', error: String(err.message || err) })
    }
  }

  const products = []
  const allOffers = []
  for (const [productId, offers] of offersByProduct) {
    const seed = seedProduct(productId)
    if (!seed) continue
    const offers_sorted = offers.sort((a, b) => (a.total ?? a.price) - (b.total ?? b.price))
    const product = productWithOffers(seed, offers_sorted, nowIso)
    if (product) {
      products.push(product)
      allOffers.push(...offers_sorted)
    }
  }

  if (products.length) {
    await saveProducts(env, products, nowIso)
    await saveOffers(env, allOffers, nowIso)
    await snapshotPrices(env, allOffers)
    await setMeta(env, 'source', 'live_providers')
    summary.products = products.length
    summary.offers = allOffers.length
  } else {
    await setMeta(env, 'source', 'demo_seed')
    summary.products = 0
    summary.offers = 0
  }

  await setMeta(env, 'generatedAt', nowIso)
  summary.totalProducts = await countProducts(env)
  summary.finishedAt = new Date().toISOString()
  return summary
}
