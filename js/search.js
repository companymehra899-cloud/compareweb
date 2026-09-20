import { getProducts, getRetailers } from './db.js'
import { loadPrefs } from './state.js'
import { lowestOffer, savingPct, getRetailer } from './data.js'
import { search as coreSearch } from './core/search.js'
import { mount, t, money, resultCard, bindCompareChecks, qs } from './ui.js'

mount('home')
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t) })
document.querySelectorAll('[data-t-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.tPlaceholder) })

const query = qs('q') || ''
const PAGE_SIZE = 8
let category = qs('category') || 'all'
let page = 1
let state = { sort: 'relevance', brand: 'all', retailer: 'all', priceMax: '', delivery: 'all', country: 'DE' }

const products = getProducts()
const retailers = getRetailers()

function apply(list) {
  let out = [...list]
  if (category !== 'all') out = out.filter((p) => p.category === category)
  if (state.brand !== 'all') out = out.filter((p) => p.brand === state.brand)
  if (state.retailer !== 'all') out = out.filter((p) => p.offers.some((o) => o.retailer_id === state.retailer))
  if (state.delivery !== 'all') out = out.filter((p) => p.offers.some((o) => (o.delivery || '').includes(state.delivery)))
  if (state.priceMax) out = out.filter((p) => lowestOffer(p)?.total <= Number(state.priceMax))
  if (state.sort === 'lowest') out.sort((a, b) => (lowestOffer(a)?.total || 1e9) - (lowestOffer(b)?.total || 1e9))
  if (state.sort === 'discount') out.sort((a, b) => savingPct(b) - savingPct(a))
  if (state.sort === 'rating') out.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  if (state.sort === 'updated') out.sort((a, b) => new Date(b.offers[0].timestamp) - new Date(a.offers[0].timestamp))
  return out
}

function compute() {
  if (!query.trim()) return { exact: apply(products), related: [], parsed: null }
  const res = coreSearch(products, query, { limit: 48 })
  const exact = apply(res.exact)
  const exactIds = new Set(exact.map((p) => p.id))
  const related = apply(res.related).filter((p) => !exactIds.has(p.id))
  return { exact, related, parsed: res.parsed }
}

function renderFilters() {
  const brands = ['all', ...new Set(products.map((p) => p.brand))]
  const rs = ['all', ...retailers.filter((r) => r.active).map((r) => r.id)]
  document.getElementById('filters-panel').innerHTML = `
    <label>${t('brand')}
      <select data-f="brand">${brands.map((b) => `<option value="${b}" ${state.brand === b ? 'selected' : ''}>${b}</option>`).join('')}</select>
    </label>
    <label>${t('retailer')}
      <select data-f="retailer">${rs.map((r) => `<option value="${r}" ${state.retailer === r ? 'selected' : ''}>${r === 'all' ? 'all' : getRetailer(r)?.name}</option>`).join('')}</select>
    </label>
    <label>${t('delivery')}
      <select data-f="delivery">
        ${['all', '1–2', '2–4', 'store'].map((d) => `<option value="${d}" ${state.delivery === d ? 'selected' : ''}>${d === 'all' ? 'all' : d}</option>`).join('')}
      </select>
    </label>
    <label>${t('price')} max (${loadPrefs().country})
      <input data-f="priceMax" type="number" min="0" placeholder="e.g. 700" value="${state.priceMax}" />
    </label>
    <label>${t('sort')}
      <select data-f="sort">
        <option value="relevance" ${state.sort === 'relevance' ? 'selected' : ''}>${t('relevance')}</option>
        <option value="lowest" ${state.sort === 'lowest' ? 'selected' : ''}>${t('lowestTotal')}</option>
        <option value="discount" ${state.sort === 'discount' ? 'selected' : ''}>${t('highestDiscount')}</option>
        <option value="rating" ${state.sort === 'rating' ? 'selected' : ''}>${t('rating')}</option>
        <option value="updated" ${state.sort === 'updated' ? 'selected' : ''}>${t('recentlyUpdated')}</option>
      </select>
    </label>
    <button class="btn btn-ghost" id="clear-filters" type="button">${t('clearFilters')}</button>`
  document.querySelectorAll('[data-f]').forEach((el) => {
    el.addEventListener('change', () => {
      state[el.dataset.f] = el.value
      page = 1
      render()
    })
  })
  document.getElementById('clear-filters').addEventListener('click', () => {
    state = { sort: 'relevance', brand: 'all', retailer: 'all', priceMax: '', delivery: 'all', country: 'DE' }
    category = 'all'
    page = 1
    renderFilters()
    render()
  })
}

function renderSteps() {
  document.getElementById('steps').innerHTML = ['navHome', 'searchCrumb', 'filters', 'viewDeal'].map((k, i) => `
    <span class="s ${i === 1 ? 'on' : ''}">${t(k) || k}</span>${i < 3 ? '<span class="arrow">→</span>' : ''}`).join('')
}

function chips(parsed) {
  if (!parsed) return ''
  const f = parsed.filters
  const items = []
  if (f.budget) items.push(`${t('budget')}: €${f.budget}`)
  if (f.category) items.push(f.category)
  if (f.useCase) items.push(f.useCase)
  f.attributes.forEach((a) => items.push(a))
  if (f.ean) items.push(`EAN ${f.ean}`)
  return items.length ? `<div class="pills" style="margin-bottom:12px">${items.map((x) => `<span class="pill">${x}</span>`).join('')}</div>` : ''
}

function render() {
  const { exact, related, parsed } = compute()
  const totalPages = Math.max(1, Math.ceil(exact.length / PAGE_SIZE))
  if (page > totalPages) page = totalPages
  const slice = exact.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  document.getElementById('count').textContent = `${exact.length} ${t('products')} · ${t('demoData')}`
  const q = document.getElementById('query-chips')
  if (q) q.innerHTML = chips(parsed)

  const results = document.getElementById('results')
  results.innerHTML = exact.length
    ? slice.map(resultCard).join('')
    : `<div class="empty-state">
        <h3>${query.trim() ? t('noExactMatches') : t('emptySearch')}</h3>
        <p>${query.trim() ? 'We do not pad results with fabricated matches. Try the suggestions below.' : t('emptyCountry')}</p>
        <a class="btn btn-navy" style="margin-top:14px" href="category.html?id=laptops">${t('browseLaptops')}</a>
      </div>`

  const pager = document.getElementById('pager')
  pager.innerHTML = exact.length > PAGE_SIZE ? `
    <button class="btn btn-ghost" id="pg-prev" ${page === 1 ? 'disabled' : ''}>${t('prev')}</button>
    <span class="mute">${t('page')} ${page} ${t('of')} ${totalPages}</span>
    <button class="btn btn-ghost" id="pg-next" ${page === totalPages ? 'disabled' : ''}>${t('next')}</button>` : ''
  document.getElementById('pg-prev')?.addEventListener('click', () => { page--; render() })
  document.getElementById('pg-next')?.addEventListener('click', () => { page++; render() })

  const rel = document.getElementById('related')
  rel.innerHTML = related.length ? `
    <h2 style="font-family:var(--serif);color:var(--navy);margin:26px 0 12px">${t('relatedProducts')}</h2>
    <p class="mute" style="margin-bottom:12px">Not an exact match for your query, shown for context only.</p>
    ${related.slice(0, 4).map(resultCard).join('')}` : ''

  bindCompareChecks()
}

document.getElementById('title').textContent = query ? `Results for “${query}”` : t('catsTitle')
document.getElementById('q').value = query
document.getElementById('filters-toggle').addEventListener('click', () => {
  document.getElementById('filters-panel').classList.toggle('show')
})
renderSteps()
renderFilters()
render()
