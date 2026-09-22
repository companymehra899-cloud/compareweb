const KEY = 'dealpilot.prefs.v2'

const defaults = {
  country: 'DE',
  lang: 'en',
  compare: []
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
  const rawPath = location.pathname
  const path = rawPath === '/index.html' ? '/' : rawPath
  const params = new URLSearchParams(location.search)
  const keep = new URLSearchParams()
  ;['id', 'q', 'category', 'ids'].forEach((k) => {
    const v = params.get(k)
    if (v) keep.set(k, v)
  })
  const query = keep.toString() ? '?' + keep.toString() : ''

  const add = (rel, href, hreflang) => {
    const link = document.createElement('link')
    link.rel = rel
    link.href = href
    if (hreflang) link.hreflang = hreflang
    document.head.appendChild(link)
  }

  const deCategory = { '/de/laptops/': 'laptops', '/de/smartphones/': 'smartphones', '/de/headphones/': 'headphones' }
  const enCategory = { laptops: '/de/laptops/', smartphones: '/de/smartphones/', headphones: '/de/headphones/' }

  let enUrl
  let deUrl = null

  if (path === '/' || path === '/de/') {
    enUrl = origin + '/' + query
    deUrl = origin + '/de/'
  } else if (deCategory[path]) {
    enUrl = `${origin}/category.html?id=${deCategory[path]}`
    deUrl = origin + path
  } else if (path === '/category.html') {
    const cat = keep.get('category')
    enUrl = origin + '/category.html' + query
    deUrl = cat && enCategory[cat] ? origin + enCategory[cat] : null
  } else {
    enUrl = origin + path + query
  }

  add('alternate', enUrl, 'en')
  if (deUrl) add('alternate', deUrl, 'de')
  add('alternate', enUrl, 'x-default')
  if (!document.querySelector('link[rel="canonical"]')) add('canonical', origin + path + query)
}
