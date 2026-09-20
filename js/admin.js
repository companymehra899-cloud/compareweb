import { savingPct } from './data.js'
import { loadDb, loadUsers } from './db.js'
import { mount } from './ui.js'
import { clickStats, loadClicks as loadAffiliateClicks } from './core/affiliate.js'
import { loadHistory } from './core/history.js'
import { exchangeRateProviderStatus } from './core/currency.js'
import { aiStatus } from './core/ai.js'
import { emailProviderStatus, mirrorAlerts, ALERT_STATUS } from './core/alerts.js'
import { providerReport } from './core/providers.js'
import { freshnessState } from './core/freshness.js'

mount('home')

let tab = 'products'
const TABS = [
  ['products', 'Products'],
  ['retailers', 'Retailers'],
  ['offers', 'Offers'],
  ['health', 'Data health'],
  ['alerts', 'Price alerts'],
  ['clicks', 'Affiliate clicks'],
  ['guides', 'Guides'],
  ['countries', 'Countries'],
  ['languages', 'Languages'],
  ['providers', 'Providers'],
  ['analytics', 'Analytics']
]

function stat(label, value, sub) {
  return `<div class="stat"><span>${label}</span><b>${value}</b><small>${sub || ''}</small></div>`
}

function dataHealth() {
  const db = loadDb()
  const eans = db.products.map((p) => p.ean).filter(Boolean)
  const dupEans = eans.filter((e, i) => eans.indexOf(e) !== i)
  const noEan = db.products.filter((p) => !p.ean)
  const noMpn = db.products.filter((p) => !p.mpn)
  const offers = db.products.flatMap((p) => p.offers)
  const noTs = offers.filter((o) => !o.timestamp)
  const noSource = offers.filter((o) => !o.source)
  const noCurrency = offers.filter((o) => !o.currency)
  const fresh = { fresh: 0, recent: 0, stale: 0, other: 0 }
  offers.forEach((o) => {
    const st = freshnessState(o.timestamp, o.availability || o.stock)
    if (st === 'fresh') fresh.fresh++
    else if (st === 'recently_updated') fresh.recent++
    else if (st === 'stale') fresh.stale++
    else fresh.other++
  })
  const checks = [
    ['Products missing EAN/GTIN', noEan.length, noEan.map((p) => p.id).join(', ')],
    ['Duplicate EAN/GTIN values', dupEans.length, [...new Set(dupEans)].join(', ')],
    ['Products missing MPN', noMpn.length, noMpn.length > 3 ? `${noMpn.length} rows` : noMpn.map((p) => p.id).join(', ')],
    ['Offers missing timestamp', noTs.length, ''],
    ['Offers missing source', noSource.length, ''],
    ['Offers missing currency', noCurrency.length, '']
  ]
  return { checks, fresh, offers: offers.length, products: db.products.length }
}

function renderStats() {
  const db = loadDb()
  const offers = db.products.reduce((n, p) => n + p.offers.length, 0)
  const cs = clickStats()
  const h = dataHealth()
  document.getElementById('stats').innerHTML = [
    stat('Products', db.products.length, `${h.offers} offers`),
    stat('Retailers', db.retailers.length, `${db.retailers.filter((r) => r.active).length} active`),
    stat('Offers', offers, `${h.fresh.stale} stale`),
    stat('Price points', loadHistory().length, loadHistory().length ? 'recorded events' : 'none collected'),
    stat('Alerts', mirrorAlerts().filter((a) => a.status !== ALERT_STATUS.UNSUBSCRIBED).length, 'guest, local mirror'),
    stat('Clicks', cs.clicks, cs.hasConversionData ? 'with conversions' : 'no conversion data'),
    stat('Users', loadUsers().length, 'no auth, by design'),
    stat('Countries', db.countries.length, `${db.countries.filter((c) => c.country_status === 'active' || c.country_status === 'beta').length} served`)
  ].join('')
}

function renderTabs() {
  document.getElementById('tabs').innerHTML = TABS.map(([id, label]) =>
    `<button class="tab ${tab === id ? 'on' : ''}" data-tab="${id}">${label}</button>`
  ).join('')
}

function providersPanel() {
  const report = providerReport()
  const rows = report.flatMap((r) => r.providers.length
    ? r.providers.map((p) => `<tr><td>${r.kind}</td><td><code>${p.id}</code></td><td>${p.label}</td><td><span class="badge-status status-pending">${p.status}</span></td></tr>`)
    : [`<tr><td>${r.kind}</td><td colspan="3" class="mute">no provider registered</td></tr>`])
  const ex = exchangeRateProviderStatus()
  const ai = aiStatus()
  const em = emailProviderStatus()
  return `
    <div class="table-wrap"><table class="admin-table">
      <tr><th>kind</th><th>provider</th><th>label</th><th>status</th></tr>
      ${rows.join('')}
    </table></div>
    <h3 class="h3">Integration status</h3>
    <div class="table-wrap"><table class="admin-table">
      <tr><th>subsystem</th><th>provider</th><th>status</th></tr>
      <tr><td>Exchange rates</td><td>${ex.id}</td><td><span class="badge-status status-pending">${ex.status}</span></td></tr>
      <tr><td>AI assistant</td><td>${ai.backendConfigured ? 'project backend' : 'local catalogue matcher'}</td><td><span class="badge-status ${ai.backendConfigured ? 'status-demo' : 'status-pending'}">${ai.mode}</span></td></tr>
      <tr><td>Email (alerts)</td><td>${em.provider || 'none'}</td><td><span class="badge-status ${em.configured ? 'status-demo' : 'status-pending'}">${em.configured ? 'configured' : 'unconfigured'}</span></td></tr>
    </table></div>
    <p class="note">Offline fallback rates are labelled in the UI as converted estimates. Live providers must be registered before production.</p>`
}

