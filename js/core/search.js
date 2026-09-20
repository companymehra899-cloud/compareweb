/**
 * Search engine.
 *
 * Supports exact product name, brand, model, EAN/GTIN, category and
 * natural-language queries. NL queries are parsed into structured filters
 * (budget, category, use case, attributes) and scored against the database.
 * Weak results are never padded with fabricated matches: the caller gets
 * `exact` plus `related` (same category / brand / tags) separately.
 */

const STOP = new Set(['a', 'an', 'the', 'for', 'with', 'and', 'und', 'für', 'under', 'best', 'good', 'need', 'want', 'ich', 'mit', 'the', 'in', 'of', 'to', 'is'])

export function parseQuery(query) {
  const raw = String(query || '').trim()
  const q = raw.toLowerCase()
  const filters = { budget: null, category: null, useCase: null, attributes: [], ean: null, brand: null, model: null }

  const budget = q.replace(/\s/g, '').match(/(?:under|below|unter|<|≤|max)?€?(\d{3,5})/) || q.replace(/\s/g, '').match(/(\d{3,5})/)
  if (budget) filters.budget = Number(budget[1])

  const eanMatch = raw.replace(/\s/g, '').match(/\b(\d{8,13})\b/)
  if (eanMatch) filters.ean = eanMatch[1].replace(/\D/g, '')

  if (/laptop|notebook|ultrabook/.test(q)) filters.category = 'laptops'
  else if (/phone|smartphone|iphone|galaxy|pixel/.test(q)) filters.category = 'smartphones'
  else if (/headphone|kopfhörer|earbud|anc/.test(q)) filters.category = 'headphones'
  else if (/\btv\b|television|fernseher|oled/.test(q)) filters.category = 'tvs'
  else if (/watch|smartwatch/.test(q)) filters.category = 'smartwatches'

  if (/program|coding|develop|linux|docker/.test(q)) filters.useCase = 'programming'
  else if (/university|student|campus|uni/.test(q)) filters.useCase = 'university'
  else if (/gaming|ps5|gpu|rtx/.test(q)) filters.useCase = 'gaming'
  else if (/travel|commute|flight/.test(q)) filters.useCase = 'travel'

  if (/oled/.test(q)) filters.attributes.push('oled')
  if (/battery|akku/.test(q)) filters.attributes.push('battery')
  if (/light|thin|leicht/.test(q)) filters.attributes.push('lightweight')
  if (/noise.?cancel|anc/.test(q)) filters.attributes.push('anc')
  if (/rtx|cuda/.test(q)) filters.attributes.push('rtx')

  return { raw, filters, tokens: q.split(/[^a-z0-9äöüß]+/).filter((t) => t.length > 1 && !STOP.has(t)) }
}

function haystack(p) {
  return [p.name, p.brand, p.model, p.ean, p.sku, p.category, p.tagline, ...(p.tags || []), ...Object.values(p.specs || {})]
    .join(' ')
    .toLowerCase()
}

function scoreProduct(p, parsed) {
  const hay = haystack(p)
  const reasons = []
  let score = 0

  if (parsed.filters.ean) {
    const ean = String(p.ean || '').replace(/\D/g, '')
    if (ean && ean === parsed.filters.ean) return { score: 1000, reasons: ['Exact EAN/GTIN match'], exact: true }
  }

  const name = p.name.toLowerCase()
  if (parsed.tokens.length && parsed.tokens.every((t) => name.includes(t) || hay.includes(t))) {
    score += 30
    reasons.push('Name match')
  }
  for (const token of parsed.tokens) {
    if (name.includes(token)) score += 6
    else if (hay.includes(token)) score += 2
  }
  if (parsed.filters.category && p.category === parsed.filters.category) { score += 20; reasons.push('Category match') }
  if (parsed.filters.brand && (p.brand || '').toLowerCase() === parsed.filters.brand) score += 15

  const lo = p.offers?.length ? [...p.offers].sort((a, b) => a.total - b.total)[0] : null
  if (parsed.filters.budget && lo) {
    if (lo.total <= parsed.filters.budget) { score += 20; reasons.push('Within budget') }
    else { score -= Math.min(25, (lo.total - parsed.filters.budget) / 25); reasons.push('Over budget') }
  }
  if (parsed.filters.useCase && (p.tags || []).includes(parsed.filters.useCase)) { score += 12; reasons.push('Use case match') }
  for (const attr of parsed.filters.attributes) {
    if ((p.tags || []).includes(attr) || hay.includes(attr)) { score += 8; reasons.push(`${attr} match`) }
  }
  return { score, reasons, exact: false }
}

export function search(products, query, opts = {}) {
  const parsed = parseQuery(query)
  if (!parsed.raw) return { parsed, exact: products.slice(0, opts.limit || 24), related: [], query: parsed.raw }

  const scored = products
    .map((p) => ({ p, ...scoreProduct(p, parsed) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)

  const threshold = opts.threshold ?? 15
  const exact = scored.filter((x) => x.score >= threshold).map((x) => x.p)

  const seen = new Set(exact.map((p) => p.id))
  const related = []
  if (!exact.length || exact.length < (opts.minExact || 3)) {
    const cat = parsed.filters.category || exact[0]?.category
    const pool = products.filter((p) => !seen.has(p.id))
    const ranked = pool
      .map((p) => {
        let s = 0
        if (cat && p.category === cat) s += 5
        if (exact[0] && p.brand === exact[0].brand) s += 3
        if (parsed.filters.budget && p.offers?.length) {
          const lo = [...p.offers].sort((a, b) => a.total - b.total)[0]
          if (lo.total <= parsed.filters.budget) s += 2
        }
        return { p, s }
      })
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
    related.push(...ranked.map((x) => x.p))
  }
  return { parsed, exact, related, query: parsed.raw, exactMatches: exact.length }
}
