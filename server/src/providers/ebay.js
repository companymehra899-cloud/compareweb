/**
 * eBay Browse API adapter (official, free tier).
 *
 * Docs: https://developer.ebay.com/api-docs/buy/browse/overview.html
 * Requires an eBay developer application (App ID + Cert ID). The OAuth token is
 * cached in D1 so we only request a new one when it is close to expiring.
 */

import { getMeta, setMeta } from '../lib/db.js'

const TOKEN_KEY = 'ebay_token'

function apiHost(env) {
  return env.EBAY_ENVIRONMENT === 'sandbox' ? 'https://api.sandbox.ebay.com' : 'https://api.ebay.com'
}

export function isConfigured(env) {
  return Boolean(env.EBAY_CLIENT_ID && env.EBAY_CLIENT_SECRET)
}

async function getToken(env) {
  const cached = await getMeta(env, TOKEN_KEY)
  if (cached) {
    try {
      const { token, expiresAt } = JSON.parse(cached)
      if (token && Date.parse(expiresAt) - Date.now() > 60_000) return token
    } catch {
      /* fall through to a fresh token */
    }
  }

  const res = await fetch(`${apiHost(env)}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      authorization: `Basic ${btoa(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`)}`
    },
    body: 'grant_type=client_credentials&scope=' + encodeURIComponent('https://api.ebay.com/oauth/api_scope')
  })
  if (!res.ok) throw new Error(`eBay token request failed (${res.status})`)

  const data = await res.json()
  const expiresAt = new Date(Date.now() + Math.max(60, (data.expires_in || 7200) - 120) * 1000).toISOString()
  await setMeta(env, TOKEN_KEY, JSON.stringify({ token: data.access_token, expiresAt }))
  return data.access_token
}

/** Search item summaries for a query. Returns raw eBay itemSummary objects. */
export async function searchItems(env, { query, limit = 6 }) {
  const token = await getToken(env)
  const url = new URL(`${apiHost(env)}/buy/browse/v1/item_summary/search`)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', String(Math.min(Math.max(limit, 1), 50)))
  url.searchParams.set('sort', 'price')

  const res = await fetch(url.toString(), {
    headers: {
      authorization: `Bearer ${token}`,
      'X-EBAY-C-MARKETPLACE-ID': env.EBAY_MARKETPLACE_ID || 'EBAY_DE',
      'X-EBAY-C-ENDUSERCTX': 'contextualLocation=country=DE'
    }
  })
  if (!res.ok) throw new Error(`eBay search failed (${res.status}) for "${query}"`)

  const data = await res.json()
  return data.itemSummaries || []
}
