/**
 * DealPilot Europe backend (Cloudflare Worker).
 *
 * Routes:
 *   GET  /api/health            service + dataset status
 *   GET  /api/catalogue         full normalized catalogue (what the frontend hydrates from)
 *   GET  /api/products          product list
 *   GET  /api/products/:id      single product
 *   GET  /api/history/:id       recorded price history for a product
 *   POST /api/clicks            click beacon
 *   POST /api/ingest            manual ingestion trigger (requires x-ingest-token)
 *
 * Until providers are configured the endpoints serve the bundled demo seed, so
 * the API is always usable and the frontend stays honest about the data source.
 */

import { runIngest } from './ingest.js'
import { corsHeaders, json, notFound, tokenMatches } from './lib/http.js'
import {
  countProducts,
  getMeta,
  historyFor,
  listProducts,
  listRetailers,
  recordClick
} from './lib/db.js'
import { PRODUCTS, RETAILERS, GUIDES, COUNTRIES, CATEGORIES, LANGUAGES, SEED_AT } from '../../js/data.js'

async function catalogue(env) {
  const dbProducts = await listProducts(env)
  const dbRetailers = await listRetailers(env)
  const live = dbProducts.length > 0
  return {
    products: live ? dbProducts : PRODUCTS,
    retailers: dbRetailers.length ? dbRetailers : RETAILERS,
    guides: GUIDES,
    countries: COUNTRIES,
    categories: CATEGORIES,
    languages: LANGUAGES,
    seedAt: SEED_AT,
    source: live ? (await getMeta(env, 'source')) || 'live_providers' : 'demo_seed',
    generatedAt: live ? (await getMeta(env, 'generatedAt')) || new Date().toISOString() : SEED_AT
  }
}

async function readJson(request) {
  try {
    return await request.json()
  } catch {
    return null
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const cors = corsHeaders(env, request)

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

    try {
      if (url.pathname === '/api/health') {
        return json(
          {
            ok: true,
            products: await countProducts(env),
            source: (await getMeta(env, 'source')) || 'demo_seed',
            generatedAt: (await getMeta(env, 'generatedAt')) || SEED_AT
          },
          { headers: cors }
        )
      }

      if (url.pathname === '/api/catalogue') {
        return json(await catalogue(env), { headers: cors, maxAge: 120 })
      }

      if (url.pathname === '/api/products') {
        const data = await catalogue(env)
        return json({ products: data.products, source: data.source, generatedAt: data.generatedAt }, { headers: cors })
      }

      const productMatch = url.pathname.match(/^\/api\/products\/([^/]+)$/)
      if (productMatch) {
        const id = decodeURIComponent(productMatch[1])
        const data = await catalogue(env)
        const product = data.products.find((p) => p.id === id)
        return product ? json({ product, source: data.source }, { headers: cors }) : notFound(cors)
      }

      const historyMatch = url.pathname.match(/^\/api\/history\/([^/]+)$/)
      if (historyMatch) {
        const id = decodeURIComponent(historyMatch[1])
        const history = await historyFor(env, id)
        return json({ product_id: id, history }, { headers: cors })
      }

      if (url.pathname === '/api/clicks' && request.method === 'POST') {
        const body = await readJson(request)
        if (!body?.click_id) return json({ error: 'click_id_required' }, { status: 400, headers: cors })
        await recordClick(env, body)
        return new Response(null, { status: 204, headers: cors })
      }

      if (url.pathname === '/api/ingest' && request.method === 'POST') {
        if (!tokenMatches(env, request.headers.get('x-ingest-token'))) {
          return json({ error: 'unauthorized' }, { status: 401, headers: cors })
        }
        const summary = await runIngest(env)
        return json(summary, { headers: cors, maxAge: 0 })
      }

      return notFound(cors)
    } catch (err) {
      return json({ error: 'internal_error', message: String(err?.message || err) }, { status: 500, headers: cors })
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runIngest(env))
  }
}
