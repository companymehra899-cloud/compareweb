import { lowestOffer, savingPct, getRetailer } from './data.js'
import { getProductById, getProducts, getRetailers } from './db.js'
import { loadPrefs } from './state.js'
import { matchProducts } from './ai.js'
import { mount, t, offerMoney, amountMoney, freshBadge, productVisual, demoBadge, offerTable, resultCard, bindCompareChecks, qs, toast } from './ui.js'
import { recordPriceEvent, historyStats, HISTORY_EMPTY_MESSAGE } from './core/history.js'
import { resolveAffiliateLink, trackClick } from './core/affiliate.js'
import { track } from './core/analytics.js'

mount('laptops')
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t) })

const id = qs('id') || 'thinkpad-e14'
const p = getProductById(id) || getProducts()[0]
document.title = `${p.name} — DealPilot Europe`
const prefs = loadPrefs()
const lo = lowestOffer(p)
const save = savingPct(p)
const ai = matchProducts(p.name, prefs.country)
const retailers = getRetailers()

// Only genuinely observed non-seed offers may enter the price history store.
if (lo && lo.source && lo.source !== 'seed') recordPriceEvent(lo, p.id)
const stats = historyStats(p.id)

const periods = [{ d: 30, l: '30 days' }, { d: 90, l: '3 months' }, { d: 180, l: '6 months' }, { d: 365, l: '12 months' }]
let period = 365

document.getElementById('page').innerHTML = `
  <div class="crumb"><a href="index.html">${t('navHome')}</a> / <a href="category.html?id=${p.category}">${p.category}</a> / ${p.name}</div>
  <div class="layout">
    <div>
      <div class="card">
        <div id="hero">${productVisual(p, true)}</div>
        <div class="gallery" id="gallery">
          ${[['front', 'Front'], ['ports', 'Ports'], ['keyboard', 'Keyboard'], ['nameplate', 'Nameplate']].map(([v, g], i) => `<div class="g ${i === 0 ? 'on' : ''}" data-view="${v}">${g}</div>`).join('')}
        </div>
        <p class="mute">${t('illustration')} · ${t('demoData')}</p>
        <div class="kicker" style="margin-top:12px">${p.brand}</div>
        <h1 style="font-family:var(--serif);font-size:clamp(26px,3vw,38px);color:var(--navy);margin:6px 0">${p.name} ${demoBadge()}</h1>
        <div class="mute">${p.model} · EAN ${p.ean} · SKU ${p.sku} · ${p.variant} · ${p.color}</div>
        <div class="price" style="margin-top:14px">${lo ? offerMoney(lo) : '—'} ${save ? `<s>${amountMoney(p.list, lo?.currency || 'EUR')}</s> <span class="save">-${save}% ${t('demoData')}</span>` : ''}</div>
        <div class="mute">${t('total')}: ${lo ? `${amountMoney(lo.price, lo.original_currency || lo.currency)} + ${lo.shipping ? amountMoney(lo.shipping, lo.original_currency || lo.currency) : t('freeShip')}` : '—'}</div>
        ${lo ? `<div class="fresh-row">${freshBadge(lo)}</div>` : ''}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
          <a class="btn btn-navy" href="#offers">${t('comparePricesBtn')}</a>
          <label class="btn btn-ghost"><input type="checkbox" data-compare="${p.id}" style="margin-right:8px"/>${t('addCompare')}</label>
        </div>
      </div>

      <div class="card" id="offers" style="margin-top:16px">
        <h2 style="font-family:var(--serif);color:var(--navy);margin-bottom:6px">${t('retailers')} &amp; ${t('offers')}</h2>
        <p class="mute" style="margin-bottom:12px">${t('demoBanner')}</p>
        ${offerTable(p)}
      </div>

      <div class="card" style="margin-top:16px">
        <h2 style="font-family:var(--serif);color:var(--navy)">${t('howTitle')}</h2>
        <ul class="breakdown">
          <li><span>${t('price')}</span><b>${lo ? amountMoney(lo.price, lo.original_currency || lo.currency) : '—'}</b></li>
          <li><span>${t('shipping')}</span><b>${lo && lo.shipping ? amountMoney(lo.shipping, lo.original_currency || lo.currency) : t('freeShip')}</b></li>
          <li><span>${t('total')}</span><b>${lo ? offerMoney(lo) : '—'}</b></li>
          <li><span>${t('lastUpdated')}</span><b>${lo ? freshBadge(lo) : '—'}</b></li>
        </ul>
      </div>

      <div class="card" style="margin-top:16px">
        <h2 style="font-family:var(--serif);color:var(--navy)">${t('specs')} ${demoBadge()}</h2>
        <dl class="specs">${Object.entries(p.specs).map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
      </div>

      <div class="card" style="margin-top:16px">
        <h2 style="font-family:var(--serif);color:var(--navy)">${t('bestMatch')}</h2>
        <p style="margin:10px 0">${p.ai}</p>
        <div class="mute">${t('why')}</div>
        <ul class="check">${(p.why || []).map((w) => `<li>${w}</li>`).join('')}</ul>
        <div class="mute" style="margin-top:10px">${t('tradeoffs')}</div>
        <ul class="check">${(p.tradeoffs || []).map((w) => `<li>${w}</li>`).join('')}</ul>
      </div>
    </div>

    <div>
      <div class="card">
        <h2 style="font-family:var(--serif);color:var(--navy)">Price history</h2>
        <p class="mute">${t('emptyHistory')}</p>
        <div class="period-tabs" id="periods">
          ${periods.map((x) => `<button class="period ${x.d === period ? 'on' : ''}" data-d="${x.d}">${x.l}</button>`).join('')}
        </div>
        <div class="chart-wrap" id="chart-wrap">
          <div class="chart-empty" id="chart-empty"><p>${stats.insufficient ? HISTORY_EMPTY_MESSAGE : `${stats.count} recorded points`}</p></div>
        </div>
        <div class="hist-stats">
          <div class="hist-stat"><span>Current</span><b>${stats.current != null ? amountMoney(stats.current, lo?.currency || 'EUR') : (lo ? offerMoney(lo) : '—')}</b></div>
          <div class="hist-stat"><span>Lowest</span><b>${stats.low != null ? amountMoney(stats.low, lo?.currency || 'EUR') : '—'}</b></div>
          <div class="hist-stat"><span>Highest</span><b>${stats.high != null ? amountMoney(stats.high, lo?.currency || 'EUR') : '—'}</b></div>
          <div class="hist-stat"><span>Average</span><b>${stats.average != null ? amountMoney(Math.round(stats.average), lo?.currency || 'EUR') : '—'}</b></div>
        </div>
        <p class="note">${HISTORY_EMPTY_MESSAGE}</p>
      </div>

      <div class="card" style="margin-top:16px">
        <h2 style="font-family:var(--serif);color:var(--navy)">${t('alternative')}</h2>
        ${(ai.options || []).filter((x) => x.p.id !== p.id).slice(0, 2).map((x) => resultCard(x.p)).join('') || `<p class="mute">${t('emptySearch')}</p>`}
      </div>
    </div>
  </div>
`

