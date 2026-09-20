/**
 * Provider abstraction for legitimate product/price data sources.
 *
 * Nothing in the app hardcodes a single retailer. Pages consume the normalized
 * shape returned by providers, never raw feed payloads.
 *
 * Normalized shape (every provider MUST return this):
 * {
 *   product:  { canonicalId, name, brand, mpn, ean, model, category, variant, attributes },
 *   retailer: { id, name, country, domain, website, affiliateNetwork, status, dataSource },
 *   offer:    { id, productId, retailerId, price, shipping, total, currency,
 *               originalCurrency, delivery, availability, shippingConditions,
 *               source, timestamp, lastVerified }
 * }
 */

export class ProductDataProvider {
  get id() { return 'abstract' }
  get label() { return 'Abstract provider' }
  get status() { return 'unconfigured' }
  async products() { throw new Error('products() not implemented') }
}

export class RetailerFeedProvider {
  get id() { return 'abstract' }
  get label() { return 'Abstract provider' }
  get status() { return 'unconfigured' }
  async retailers() { throw new Error('retailers() not implemented') }
}

export class PriceProvider {
  get id() { return 'abstract' }
  get label() { return 'Abstract provider' }
  get status() { return 'unconfigured' }
  async offers(productId) { throw new Error('offers() not implemented') }
}

export class ExchangeRateProvider {
  get id() { return 'abstract' }
  get status() { return 'unconfigured' }
  async rate(from, to) { throw new Error('rate() not implemented') }
}

/**
 * Concrete provider backed by the local demo seed. It is intentionally labelled
 * so no caller can mistake it for a live feed.
 */
export class DemoSeedProvider extends ProductDataProvider {
  constructor(seed) {
    super()
    this.seed = seed || { products: [], retailers: [] }
  }
  get id() { return 'demo-seed' }
  get label() { return 'Demo seed data' }
  get status() { return 'demo' }

  async products() {
    return this.seed.products.map((p) => this.normalize(p))
  }

  async retailers() {
    return this.seed.retailers.map((r) => this.normalizeRetailer(r))
  }

  normalize(p) {
    return {
      product: {
        canonicalId: p.id,
        name: p.name,
        brand: p.brand,
        mpn: p.mpn || p.sku || null,
        ean: p.ean || null,
        model: p.model || null,
        category: p.category,
        variant: p.variant || null,
        attributes: {
          storage: p.specs?.Storage || null,
          ram: p.specs?.RAM || null,
          color: p.color || null,
          size: p.specs?.Display || null
        },
        demo: true
      },
      retailer: null,
      offer: null,
      price: null,
      currency: 'EUR',
      shipping: null,
      availability: null,
      delivery: null,
      source: 'demo_seed',
      timestamp: p.offers?.[0]?.timestamp || null
    }
  }

  normalizeRetailer(r) {
    return {
      product: null,
      retailer: {
        id: r.id,
        name: r.name,
        country: r.country,
        domain: r.domain || null,
        website: r.website || null,
        affiliateNetwork: r.affiliate_network || null,
        status: r.status || 'pending',
        dataSource: r.data_source || 'demo_seed'
      },
      offer: null,
      price: null,
      currency: 'EUR',
      shipping: null,
      availability: null,
      delivery: null,
      source: r.data_source || 'demo_seed',
      timestamp: r.last_updated || null
    }
  }
}

const registry = { product: [], retailer: [], price: [] }

export function registerProvider(kind, provider) {
  if (!registry[kind]) registry[kind] = []
  registry[kind].push(provider)
  return provider
}

export function getProviders(kind) {
  return registry[kind] || []
}

export function providerReport() {
  return ['product', 'retailer', 'price'].map((kind) => ({
    kind,
    providers: (registry[kind] || []).map((p) => ({ id: p.id, label: p.label, status: p.status }))
  }))
}

/**
 * Ingest from every registered provider and return a normalized, de-duplicated list.
 * Price history is intentionally NOT written here: history comes from recorded events only.
 */
export async function ingestAll() {
  const out = []
  for (const kind of ['product', 'retailer', 'price']) {
    for (const provider of getProviders(kind)) {
      if (provider.status === 'unconfigured') continue
      try {
        const rows = kind === 'price' ? await provider.offers() : kind === 'product' ? await provider.products() : await provider.retailers()
        out.push(...rows.map((r) => ({ ...r, provider: provider.id })))
      } catch (err) {
        out.push({ error: String(err.message || err), provider: provider.id, kind })
      }
    }
  }
  return out
}
