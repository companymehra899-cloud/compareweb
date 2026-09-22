const SHAPE_BY_CATEGORY = {
  laptops: 'laptop',
  smartphones: 'phone',
  headphones: 'headphones',
  tvs: 'tv',
  smartwatches: 'watch'
}

function clamp(n) {
  return Math.max(0, Math.min(255, Math.round(n)))
}

function shade(hex, amount) {
  const clean = (hex || '#1f3a5f').replace('#', '')
  if (clean.length !== 6) return hex || '#1f3a5f'
  const num = parseInt(clean, 16)
  const r = clamp(((num >> 16) & 255) + 255 * amount)
  const g = clamp(((num >> 8) & 255) + 255 * amount)
  const b = clamp((num & 255) + 255 * amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function shapeMarkup(shape) {
  switch (shape) {
    case 'phone':
      return `<rect x="252" y="66" width="136" height="284" rx="24" fill="#0f1115"/>
        <rect x="262" y="78" width="116" height="260" rx="16" fill="url(#screen)"/>
        <rect x="300" y="84" width="40" height="7" rx="3.5" fill="#0f1115" opacity="0.7"/>`
    case 'headphones':
      return `<path d="M198 250v-38a122 122 0 0 1 244 0v38" fill="none" stroke="#0f1115" stroke-width="24" stroke-linecap="round"/>
        <rect x="172" y="238" width="54" height="94" rx="26" fill="#0f1115"/>
        <rect x="414" y="238" width="54" height="94" rx="26" fill="#0f1115"/>
        <rect x="185" y="251" width="28" height="68" rx="14" fill="url(#screen)"/>
        <rect x="427" y="251" width="28" height="68" rx="14" fill="url(#screen)"/>`
    case 'tv':
      return `<rect x="126" y="96" width="388" height="224" rx="14" fill="#0f1115"/>
        <rect x="140" y="110" width="360" height="196" rx="7" fill="url(#screen)"/>
        <rect x="300" y="320" width="40" height="28" fill="#141821"/>
        <rect x="248" y="348" width="144" height="13" rx="6.5" fill="#141821"/>`
    case 'watch':
      return `<rect x="292" y="52" width="56" height="72" rx="18" fill="#141821"/>
        <rect x="292" y="296" width="56" height="72" rx="18" fill="#141821"/>
        <rect x="248" y="108" width="144" height="204" rx="36" fill="#0f1115"/>
        <rect x="262" y="122" width="116" height="176" rx="26" fill="url(#screen)"/>
        <circle cx="320" cy="210" r="26" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.45"/>`
    case 'laptop':
      return `<rect x="148" y="108" width="344" height="202" rx="14" fill="#0f1115"/>
        <rect x="162" y="122" width="316" height="174" rx="7" fill="url(#screen)"/>
        <rect x="116" y="312" width="408" height="18" rx="9" fill="#141821"/>`
    default:
      return `<rect x="196" y="112" width="248" height="196" rx="22" fill="#0f1115"/>
        <rect x="212" y="128" width="216" height="164" rx="14" fill="url(#screen)"/>
        <rect x="212" y="318" width="216" height="16" rx="8" fill="#141821"/>`
  }
}

export function productImageSvg(product = {}) {
  const base = product.swatch || '#1f3a5f'
  const accent = product.accent || '#c9a227'
  const shape = SHAPE_BY_CATEGORY[product.category] || 'generic'
  const brand = escapeXml(product.brand || '')
  const label = escapeXml(product.category || '')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" width="640" height="420" role="img" aria-label="${escapeXml(product.name || 'Product')}">
  <defs>
    <linearGradient id="backdrop" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${shade(base, 0.22)}"/>
      <stop offset="1" stop-color="${shade(base, -0.38)}"/>
    </linearGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${shade(accent, 0.18)}"/>
      <stop offset="1" stop-color="${shade(accent, -0.32)}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="420" fill="url(#backdrop)"/>
  <circle cx="520" cy="86" r="120" fill="${shade(accent, 0.05)}" opacity="0.16"/>
  <circle cx="120" cy="360" r="150" fill="#000000" opacity="0.12"/>
  <ellipse cx="320" cy="356" rx="196" ry="26" fill="#000000" opacity="0.22"/>
  ${shapeMarkup(shape)}
  <text x="40" y="380" font-family="Georgia, 'Times New Roman', serif" font-size="28" font-weight="700" fill="#ffffff" opacity="0.92">${brand}</text>
  <text x="600" y="380" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="18" fill="#ffffff" opacity="0.6">${label}</text>
</svg>`
}

export function productImageDataUri(product = {}) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(productImageSvg(product))}`
}

export function productImageSrc(product = {}) {
  return product.image || productImageDataUri(product)
}