function renderPanel() {
  const db = loadDb()
  if (tab === 'products') {
    document.getElementById('panel').innerHTML = `<div class="table-wrap"><table class="admin-table">
      <tr><th>id</th><th>name</th><th>brand</th><th>category</th><th>EAN/GTIN</th><th>MPN</th><th>list</th><th>demo</th></tr>
      ${db.products.map((p) => `<tr>
        <td><code>${p.id}</code></td><td>${p.name}</td><td>${p.brand}</td><td>${p.category}</td>
        <td>${p.ean}</td><td>${p.mpn || '<span class="mute">missing</span>'}</td><td>${p.list}</td><td>${p.demo ? 'yes' : 'no'}</td>
      </tr>`).join('')}
    </table></div>
    <p class="note">Editing is done by importing a new seed file. Inline editing requires a backend.</p>`
  } else if (tab === 'retailers') {
    document.getElementById('panel').innerHTML = `<div class="table-wrap"><table class="admin-table">
      <tr><th>id</th><th>name</th><th>country</th><th>domain</th><th>status</th><th>verification</th><th>network</th><th>affiliate_url</th><th>active</th></tr>
      ${db.retailers.map((r) => `<tr>
        <td><code>${r.id}</code></td><td>${r.name}</td><td>${r.country}</td>
        <td>${r.domain || '<span class="mute">—</span>'}</td>
        <td><span class="badge-status ${r.status === 'demo' ? 'status-demo' : 'status-pending'}">${r.status}</span></td>
        <td>${r.affiliate_url ? '<span class="badge-status status-demo">verified</span>' : '<span class="badge-status status-pending">unverified</span>'}</td>
        <td>${r.affiliate_network || '<span class="mute">none</span>'}</td>
        <td>${r.affiliate_url || '<span class="mute">not configured</span>'}</td><td>${r.active}</td>
      </tr>`).join('')}
    </table></div>
    <p class="note">A link is only shown to visitors when its host is on the approved domain list and the retailer is active.</p>`
  } else if (tab === 'offers') {
    const rows = db.products.flatMap((p) => p.offers.map((o) => ({ p, o })))
    document.getElementById('panel').innerHTML = `<div class="table-wrap"><table class="admin-table">
      <tr><th>offer id</th><th>product</th><th>retailer</th><th>price</th><th>shipping</th><th>total</th><th>currency</th><th>source</th><th>timestamp</th><th>availability</th><th>commission</th></tr>
      ${rows.map(({ p, o }) => {
        const st = freshnessState(o.timestamp, o.availability || o.stock)
        return `<tr>
        <td><code>${o.id}</code></td><td>${p.name}</td><td>${o.retailer_id}</td>
        <td>${o.price}</td><td>${o.shipping}</td><td>${o.total}</td><td>${o.currency}</td><td>${o.source}</td>
        <td class="mute"><span class="fresh ${st === 'fresh' ? 'fresh-fresh' : st === 'stale' ? 'fresh-stale' : 'fresh-recent'}">${st}</span> ${o.timestamp.slice(0, 10)}</td>
        <td>${o.availability || o.stock}</td><td>${o.commission_status}</td>
      </tr>`}).join('')}
    </table></div>`
  } else if (tab === 'health') {
    const h = dataHealth()
    document.getElementById('panel').innerHTML = `
      <div class="stat-grid">
        ${stat('Products', h.products, '')}
        ${stat('Offers', h.offers, '')}
        ${stat('Fresh offers', h.fresh.fresh, 'under 6h')}
        ${stat('Stale offers', h.fresh.stale, 'over 14 days')}
      </div>
      <div class="table-wrap"><table class="admin-table">
        <tr><th>check</th><th>count</th><th>details</th></tr>
        ${h.checks.map(([label, n, detail]) => `<tr>
          <td>${label}</td>
          <td><span class="badge-status ${n ? 'status-pending' : 'status-demo'}">${n}</span></td>
          <td class="mute">${detail || ''}</td>
        </tr>`).join('')}
      </table></div>
      <p class="note">Normalization only merges on a hard identifier (EAN/GTIN or brand + MPN). Weaker matches are flagged for review and never auto-merged.</p>`
  } else if (tab === 'alerts') {
    const alerts = mirrorAlerts()
    document.getElementById('panel').innerHTML = alerts.length ? `<div class="table-wrap"><table class="admin-table">
      <tr><th>product</th><th>target</th><th>email</th><th>status</th><th>created</th><th>email provider</th></tr>
      ${alerts.map((a) => `<tr><td>${a.product_id}</td><td>${a.target_price} ${a.currency}</td><td>${a.email}</td><td>${a.status}</td><td class="mute">${a.created_at.slice(0, 10)}</td><td>${emailProviderStatus().configured ? 'configured' : 'not configured'}</td></tr>`).join('')}
    </table></div>` : `<div class="empty-state"><h3>No alerts</h3><p>Guest alerts are mirrored per browser until a backend is connected.</p></div>`
  } else if (tab === 'clicks') {
    const cs = clickStats()
    const clicks = loadAffiliateClicks()
    document.getElementById('panel').innerHTML = `
      <div class="stat-grid">
        ${stat('Clicks', cs.clicks, '')}
        ${stat('Conversions', cs.hasConversionData ? cs.conversions : '—', 'no network data')}
        ${stat('Commission', cs.hasConversionData ? cs.commission : '—', 'not reported')}
        ${stat('Revenue', cs.hasConversionData ? cs.revenue : '—', 'not reported')}
      </div>
      ${clicks.length ? `<div class="table-wrap"><table class="admin-table">
        <tr><th>click id</th><th>product</th><th>retailer</th><th>country</th><th>at</th><th>conversion</th></tr>
        ${clicks.map((c) => `<tr><td><code>${c.click_id}</code></td><td>${c.product_id}</td><td>${c.retailer_id}</td><td>${c.country || '—'}</td><td class="mute">${c.timestamp.slice(0, 19)}</td><td class="mute">not reported</td></tr>`).join('')}
      </table></div>` : `<div class="empty-state"><h3>No clicks</h3><p>Click an approved “View Deal” link to create a local event.</p></div>`}`
  } else if (tab === 'guides') {
    document.getElementById('panel').innerHTML = `<div class="table-wrap"><table class="admin-table">
      <tr><th>id</th><th>title</th><th>kicker</th><th>updated</th></tr>
      ${db.guides.map((g) => `<tr><td><code>${g.id}</code></td><td>${g.title}</td><td>${g.kicker}</td><td>${g.updated}</td></tr>`).join('')}
    </table></div>`
  } else if (tab === 'countries') {
    document.getElementById('panel').innerHTML = `<div class="table-wrap"><table class="admin-table">
      <tr><th>code</th><th>name</th><th>currency</th><th>locale</th><th>country_status</th><th>data_status</th></tr>
      ${db.countries.map((c) => `<tr><td><code>${c.code}</code></td><td>${c.name}</td><td>${c.currency}</td><td>${c.locale}</td>
        <td><span class="badge-status ${c.country_status === 'beta' || c.country_status === 'active' ? 'status-demo' : 'status-pending'}">${c.country_status}</span></td>
        <td class="mute">${c.data_status}</td></tr>`).join('')}
    </table></div>
    <p class="note">country_status is independent of language. Translation does not imply market activation, and market activation does not imply translated content.</p>`
  } else if (tab === 'languages') {
    document.getElementById('panel').innerHTML = `<div class="table-wrap"><table class="admin-table">
      <tr><th>code</th><th>name</th><th>status</th></tr>
      ${db.languages.map((l) => `<tr><td><code>${l.code}</code></td><td>${l.name}</td><td>${l.status}</td></tr>`).join('')}
    </table></div>
    <p class="note">Product pages are only translated when reviewed editorial text exists. Machine-translated product copy is not published.</p>`
  } else if (tab === 'providers') {
    document.getElementById('panel').innerHTML = providersPanel()
  } else if (tab === 'analytics') {
    const products = db.products
    const withSave = products.map((p) => ({ p, s: savingPct(p) })).filter((x) => x.s > 0)
    const avgSave = withSave.length ? Math.round(withSave.reduce((n, x) => n + x.s, 0) / withSave.length) : 0
    const byCat = {}
    products.forEach((p) => { byCat[p.category] = (byCat[p.category] || 0) + 1 })
    const hist = loadHistory()
    document.getElementById('panel').innerHTML = `
      <div class="stat-grid">
        ${stat('Avg sample discount', avgSave + '%', 'demo rows only')}
        ${stat('Categories', Object.keys(byCat).length, 'with ≥1 SKU')}
        ${stat('Price history points', hist.length, hist.length ? 'from recorded events' : 'none yet')}
        ${stat('Live feeds', 0, 'none connected')}
      </div>
      <div class="table-wrap"><table class="admin-table">
        <tr><th>category</th><th>products</th></tr>
        ${Object.entries(byCat).map(([c, n]) => `<tr><td>${c}</td><td>${n}</td></tr>`).join('')}
      </table></div>
      <p class="note">Price history is populated only from observed price events. Demo seed rows never write history.</p>`
  }
}

document.getElementById('tabs').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tab]')
  if (!b) return
  tab = b.dataset.tab
  renderTabs()
  renderPanel()
})

renderStats()
renderTabs()
renderPanel()
