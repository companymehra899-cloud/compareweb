import { getRetailers } from './db.js'
import { COUNTRIES } from './data.js'
import { loadPrefs } from './state.js'
import { mount, t } from './ui.js'

mount('stores')
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t) })
const lang = loadPrefs().lang

document.getElementById('countries').innerHTML = COUNTRIES.map((c) => {
  const label = t(c.code === 'DE' ? 'germany' : c.code === 'FR' ? 'france' : c.code === 'NL' ? 'netherlands' : c.code === 'ES' ? 'spain' : c.code === 'IT' ? 'italy' : 'uk')
  const stores = getRetailers().filter((r) => r.country === c.code)
  return `<article class="country-card" id="${c.code}">
    <h3>${label} <span class="badge-status ${c.code === 'DE' ? 'status-demo' : 'status-pending'}">${c.code === 'DE' ? t('marketLive') : t('marketPending')}</span></h3>
    <div class="pills">${stores.map((s) => `<span class="pill">${s.name}</span>`).join('') || t('partnership')}</div>
    <p class="mute" style="margin-top:10px">${c.code === 'DE' ? t('demoBanner') : t('emptyCountry')}</p>
  </article>`
}).join('')

document.getElementById('merchants').innerHTML = `<table class="cmp">
  <tr><th>id</th><th>name</th><th>country</th><th>status</th><th>affiliate_url</th><th>active</th><th>last_updated</th></tr>
  ${getRetailers().map((r) => `<tr>
    <td><code>${r.id}</code></td>
    <td>${r.name}</td>
    <td>${r.country}</td>
    <td><span class="badge-status ${r.status === 'demo' ? 'status-demo' : 'status-pending'}">${r.status === 'demo' ? t('demoRetailer') : t('partnership')}</span></td>
    <td class="mute">${r.affiliate_url || t('commissionNone')}</td>
    <td>${r.active ? 'yes' : 'no'}</td>
    <td class="mute">${t('updatedSeed')}</td>
  </tr>`).join('')}
</table>`
