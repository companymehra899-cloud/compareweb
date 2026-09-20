export function setMeta({ title, description, canonical, lang = 'en' }) {
  document.documentElement.lang = lang
  if (title) document.title = title
  const desc = document.querySelector('meta[name="description"]') || document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'description' }))
  if (description) desc.setAttribute('content', description)
  if (canonical) {
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical
  }
}

export function injectBreadcrumbLd(items) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: location.origin + it.url
    }))
  }
  const el = document.createElement('script')
  el.type = 'application/ld+json'
  el.textContent = JSON.stringify(ld)
  document.head.appendChild(el)
}

export function injectProductLd(product) {
  if (!product) return
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: { '@type': 'Brand', name: product.brand },
    gtin: product.ean,
    sku: product.sku,
    description: product.tagline,
    offers: product.offers.map((o) => ({
      '@type': 'Offer',
      price: o.price,
      priceCurrency: o.currency,
      availability: o.stock === 'in_stock' ? 'https://schema.org/InStock' : 'https://schema.org/LimitedAvailability'
    }))
  }
  const el = document.createElement('script')
  el.type = 'application/ld+json'
  el.textContent = JSON.stringify(ld)
  document.head.appendChild(el)
}
