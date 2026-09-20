const KEY = 'dealpilot.prefs.v2'

const defaults = {
  country: 'DE',
  lang: 'en',
  compare: [],
  userEmail: ''
}

export function loadPrefs() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { ...defaults }
  }
}

export function savePrefs(p) {
  localStorage.setItem(KEY, JSON.stringify(p))
}

export function getState() {
  return loadPrefs()
}

export function setCountry(code) {
  const p = loadPrefs()
  p.country = code
  savePrefs(p)
  return p
}

export function setLang(lang) {
  const p = loadPrefs()
  p.lang = lang
  savePrefs(p)
  document.documentElement.lang = lang === 'de' ? 'de' : 'en'
  return p
}

export function setEmail(email) {
  const p = loadPrefs()
  p.userEmail = email
  savePrefs(p)
  return p
}

export function toggleCompare(id) {
  const p = loadPrefs()
  const i = p.compare.indexOf(id)
  if (i >= 0) p.compare.splice(i, 1)
  else if (p.compare.length < 4) p.compare.push(id)
  savePrefs(p)
  window.dispatchEvent(new Event('dealpilot-compare'))
  return p.compare
}

export function qs(name) {
  return new URLSearchParams(location.search).get(name)
}

export function bootFromPath() {
  const p = loadPrefs()
  if (location.pathname.includes('/de/') || location.pathname.endsWith('/de')) p.lang = 'de'
  const qLang = qs('lang')
  const qC = qs('country')
  if (qLang === 'de' || qLang === 'en') p.lang = qLang
  if (qC) p.country = qC
  savePrefs(p)
  document.documentElement.lang = p.lang === 'de' ? 'de' : 'en'
  if (!document.querySelector('base')) {
    const base = document.createElement('base')
    base.href = '/'
    document.head.prepend(base)
  }
  injectAlternates()
  return p
}

function injectAlternates() {
  if (document.getElementById('dp-alt-marker')) return
  const marker = document.createElement('meta')
  marker.id = 'dp-alt-marker'
  marker.name = 'dp-alternates'
  document.head.appendChild(marker)

  const origin = location.origin
  const path = location.pathname
  const m = path.match(/^\/de(\/.*)?$/)
  const enPath = m ? (m[1] || '/') : path
  const dePath = m ? path : (path === '/' ? '/de/' : '/de' + path)
  const add = (rel, href, hreflang) => {
    const link = document.createElement('link')
    link.rel = rel
    link.href = href
    if (hreflang) link.hreflang = hreflang
    document.head.appendChild(link)
  }
  add('alternate', origin + enPath, 'en')
  add('alternate', origin + dePath, 'de')
  add('alternate', origin + enPath, 'x-default')
  if (!document.querySelector('link[rel="canonical"]')) add('canonical', origin + path)
}
