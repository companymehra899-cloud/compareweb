import { COUNTRIES, CATEGORIES, formatMoney, lowestOffer, savingPct, getRetailer, stockLabel, SEED_AT, categoryCount } from './data.js'
import { loadPrefs, setCountry, setLang, toggleCompare, bootFromPath, qs } from './state.js'
import { t as tr } from './i18n.js'
import { getRetailers } from './db.js'
import { displayPriceSync } from './core/currency.js'
import { freshnessState, freshnessLabel, freshnessClass } from './core/freshness.js'
import { resolveAffiliateLink } from './core/affiliate.js'

export function t(key) {
  return tr(loadPrefs().lang, key)
}

function langLink(href) {
  const lang = loadPrefs().lang
  if (lang !== 'de' || href.startsWith('de/') || /\.(xml|txt)$/.test(href)) return href
  return href + (href.includes('?') ? '&' : '?') + 'lang=de'
}

export function visitorCurrency() {
  return loadPrefs().country === 'GB' ? 'GBP' : 'EUR'
}

export function amountMoney(amount, currency) {
  const d = displayPriceSync(amount, currency || 'EUR', visitorCurrency())
  return d.converted ? `${d.text} <small class="est">${t('convertedEstimate')}</small>` : d.text
}

export function offerMoney(o) {
  if (!o) return '—'
  const d = displayPriceSync(o.total, o.original_currency || o.currency, visitorCurrency())
  return d.converted ? `${d.text} <small class="est">${t('convertedEstimate')}</small>` : d.text
}

export function freshBadge(o) {
  if (!o) return ''
  const st = freshnessState(o.timestamp, o.availability || o.stock)
  const warn = st === 'stale' || st === 'unavailable'
  return `<span class="fresh ${freshnessClass(st)}" ${warn ? `title="${t('staleWarning')}"` : ''}>${freshnessLabel(st, o.timestamp)}</span>`
}

