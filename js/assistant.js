import { lowestOffer } from './data.js'
import { getProducts } from './db.js'
import { loadPrefs } from './state.js'
import { matchProducts } from './ai.js'
import { search as coreSearch } from './core/search.js'
import { ask, aiStatus } from './core/ai.js'
import { mount, t, money, resultCard, bindCompareChecks, qs } from './ui.js'

mount('ai')
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t) })
document.querySelectorAll('[data-t-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.tPlaceholder) })

const msgs = document.getElementById('msgs')
const side = document.getElementById('side')
const options = document.getElementById('options')
const prefs = loadPrefs()
const mode = aiStatus().mode
const modeEl = document.getElementById('ai-mode')
if (modeEl) {
  modeEl.textContent = mode === 'server'
    ? 'AI explanations are served by our backend. The API key stays server-side.'
    : 'No AI backend configured. Requirements are matched against the local catalogue only — this is not an LLM.'
}

function retrieve(query, country) {
  const res = coreSearch(getProducts(), query, { limit: 6 })
  return { products: res.exact.length ? res.exact : res.related, parsed: res.parsed }
}

function requirementChips(req) {
  return [
    [t('budget'), req.budget ? '€' + req.budget : '—'],
    [t('country'), req.country],
    [t('use'), req.use || '—'],
    [t('priority'), req.priority || '—']
  ].map(([k, v]) => `<span class="pill">${k}: <b>${v}</b></span>`).join('')
}

function paint(m, query) {
  msgs.insertAdjacentHTML('beforeend', `<div class="bubble user">${query}</div>`)
  msgs.insertAdjacentHTML('beforeend', `<div class="bubble bot">${m.html}</div>`)
  msgs.scrollTop = msgs.scrollHeight
  if (!m.best) {
    side.innerHTML = `<div class="mute">${t('emptySearch')}</div>`
    options.innerHTML = ''
    return
  }
  side.innerHTML = `
    <div class="mute">${t('extracted')}</div>
    <div class="pills" style="margin:8px 0 14px">${requirementChips(m.req)}</div>
    <div class="mute">${t('bestMatch')}</div>
    <h3>${m.best.name}</h3>
    <p class="tagline">${m.text}</p>
    <div class="price" style="margin:8px 0">${money(lowestOffer(m.best).total)}</div>
    <ul class="check">${m.reasons.map((r) => `<li>${r}</li>`).join('')}</ul>
    <div class="mute">${t('tradeoffs')}</div>
    <ul class="check">${(m.best.tradeoffs || []).map((r) => `<li>${r}</li>`).join('')}</ul>
    <a class="btn btn-navy" href="product.html?id=${m.best.id}">${t('viewDeal')}</a>`

  options.innerHTML = m.options.map((x) => {
    const p = x.p
    const lo = lowestOffer(p)
    return `<div class="result">
      <a href="product.html?id=${p.id}">${''}</a>
      <div>
        <div class="mute">${p.brand} · ${p.category}</div>
        <a href="product.html?id=${p.id}"><strong>${p.name}</strong></a>
        <div class="tagline">${p.ai}</div>
        <div class="mute">${p.specs.RAM || p.specs.Type || ''} ${p.specs.Storage ? '· ' + p.specs.Storage : ''} · ${p.offers.length} ${t('offers')} · ${t('demoData')}</div>
      </div>
      <div class="result-price">
        <div class="price" style="font-size:24px">${money(lo.total)}</div>
        <a class="btn btn-navy" href="product.html?id=${p.id}">${t('viewDeal')}</a>
      </div>
    </div>`
  }).join('')
}

document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const input = document.getElementById('input')
  const q = input.value.trim()
  if (!q) return
  const m = matchProducts(q, prefs.country)
  const ai = await ask(q, prefs.country, retrieve)
  if (ai.error && (ai.source === 'validation' || ai.source === 'rate-limit')) {
    msgs.insertAdjacentHTML('beforeend', `<div class="bubble user">${q}</div><div class="bubble bot">${ai.error}</div>`)
    msgs.scrollTop = msgs.scrollHeight
    return
  }
  if (ai.source === 'server' && ai.text) m.text = ai.text
  paint(m, q)
  input.value = ''
})
document.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
  document.getElementById('input').value = c.dataset.q
  document.getElementById('form').requestSubmit()
}))

const initial = qs('q') || 'I need a laptop for university, €700 budget, good battery.'
document.getElementById('input').value = initial
document.getElementById('form').requestSubmit()
