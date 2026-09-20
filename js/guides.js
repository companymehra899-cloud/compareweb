import { getGuides } from './db.js'
import { loadPrefs } from './state.js'
import { mount, t } from './ui.js'
import { setMeta } from './seo.js'

mount('guides')
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t) })
setMeta({ title: 'Buying guides — DealPilot Europe', description: 'Buying guides with criteria, comparisons and FAQ. Demo catalogue, no fabricated tests.', canonical: '/guides.html', lang: loadPrefs().lang })

const lang = loadPrefs().lang
document.getElementById('guides').innerHTML = getGuides().map((g) => `
  <a class="guide" href="guide.html?id=${g.id}">
    <div class="kicker">${g.kicker} · ${g.minutes} min</div>
    <h3>${lang === 'de' && g.titleDe ? g.titleDe : g.title}</h3>
    <p>${g.excerpt}</p>
    <div class="mute">${t('lastUpdated')}: ${g.updated}</div>
  </a>`).join('')
