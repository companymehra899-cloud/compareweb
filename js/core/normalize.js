/**
 * Product normalization + matching.
 *
 * Rule: never merge products on name similarity alone. A match is only
 * "confirmed" when a hard identifier (EAN/GTIN or brand+MPN) agrees.
 * Everything weaker becomes possible_match / needs_review / rejected.
 */

export const MATCH_STATES = ['confirmed', 'possible_match', 'needs_review', 'rejected']

function clean(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeName(name) {
  return clean(name)
    .replace(/(\d+)\s*(gb|tb|mm|"|inch|ram)/g, '$1$2')
    .replace(/[-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normEan(v) {
  return String(v || '').replace(/\D/g, '') || null
}

function variantKey(attrs = {}) {
  return [attrs.storage, attrs.ram, attrs.color, attrs.size]
    .map((x) => clean(x))
    .filter(Boolean)
    .join('|')
}

/**
 * Compare two normalized products. Returns a state and the reasons.
 * `existing` and `candidate` use the provider normalized shape.
 */
export function matchProducts(existing, candidate) {
  const reasons = []
  const a = existing.attributes || {}
  const b = candidate.attributes || {}

  const eanA = normEan(existing.ean)
  const eanB = normEan(candidate.ean)
  if (eanA && eanB) {
    if (eanA === eanB) return { state: 'confirmed', score: 100, reasons: ['Identical EAN/GTIN'] }
    return { state: 'rejected', score: 0, reasons: ['Different EAN/GTIN'] }
  }

  const mpnA = clean(existing.mpn)
  const mpnB = clean(candidate.mpn)
  const brandA = clean(existing.brand)
  const brandB = clean(candidate.brand)
  if (mpnA && mpnB && brandA && brandB) {
    if (mpnA === mpnB && brandA === brandB) return { state: 'confirmed', score: 96, reasons: ['Same brand + manufacturer part number'] }
    if (mpnA === mpnB && brandA !== brandB) return { state: 'needs_review', score: 40, reasons: ['Same MPN but brand differs'] }
  }

  let score = 0
  if (brandA && brandA === brandB) { score += 20; reasons.push('Brand matches') }
  if (clean(existing.model) && clean(existing.model) === clean(candidate.model)) { score += 20; reasons.push('Model matches') }
  if (a.storage && b.storage && clean(a.storage) === clean(b.storage)) { score += 15; reasons.push('Storage matches') }
  if (a.ram && b.ram && clean(a.ram) === clean(b.ram)) { score += 15; reasons.push('RAM matches') }
  if (a.color && b.color && clean(a.color) === clean(b.color)) { score += 10; reasons.push('Colour matches') }
  if (a.size && b.size && clean(a.size) === clean(b.size)) { score += 10; reasons.push('Size matches') }
  if (normalizeName(existing.name) === normalizeName(candidate.name)) { score += 25; reasons.push('Normalized name matches') }
  else if (variantKey(a) && variantKey(a) === variantKey(b)) { score += 8; reasons.push('Variant key matches') }

  let state = 'rejected'
  if (score >= 75) state = 'possible_match'
  if (score >= 45 && score < 75) state = 'needs_review'
  if (score < 45) state = 'rejected'

  if (state === 'possible_match' && !(a.storage && b.storage)) {
    state = 'needs_review'
    reasons.push('Missing storage attribute: manual review required')
  }
  return { state, score, reasons }
}

/**
 * Group a normalized product list into canonical groups with a match state.
 * Uncertain groups are flagged for admin review rather than merged.
 */
export function canonicalize(products) {
  const groups = []
  for (const p of products) {
    let placed = false
    for (const g of groups) {
      const m = matchProducts(g.canonical, p)
      if (m.state === 'confirmed') {
        g.items.push(p)
        placed = true
        break
      }
      if (m.state === 'possible_match') {
        g.review.push({ candidate: p, ...m })
        g.items.push(p)
        placed = true
        break
      }
    }
    if (!placed) groups.push({ canonical: p, items: [p], review: [], state: 'confirmed' })
  }
  return groups.map((g) => ({ ...g, state: g.review.length ? 'needs_review' : 'confirmed' }))
}
