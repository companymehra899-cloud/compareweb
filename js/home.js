import { COUNTRIES, lowestOffer, savingPct, getRetailer, categoryCount } from './data.js'
import { loadPrefs } from './state.js'
import { matchProducts } from './ai.js'
import { mount, t, money, icon, categoryCards, offerTable } from './ui.js'
import { getProducts, getRetailers, getGuides } from './db.js'

mount('home')
const prefs = loadPrefs()

document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t) })
document.querySelectorAll('[data-t-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.tPlaceholder) })

document.getElementById('country-strip').innerHTML = COUNTRIES.map((c) => {
  const live = c.code === 'DE'
  const label = t(c.code === 'DE' ? 'germany' : c.code === 'FR' ? 'france' : c.code === 'NL' ? 'netherlands' : c.code === 'ES' ? 'spain' : c.code === 'IT' ? 'italy' : 'uk')
  return `<a class="cs ${live ? 'live' : ''}" href="stores.html#${c.code}">${label} <small>${live ? t('marketLive') : t('marketPending')}</small></a>`
}).join('')

document.getElementById('cats').innerHTML = categoryCards()

const products = getProducts()
const retailers = getRetailers()
const ranked = products
  .map((p) => ({ p, save: savingPct(p) }))
  .filter((x) => savingPct(x.p) > 0)
  .sort((a, b) => b.save - a.save)
  .slice(0, 4)

document.getElementById('deals').innerHTML = ranked.map(({ p, save }, i) => {
  const lo = lowestOffer(p)
  return `<a class="deal ${i === 0 ? 'featured' : ''}" href="product.html?id=${p.id}">
    <div class="save">-${save}% ${t('demoData')}</div>
    <strong>${p.name}</strong>
    <div class="tagline">${p.tagline}</div>
    <div class="price">${money(lo.total)} <s>${money(p.list)}</s></div>
    <div class="mute">${t('from')} ${getRetailer(lo.retailer_id)?.name} · ${lo.delivery} · ${t('updatedSeed')}</div>
    <span class="btn ${i === 0 ? 'btn-gold' : 'btn-navy'}">${t('viewDeal')}</span>
  </a>`
}).join('')

const cmpIds = ['thinkpad-e14', 'swift-3', 'vivobook-16']
const cmp = cmpIds.map((id) => products.find((p) => p.id === id)).filter(Boolean)
document.getElementById('home-cmp').innerHTML = `<table class="cmp">
  <tr><th></th>${cmp.map((p) => `<th><a href="product.html?id=${p.id}">${p.name}</a><div class="mute">${t('demoData')}</div></th>`).join('')}</tr>
  <tr><th>${t('lowestTotal')}</th>${cmp.map((p) => `<td class="best">${money(lowestOffer(p).total)}</td>`).join('')}</tr>
  <tr><th>${t('ram')}</th>${cmp.map((p) => `<td>${p.specs.RAM}</td>`).join('')}</tr>
  <tr><th>${t('display')}</th>${cmp.map((p) => `<td>${p.specs.Display}</td>`).join('')}</tr>
  <tr><th>${t('weight')}</th>${cmp.map((p) => `<td>${p.specs.Weight}</td>`).join('')}</tr>
  <tr><th>${t('retailers')}</th>${cmp.map((p) => `<td>${p.offers.length} ${t('offers')}</td>`).join('')}</tr>
</table>`

document.getElementById('stores').innerHTML = COUNTRIES.map((c) => {
  const stores = retailers.filter((r) => r.country === c.code)
  const label = t(c.code === 'DE' ? 'germany' : c.code === 'FR' ? 'france' : c.code === 'NL' ? 'netherlands' : c.code === 'ES' ? 'spain' : c.code === 'IT' ? 'italy' : 'uk')
  return `<article class="country-card" id="${c.code}">
    <h3>${label} <span class="badge-status ${c.code === 'DE' ? 'status-demo' : 'status-pending'}">${c.code === 'DE' ? t('marketLive') : t('marketPending')}</span></h3>
    <div class="pills">${stores.map((s) => `<span class="pill">${s.name}</span>`).join('') || `<span class="pill">${t('partnership')}</span>`}</div>
  </article>`
}).join('')

document.getElementById('how-grid').innerHTML = ['how1', 'how2', 'how3', 'how4'].map((k, i) => `
  <div class="trust-step">
    <div class="trust-num">${i + 1}</div>
    <b>${t(k)}</b>
    <p>${t('howNote')}</p>
  </div>`).join('')

document.getElementById('guides').innerHTML = getGuides().slice(0, 4).map((g) => `
  <a class="guide" href="guide.html?id=${g.id}">
    <div class="kicker">${g.kicker} · ${g.minutes} min</div>
    <h3>${prefs.lang === 'de' && g.titleDe ? g.titleDe : g.title}</h3>
    <p>${g.excerpt}</p>
    <div class="mute">${t('lastUpdated')}: ${g.updated}</div>
  </a>`).join('')

const msgs = document.getElementById('home-msgs')
const side = document.getElementById('ai-side')
msgs.innerHTML = `<div class="bubble bot">${t('aiTry')}</div>`

function paint(m, query) {
  msgs.insertAdjacentHTML('beforeend', `<div class="bubble user">${query}</div>`)
  msgs.insertAdjacentHTML('beforeend', `<div class="bubble bot">${m.html}</div>`)
  msgs.scrollTop = msgs.scrollHeight
  if (!m.best) {
    side.innerHTML = `<div class="mute">${t('emptySearch')}</div>`
    return
  }
  side.innerHTML = `
    <div class="mute">${t('bestMatch')}</div>
    <h3>${m.best.name}</h3>
    <p class="tagline">${m.text}</p>
    <ul class="check">${m.reasons.slice(0, 4).map((r) => `<li>${r}</li>`).join('')}</ul>
    <a class="btn btn-navy" href="assistant.html?q=${encodeURIComponent(query)}">${t('bestMatches')}</a>`
}

document.getElementById('home-ai').addEventListener('submit', (e) => {
  e.preventDefault()
  const input = document.getElementById('home-ai-q')
  const q = input.value.trim()
  if (!q) return
  paint(matchProducts(q, prefs.country), q)
  input.value = ''
})
document.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => {
  document.getElementById('home-ai-q').value = c.dataset.q
  document.getElementById('home-ai').requestSubmit()
}))

const suggest = document.getElementById('suggest')
const q = document.getElementById('q')
const hints = [t('ex1'), t('ex2'), t('ex3'), 'Sony WH-1000XM5', 'LG OLED C4']
q.addEventListener('focus', () => {
  suggest.innerHTML = hints.map((h) => `<a href="search.html?q=${encodeURIComponent(h)}">${icon('search')} ${h}</a>`).join('')
  suggest.classList.add('open')
})
q.addEventListener('blur', () => setTimeout(() => suggest.classList.remove('open'), 160))
