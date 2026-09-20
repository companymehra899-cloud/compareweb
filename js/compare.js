import { lowestOffer, savingPct, getRetailer } from './data.js'
import { getProducts } from './db.js'
import { loadPrefs, toggleCompare } from './state.js'
import { mount, t, money, qs, demoBadge } from './ui.js'

mount('compare')
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t) })

const products = getProducts()
const prefs = loadPrefs()
let selected = (qs('ids') || prefs.compare.join(','))
  .split(',')
  .map((id) => products.find((p) => p.id === id))
  .filter(Boolean)
  .slice(0, 4)
if (selected.length < 2) selected = products.filter((p) => p.category === 'laptops').slice(0, 3)

function renderPicks() {
  document.getElementById('picks').innerHTML = products.map((p) => {
    const on = selected.some((s) => s.id === p.id)
    return `<button class="filter ${on ? 'on' : ''}" data-id="${p.id}">${p.brand} · ${p.name.split(' ').slice(-2).join(' ')}</button>`
  }).join('')
}

function renderTable() {
  const rows = [
    ['lowestTotal', (p) => money(lowestOffer(p).total), true],
    ['discount', (p) => savingPct(p) + '%', false],
    ['retailers', (p) => `${p.offers.length} ${t('offers')}`, false],
    ['rating', (p) => p.rating ? String(p.rating) : '—', false],
    ['cpu', (p) => p.specs.CPU || p.specs.Chip || '—', false],
    ['ram', (p) => p.specs.RAM || '—', false],
    ['storage', (p) => p.specs.Storage || '—', false],
    ['display', (p) => p.specs.Display || '—', false],
    ['battery', (p) => p.specs.Battery || '—', false],
    ['weight', (p) => p.specs.Weight || '—', false],
    ['warranty', (p) => p.specs.Warranty || p.warranty || '—', false]
  ]
  const head = `<tr><th></th>${selected.map((p) => `<th><a href="product.html?id=${p.id}">${p.name}</a><div class="mute">${p.brand} ${demoBadge()}</div></th>`).join('')}</tr>`
  const body = rows.map(([key, fn, highlight]) => {
    const min = highlight ? Math.min(...selected.map((p) => lowestOffer(p)?.total || Infinity)) : null
    return `<tr><th>${t(key)}</th>${selected.map((p) => {
      const lo = lowestOffer(p)
      const cls = highlight && lo && lo.total === min ? 'best' : ''
      return `<td class="${cls}">${fn(p)}</td>`
    }).join('')}</tr>`
  }).join('')
  const cta = `<tr><th></th>${selected.map((p) => `<td><a class="btn btn-navy" href="product.html?id=${p.id}">${t('viewDeal')}</a></td>`).join('')}</tr>`
  document.getElementById('table').innerHTML = `<table class="cmp">${head}${body}${cta}</table>`
}

renderPicks()
renderTable()

document.getElementById('picks').addEventListener('click', (e) => {
  const b = e.target.closest('[data-id]')
  if (!b) return
  const p = products.find((x) => x.id === b.dataset.id)
  const i = selected.findIndex((s) => s.id === p.id)
  if (i >= 0) {
    if (selected.length > 2) selected.splice(i, 1)
  } else {
    if (selected.length >= 4) selected.shift()
    selected.push(p)
  }
  selected.forEach((s) => {
    const on = selected.some((x) => x.id === s.id)
    const prefsNow = loadPrefs()
    if (on && !prefsNow.compare.includes(s.id)) toggleCompare(s.id)
    if (!on && prefsNow.compare.includes(s.id)) toggleCompare(s.id)
  })
  renderPicks()
  renderTable()
})
