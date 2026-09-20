import { getProducts } from './db.js'

function tokens(s) {
  return (s || '')
    .toLowerCase()
    .replace(/[€$£]/g, ' ')
    .split(/[^a-z0-9äöüß]+/)
    .filter((t) => t.length > 1)
}

export function extractRequirements(query, country = 'DE') {
  const q = query || ''
  const m = q.replace(/\s/g, '').match(/(\d{3,5})/)
  const budget = m ? Number(m[1]) : null
  const use =
    /universit|student|campus|uni|lecture/i.test(q) ? 'University' :
    /program|coding|develop|ide|docker|linux/i.test(q) ? 'Programming' :
    /travel|commute|flight/i.test(q) ? 'Travel' :
    /gaming|rtx|gpu|ps5|game/i.test(q) ? 'Gaming' :
    /office|business/i.test(q) ? 'Office' : null
  const priority =
    /battery|akku|all.day/i.test(q) ? 'Battery' :
    /light|thin|weight|leicht/i.test(q) ? 'Weight' :
    /oled|display|screen/i.test(q) ? 'Display' :
    /keyboard|tastatur/i.test(q) ? 'Keyboard' :
    /price|budget|günstig|cheap/i.test(q) ? 'Price' : null
  let category = null
  if (/laptop|notebook/i.test(q)) category = 'laptops'
  else if (/phone|iphone|galaxy|smartphone/i.test(q)) category = 'smartphones'
  else if (/headphone|anc|xm5|kopfhörer/i.test(q)) category = 'headphones'
  else if (/\btv\b|oled|ps5/i.test(q)) category = 'tvs'
  else if (/watch/i.test(q)) category = 'smartwatches'
  return { budget, country, use, priority, category, raw: q }
}

export function matchProducts(query, country = 'DE') {
  const req = extractRequirements(query, country)
  const t = tokens(query)
  const products = getProducts()
  const scored = products.map((p) => {
    let score = 0
    const hay = [p.name, p.brand, p.model, p.category, p.tagline, ...(p.tags || []), ...Object.values(p.specs || {})].join(' ').toLowerCase()
    t.forEach((tok) => { if (hay.includes(tok)) score += 3 })
    const lo = p.offers?.length ? [...p.offers].sort((a, b) => a.total - b.total)[0] : null
    if (req.budget && lo) {
      if (lo.total <= req.budget) score += 12
      else score -= Math.min(18, (lo.total - req.budget) / 25)
    }
    if (req.category && p.category === req.category) score += 10
    if (req.use === 'Programming' && p.tags.includes('programming')) score += 8
    if (req.use === 'University' && p.tags.includes('university')) score += 6
    if (req.use === 'Gaming' && p.tags.includes('gaming')) score += 10
    if (req.use === 'Travel' && (p.tags.includes('travel') || p.tags.includes('lightweight'))) score += 6
    if (req.priority === 'Battery' && p.tags.includes('battery')) score += 6
    if (req.priority === 'Weight' && p.tags.includes('lightweight')) score += 6
    if (req.priority === 'Display' && /oled|retina/i.test(JSON.stringify(p.specs))) score += 5
    if (country !== 'DE') score -= 2
    return { p, score, lo }
  }).sort((a, b) => b.score - a.score)

  let list = scored.filter((x) => x.score > 0)
  if (!list.length) list = scored
  list = list.slice(0, 5)

  if (!list.length) {
    return { req, best: null, options: [], text: '', reasons: [], html: 'No rows matched. The demo catalogue is small (12 products), so try a broader brief.' }
  }

  const best = list[0].p
  const reasons = []
  const lo = list[0].lo
  if (lo) reasons.push(`${req.budget && lo.total <= req.budget ? 'Fits' : 'Over'} the ${req.budget ? '€' + req.budget : ''} budget at total price`)
  ;(best.why || []).slice(0, 2).forEach((w) => reasons.push(w))
  if (lo) reasons.push(`${lo.total <= (req.budget || Infinity) ? 'Lowest total in demo row' : 'Lowest demo total'}: ${(lo.total).toFixed(0)} EUR`)

  const text = best.ai
  const html = `<strong>${t_('bestMatch')}: ${best.name}</strong><br>${best.ai}<br><a href="product.html?id=${best.id}">Compare prices →</a>`

  return { req, best, options: list, text, reasons, html }
}

function t_(key) {
  try {
    const lang = JSON.parse(localStorage.getItem('dealpilot.prefs.v2') || '{}').lang || 'en'
    return lang === 'de' ? 'Bester Treffer für Ihre Anforderungen' : 'Best match for your requirements'
  } catch {
    return 'Best match for your requirements'
  }
}
