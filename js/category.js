import { byCategory, CATEGORIES } from './data.js'
import { getProducts } from './db.js'
import { loadPrefs } from './state.js'
import { mount, t, resultCard, bindCompareChecks, qs } from './ui.js'
import { injectBreadcrumbLd } from './seo.js'

mount('laptops')
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t) })

const lang = loadPrefs().lang
const id = qs('id') || document.body.dataset.category || 'laptops'
const cat = CATEGORIES.find((c) => c.id === id)
const name = cat ? (lang === 'de' ? cat.nameDe : cat.name) : id

document.getElementById('crumb').textContent = name
document.getElementById('title').textContent = name
document.title = `${name} — DealPilot Europe`
injectBreadcrumbLd([
  { name: 'Home', url: '/index.html' },
  { name, url: `/category.html?id=${id}` }
])

const items = getProducts().filter((p) => p.category === id)
document.getElementById('lead').textContent = items.length
  ? `${items.length} ${t('products')} · ${t('demoData')} · ${t('demoBanner')}`
  : t('emptyCountry')

document.getElementById('results').innerHTML = items.length
  ? items.map(resultCard).join('')
  : `<div class="empty-state">
      <h3>${t('emptyCountry')}</h3>
      <p>${t('catsLead')}</p>
      <a class="btn btn-navy" style="margin-top:14px" href="category.html?id=laptops">${t('browseLaptops')}</a>
    </div>`
bindCompareChecks()
