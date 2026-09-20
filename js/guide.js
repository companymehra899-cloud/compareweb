import { getGuides, getProducts } from './db.js'
import { lowestOffer, savingPct } from './data.js'
import { loadPrefs } from './state.js'
import { mount, t, money, resultCard } from './ui.js'
import { setMeta, injectBreadcrumbLd } from './seo.js'
import { qs } from './ui.js'

mount('guides')
const lang = loadPrefs().lang

const picks = {
  'laptops-under-800': ['thinkpad-e14', 'vivobook-16', 'swift-3', 'ideapad-slim5'],
  'how-price-history': ['sony-xm5', 'macbook-air-m3', 'lg-c4-55'],
  'headphones-travel': ['sony-xm5'],
  'smartphones-under-300': ['galaxy-s24']
}

const id = qs('id') || 'laptops-under-800'
const g = getGuides().find((x) => x.id === id) || getGuides()[0]
const products = getProducts()
const sel = (picks[g.id] || []).map((pid) => products.find((p) => p.id === pid)).filter(Boolean)
const title = lang === 'de' && g.titleDe ? g.titleDe : g.title

setMeta({ title: `${title} — DealPilot Europe`, description: g.excerpt, canonical: `/guide.html?id=${g.id}`, lang })
injectBreadcrumbLd([{ name: 'Home', url: '/index.html' }, { name: t('navGuides'), url: '/guides.html' }, { name: title, url: `/guide.html?id=${g.id}` }])

const cmp = sel.map((p) => {
  const lo = lowestOffer(p)
  return `<tr>
    <td><a href="product.html?id=${p.id}"><strong>${p.name}</strong></a><div class="mute">${p.brand} · ${t('demoData')}</div></td>
    <td class="best">${lo ? money(lo.total) : '—'}</td>
    <td>${p.specs.RAM || p.specs.Type || '—'}</td>
    <td>${p.specs.Display || '—'}</td>
    <td>${p.specs.Battery || '—'}</td>
    <td>${p.specs.Weight || '—'}</td>
  </tr>`
}).join('')

const pros = (g.id === 'laptops-under-800')
  ? { pros: ['16 GB RAM rows exist under €800 in the demo set', 'Several 14" options are light enough for commute use'], cons: ['Battery hours are manufacturer claims, not measured', 'No independent review scores in this catalogue'] }
  : { pros: ['Method is explicit about what is and is not measured', 'Empty states are shown instead of invented numbers'], cons: ['No live feed yet, so no real history to display', 'Small demo catalogue'] }

document.getElementById('article').innerHTML = `
  <nav class="crumb" aria-label="Breadcrumb"><a href="index.html">${t('navHome')}</a> / <a href="guides.html">${t('navGuides')}</a> / ${title}</nav>
  <div class="kicker">${g.kicker} · ${g.minutes} min · ${t('lastUpdated')}: ${g.updated}</div>
  <h1 style="font-family:var(--serif);font-size:clamp(28px,3vw,42px);color:var(--navy);margin:8px 0 14px">${title}</h1>
  <p class="tagline" style="font-size:18px;margin-bottom:22px">${g.excerpt}</p>

  <div class="card" style="margin-bottom:22px">
    <h2 style="font-family:var(--serif);color:var(--navy);margin-bottom:10px">Introduction</h2>
    <p>${t('demoBanner')} This guide explains how DealPilot intends to compare products once real retailer feeds are connected. It does not claim to have tested any device.</p>
    <h2 style="font-family:var(--serif);color:var(--navy);margin:18px 0 10px">${t('howTitle')}</h2>
    <ul class="check">${(g.criteria || []).map((c) => `<li>${c}</li>`).join('')}</ul>
  </div>

  ${sel.length ? `<div class="card" style="margin-bottom:22px">
    <h2 style="font-family:var(--serif);color:var(--navy);margin-bottom:10px">${t('compareSection')} ${t('demoData')}</h2>
    <div class="table-wrap"><table class="cmp">
      <tr><th>${t('products')}</th><th>${t('lowestTotal')}</th><th>${t('ram')}</th><th>${t('display')}</th><th>${t('battery')}</th><th>${t('weight')}</th></tr>
      ${cmp}
    </table></div>
    <p class="note">${t('demoBanner')}</p>
  </div>` : ''}

  <div class="card" style="margin-bottom:22px">
    <h2 style="font-family:var(--serif);color:var(--navy);margin-bottom:10px">Pros &amp; cons</h2>
    <div class="layout" style="padding:0">
      <div><div class="mute">Pros</div><ul class="check">${pros.pros.map((x) => `<li>${x}</li>`).join('')}</ul></div>
      <div><div class="mute">Cons</div><ul class="check">${pros.cons.map((x) => `<li>${x}</li>`).join('')}</ul></div>
    </div>
  </div>

  <div class="card" style="margin-bottom:22px">
    <h2 style="font-family:var(--serif);color:var(--navy);margin-bottom:10px">FAQ</h2>
    ${(g.faq || []).map((f) => `<details style="border-bottom:1px solid var(--line);padding:10px 0"><summary style="cursor:pointer;font-weight:600;color:var(--navy)">${f.q}</summary><p style="margin-top:8px;color:var(--mute)">${f.a}</p></details>`).join('')}
  </div>

  ${sel.length ? `<h2 style="font-family:var(--serif);color:var(--navy);margin-bottom:12px">${t('products')}</h2>${sel.map(resultCard).join('')}` : ''}
`