document.getElementById('gallery').addEventListener('click', (e) => {
  const g = e.target.closest('.g')
  if (!g) return
  document.querySelectorAll('.gallery .g').forEach((x) => x.classList.toggle('on', x === g))
  const hero = document.getElementById('hero')
  if (hero) hero.innerHTML = productVisual(p, true, g.dataset.view || 'front')
})
document.getElementById('periods').addEventListener('click', (e) => {
  const b = e.target.closest('.period')
  if (!b) return
  period = Number(b.dataset.d)
  document.querySelectorAll('.period').forEach((x) => x.classList.toggle('on', x === b))
  toast(HISTORY_EMPTY_MESSAGE)
})

const modal = document.getElementById('go-modal')
if (modal) {
  document.getElementById('go-ok').textContent = t('continue')
  document.querySelectorAll('[data-aff]').forEach((el) => {
    el.addEventListener('click', (ev) => {
      const offer = p.offers.find((o) => o.id === el.dataset.offer) || lo
      const r = retailers.find((x) => x.id === el.dataset.aff) || getRetailer(el.dataset.aff)
      const link = resolveAffiliateLink(offer, r, retailers)
      if (!link.ok) return
      trackClick({ productId: p.id, offerId: offer?.id, retailerId: el.dataset.aff, country: prefs.country })
      track('deal_click', { product_id: p.id, retailer_id: el.dataset.aff })
      if (!el.href || el.href === '#') ev.preventDefault()
    })
  })
  document.getElementById('go-cancel')?.addEventListener('click', () => modal.classList.remove('open'))
  document.getElementById('go-ok')?.addEventListener('click', () => { modal.classList.remove('open'); toast(t('commissionNone')) })
}

document.getElementById('sticky').innerHTML = `
  <div><div class="mute">${t('lowestTotal')}</div><b>${lo ? offerMoney(lo) : '—'}</b></div>
  <a class="btn btn-navy" href="#offers">${t('viewDeal')}</a>`
bindCompareChecks()