export function icon(name) {
  const common = 'width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"'
  const map = {
    phone: `<svg ${common}><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>`,
    laptop: `<svg ${common}><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/></svg>`,
    headphones: `<svg ${common}><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="2" y="14" width="5" height="7" rx="2"/><rect x="17" y="14" width="5" height="7" rx="2"/></svg>`,
    tv: `<svg ${common}><rect x="2" y="5" width="20" height="12" rx="2"/><path d="M8 21h8"/></svg>`,
    game: `<svg ${common}><rect x="2" y="7" width="20" height="10" rx="4"/><path d="M8 12h4M10 10v4M17 11h.01M15 13h.01"/></svg>`,
    watch: `<svg ${common}><rect x="7" y="6" width="10" height="12" rx="3"/><path d="M9 6V3h6v3M9 21v-3h6v3"/></svg>`,
    home: `<svg ${common}><path d="M4 10l8-7 8 7v10H4z"/><path d="M9 20v-6h6v6"/></svg>`,
    fashion: `<svg ${common}><path d="M8 4l4 2 4-2 3 4-4 2v10H9V10L5 8z"/></svg>`,
    search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>`
  }
  return map[name] || map.laptop
}

export function demoBadge() {
  return `<span class="badge-demo">${t('demoData')}</span>`
}

export function productVisual(p, tall = false) {
  const bg = p.swatch || p.color || '#1f3a5f'
  const ac = p.accent || '#c9a227'
  return `<div class="${tall ? 'product-visual' : 'mini-visual'}" style="background:${bg}" title="${t('illustration')}">
    <div class="${tall ? 'laptop' : 'mini-laptop'}"><${tall ? 'div class="screen"' : 'i'} style="background:linear-gradient(145deg, ${ac}, ${bg})"></${tall ? 'div' : 'i'}></div>
  </div>`
}

export function money(n) {
  return formatMoney(n, loadPrefs().country)
}

export function header(active = 'home') {
  bootFromPath()
  const prefs = loadPrefs()
  const lang = prefs.lang
  const isDePath = location.pathname.includes('/de/') || location.pathname.endsWith('/de')
  const withLang = (href) => (lang === 'de' && !href.startsWith('de/') ? href + (href.includes('?') ? '&' : '?') + 'lang=de' : href)
  const links = [
    [isDePath ? 'de/' : 'index.html', 'home', t('navHome')],
    ['deals.html', 'deals', t('navDeals')],
    ['category.html?id=laptops', 'laptops', t('navLaptops')],
    ['compare.html', 'compare', t('navCompare')],
    ['assistant.html', 'ai', t('navAI')],
    ['guides.html', 'guides', t('navGuides')],
    ['stores.html', 'stores', t('navStores')]
  ]
  const countries = COUNTRIES.map((c) => {
    const label = c.code === 'DE' ? t('germany') : c.code === 'FR' ? t('france') : c.code === 'NL' ? t('netherlands') : c.code === 'ES' ? t('spain') : c.code === 'IT' ? t('italy') : t('uk')
    const st = c.code === 'DE' ? t('marketLive') : t('marketPending')
    return `<option value="${c.code}" ${prefs.country === c.code ? 'selected' : ''}>${label} · ${st}</option>`
  }).join('')
  return `
  <div class="topbar">
    <div class="wrap">
      <span>${t('demoBanner')}</span>
      <div class="markets">${t('liveMarket')}</div>
    </div>
  </div>
  <header class="site">
    <div class="wrap">
      <a class="logo" href="${isDePath ? 'de/' : 'index.html'}"><span class="logo-mark">DP</span> DealPilot</a>
      <button class="btn btn-ghost menu-btn" id="menu-btn" type="button">${t('menu')}</button>
      <nav class="nav" id="nav">
        ${links.map(([href, id, label]) => `<a class="${active === id ? 'active' : ''}" href="${withLang(href)}">${label}</a>`).join('')}
        <a class="btn btn-gold" href="${withLang('assistant.html')}">${t('askAI')}</a>
        <label class="sel"><span>${t('country')}</span>
          <select id="country-sel">${countries}</select>
        </label>
        <label class="sel"><span>${t('language')}</span>
          <select id="lang-sel">
            <option value="en" ${lang === 'en' ? 'selected' : ''}>${t('english')}</option>
            <option value="de" ${lang === 'de' ? 'selected' : ''}>${t('german')}</option>
          </select>
        </label>
      </nav>
    </div>
  </header>
  <div class="compare-bar ${prefs.compare.length ? 'show' : ''}" id="compare-bar">
    ${prefs.compare.length} ${t('compareCheck')}
    <a class="btn btn-navy" href="${withLang('compare.html')}">${t('seeFull')}</a>
  </div>`
}

export function bindChrome() {
  const c = document.getElementById('country-sel')
  const l = document.getElementById('lang-sel')
  const m = document.getElementById('menu-btn')
  if (c) c.addEventListener('change', () => { setCountry(c.value); location.reload() })
  if (l) l.addEventListener('change', () => {
    setLang(l.value)
    const url = new URL(location.href)
    const pathIsDe = location.pathname.includes('/de/') || location.pathname.endsWith('/de')
    if (pathIsDe === (l.value === 'de')) url.searchParams.delete('lang')
    else url.searchParams.set('lang', l.value)
    location.href = url.toString()
  })
  if (m) m.addEventListener('click', () => document.getElementById('nav')?.classList.toggle('open'))
}

export function footer() {
  const isDePath = location.pathname.includes('/de/') || location.pathname.endsWith('/de')
  return `
  <footer class="site">
    <div class="wrap">
      <div class="ft-grid">
        <div>
          <a class="logo" href="${isDePath ? 'de/' : langLink('index.html')}" style="color:#fff"><span class="logo-mark">DP</span> DealPilot</a>
          <p style="margin-top:12px;font-size:14px;max-width:36ch">${t('affiliateNote')}</p>
        </div>
        <div>
          <h4>${t('navHome')}</h4>
          <a href="${langLink('how.html')}">${t('howTitle')}</a>
          <a href="${langLink('deals.html')}">${t('navDeals')}</a>
          <a href="${langLink('compare.html')}">${t('navCompare')}</a>
          <a href="${langLink('assistant.html')}">${t('navAI')}</a>
        </div>
        <div>
          <h4>${t('navGuides')}</h4>
          <a href="${langLink('guides.html')}">${t('allGuides')}</a>
          <a href="${langLink('guide.html?id=laptops-under-800')}">Laptops €800</a>
          <a href="${langLink('guide.html?id=how-price-history')}">Price history</a>
        </div>
        <div>
          <h4>${t('disclosure')}</h4>
          <a href="${langLink('affiliate-disclosure.html')}">${t('disclosure')}</a>
          <a href="sitemap.xml">Sitemap</a>
        </div>
      </div>
      <div class="legal">
        <span>${t('footerLegal')}</span>
        <span>${t('updatedSeed')}: ${SEED_AT.slice(0, 10)}</span>
      </div>
    </div>
  </footer>
  <div class="toast" id="toast"></div>`
}

export function toast(msg) {
  const el = document.getElementById('toast')
  if (!el) return
  el.textContent = msg
  el.classList.add('show')
  setTimeout(() => el.classList.remove('show'), 3200)
}

export function mount(active) {
  const top = document.getElementById('chrome-top')
  const bot = document.getElementById('chrome-bottom')
  if (top) top.innerHTML = header(active)
  if (bot) bot.innerHTML = footer()
  bindChrome()
}

export function categoryCards() {
  const lang = loadPrefs().lang
  return CATEGORIES.map((c) => {
    const n = categoryCount(c.id)
    const name = lang === 'de' ? c.nameDe : c.name
    return `<a class="cat" href="category.html?id=${c.id}">
      <div class="cat-ico">${icon(c.icon)}</div>
      <div><b>${name}</b><small>${n} ${t('products')} · ${t('demoData')}</small></div>
    </a>`
  }).join('')
}

export function resultCard(p) {
  const lo = lowestOffer(p)
  const save = savingPct(p)
  const prefs = loadPrefs()
  const on = prefs.compare.includes(p.id)
  const retailer = lo ? getRetailer(lo.retailer_id) : null
  return `<article class="result">
    <a href="product.html?id=${p.id}">${productVisual(p)}</a>
    <div>
      <div class="mute">${p.brand} · ${p.category} ${demoBadge()}</div>
      <a href="product.html?id=${p.id}"><strong>${p.name}</strong></a>
      <div class="tagline">${p.tagline}</div>
      <div class="mute">${lo ? `${p.offers.length} ${t('offers')} · ${retailer?.name || ''} · ${stockLabel(lo.stock, t)} · ${t('delivery')}: ${lo.delivery}` : t('emptySearch')}</div>
      ${lo ? `<div class="fresh-row">${freshBadge(lo)}</div>` : ''}
      <div class="row-actions">
        <label class="chk"><input type="checkbox" data-compare="${p.id}" ${on ? 'checked' : ''}/> ${t('compareCheck')}</label>
        <a class="link" href="product.html?id=${p.id}">${t('viewDeal')}</a>
      </div>
    </div>
    <div class="result-price">
      ${save ? `<div class="save">-${save}% ${t('demoData')}</div>` : ''}
      <div class="price" style="font-size:26px">${lo ? offerMoney(lo) : '—'}</div>
      <div class="mute">${t('from')} ${retailer?.name || '—'}</div>
      <a class="btn btn-navy" href="product.html?id=${p.id}">${t('viewDeal')}</a>
    </div>
  </article>`
}

export function bindCompareChecks(root = document) {
  root.querySelectorAll('[data-compare]').forEach((el) => {
    el.addEventListener('change', () => {
      const list = toggleCompare(el.dataset.compare)
      if (!el.checked && !list.includes(el.dataset.compare)) el.checked = false
      if (el.checked && !list.includes(el.dataset.compare)) {
        el.checked = false
        toast('Max 4')
      }
      const bar = document.getElementById('compare-bar')
      if (bar) {
        bar.classList.toggle('show', list.length > 0)
        bar.innerHTML = `${list.length} ${t('compareCheck')} <a class="btn btn-navy" href="compare.html">${t('seeFull')}</a>`
      }
    })
  })
}

export function offerTable(product) {
  const rows = [...product.offers].sort((a, b) => a.total - b.total)
  const retailers = getRetailers()
  return `<div class="table-wrap"><table class="cmp offers">
    <tr>
      <th>${t('retailer')}</th><th>${t('price')}</th><th>${t('shipping')}</th><th>${t('total')}</th>
      <th>${t('delivery')}</th><th>${t('stock')}</th><th>${t('lastUpdated')}</th><th></th>
    </tr>
    ${rows.map((o) => {
      const r = getRetailer(o.retailer_id) || retailers.find((x) => x.id === o.retailer_id)
      const link = resolveAffiliateLink(o, r, retailers)
      return `<tr>
        <td><strong>${r?.name || o.retailer_id}</strong><div class="mute">${t('demoRetailer')} · ${t('commissionNone')}</div></td>
        <td>${amountMoney(o.price, o.original_currency || o.currency)}</td>
        <td>${o.shipping ? amountMoney(o.shipping, o.original_currency || o.currency) : t('freeShip')}</td>
        <td class="best">${offerMoney(o)}</td>
        <td>${o.delivery}</td>
        <td>${stockLabel(o.stock, t)}</td>
        <td>${freshBadge(o)}</td>
        <td>${link.ok
          ? `<a class="btn btn-navy" href="${link.url}" target="_blank" rel="nofollow sponsored noopener" data-aff="${o.retailer_id}" data-offer="${o.id}" data-pid="${product.id}" data-total="${o.total}">${t('viewDeal')}</a>`
          : `<span class="link-unavailable" title="${t('retailerLinkUnavailableText')}">${t('retailerLinkUnavailable')}</span>`}</td>
      </tr>`
    }).join('')}
  </table></div>`
}

export { formatMoney, lowestOffer, savingPct, getRetailer, CATEGORIES, COUNTRIES, SEED_AT, qs, freshnessState }
