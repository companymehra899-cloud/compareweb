export const SEED_AT = '2026-09-01T10:00:00.000Z'
export const DATA_STATUS = 'demo'

export const LANGUAGES = [
  { code: 'en', name: 'English', status: 'live' },
  { code: 'de', name: 'German', status: 'live' },
  { code: 'fr', name: 'French', status: 'planned' },
  { code: 'es', name: 'Spanish', status: 'planned' },
  { code: 'it', name: 'Italian', status: 'planned' },
  { code: 'nl', name: 'Dutch', status: 'planned' }
]

export const COUNTRIES = [
  { code: 'DE', name: 'Germany', currency: 'EUR', locale: 'de-DE', languageDefault: 'de', status: 'demo', live: false },
  { code: 'FR', name: 'France', currency: 'EUR', locale: 'fr-FR', languageDefault: 'fr', status: 'pending', live: false },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', locale: 'nl-NL', languageDefault: 'nl', status: 'pending', live: false },
  { code: 'ES', name: 'Spain', currency: 'EUR', locale: 'es-ES', languageDefault: 'es', status: 'pending', live: false },
  { code: 'IT', name: 'Italy', currency: 'EUR', locale: 'it-IT', languageDefault: 'it', status: 'pending', live: false },
  { code: 'UK', name: 'United Kingdom', currency: 'GBP', locale: 'en-GB', languageDefault: 'en', status: 'pending', live: false }
]

export const CATEGORIES = [
  { id: 'laptops', name: 'Laptops', nameDe: 'Laptops', icon: 'laptop', slug: 'laptops' },
  { id: 'smartphones', name: 'Smartphones', nameDe: 'Smartphones', icon: 'phone', slug: 'smartphones' },
  { id: 'headphones', name: 'Headphones', nameDe: 'Kopfhörer', icon: 'headphones', slug: 'headphones' },
  { id: 'tvs', name: 'TVs', nameDe: 'Fernseher', icon: 'tv', slug: 'tvs' },
  { id: 'gaming', name: 'Gaming', nameDe: 'Gaming', icon: 'game', slug: 'gaming' },
  { id: 'smartwatches', name: 'Smartwatches', nameDe: 'Smartwatches', icon: 'watch', slug: 'smartwatches' },
  { id: 'home', name: 'Home Appliances', nameDe: 'Haushaltsgeräte', icon: 'home', slug: 'home' },
  { id: 'fashion', name: 'Fashion', nameDe: 'Fashion', icon: 'fashion', slug: 'fashion' }
]

export const RETAILERS = [
  { id: 'amazon-de', name: 'Amazon.de', logo: 'A', country: 'DE', website: 'https://www.amazon.de', affiliate_url: null, rating: null, shipping_policy: 'Varies by seller', active: true, status: 'demo', last_updated: SEED_AT },
  { id: 'mediamarkt', name: 'MediaMarkt', logo: 'M', country: 'DE', website: 'https://www.mediamarkt.de', affiliate_url: null, rating: null, shipping_policy: 'Store + home delivery', active: true, status: 'demo', last_updated: SEED_AT },
  { id: 'saturn', name: 'Saturn', logo: 'S', country: 'DE', website: 'https://www.saturn.de', affiliate_url: null, rating: null, shipping_policy: 'Store + home delivery', active: true, status: 'demo', last_updated: SEED_AT },
  { id: 'cyberport', name: 'Cyberport', logo: 'C', country: 'DE', website: 'https://www.cyberport.de', affiliate_url: null, rating: null, shipping_policy: 'Home delivery', active: true, status: 'demo', last_updated: SEED_AT },
  { id: 'nsb', name: 'Notebooksbilliger', logo: 'N', country: 'DE', website: 'https://www.notebooksbilliger.de', affiliate_url: null, rating: null, shipping_policy: 'Home delivery', active: true, status: 'demo', last_updated: SEED_AT },
  { id: 'alternate', name: 'Alternate', logo: 'Al', country: 'DE', website: 'https://www.alternate.de', affiliate_url: null, rating: null, shipping_policy: 'Home delivery', active: true, status: 'demo', last_updated: SEED_AT },
  { id: 'otto', name: 'Otto', logo: 'O', country: 'DE', website: 'https://www.otto.de', affiliate_url: null, rating: null, shipping_policy: 'Home delivery', active: true, status: 'demo', last_updated: SEED_AT },
  { id: 'mindfactory', name: 'Mindfactory', logo: 'Mf', country: 'DE', website: 'https://www.mindfactory.de', affiliate_url: null, rating: null, shipping_policy: 'Home delivery', active: true, status: 'demo', last_updated: SEED_AT },
  { id: 'fnac', name: 'Fnac', logo: 'F', country: 'FR', website: 'https://www.fnac.com', affiliate_url: null, rating: null, shipping_policy: 'Pending partnership', active: false, status: 'pending', last_updated: SEED_AT },
  { id: 'coolblue', name: 'Coolblue', logo: 'Cb', country: 'NL', website: 'https://www.coolblue.nl', affiliate_url: null, rating: null, shipping_policy: 'Pending partnership', active: false, status: 'pending', last_updated: SEED_AT },
  { id: 'currys', name: 'Currys', logo: 'Cu', country: 'UK', website: 'https://www.currys.co.uk', affiliate_url: null, rating: null, shipping_policy: 'Pending partnership', active: false, status: 'pending', last_updated: SEED_AT },
  { id: 'pccomp', name: 'PcComponentes', logo: 'Pc', country: 'ES', website: 'https://www.pccomponentes.com', affiliate_url: null, rating: null, shipping_policy: 'Pending partnership', active: false, status: 'pending', last_updated: SEED_AT }
]

function offer(retailer_id, product_id, price, shipping, delivery, stock) {
  return {
    id: `${product_id}-${retailer_id}`,
    retailer_id,
    product_id,
    price,
    shipping,
    total: price + shipping,
    currency: 'EUR',
    delivery,
    stock,
    availability: stock,
    source: 'demo_seed',
    timestamp: SEED_AT,
    last_verified: SEED_AT,
    affiliate_url: null,
    tracking_parameters: null,
    commission_status: 'not_configured',
    demo: true
  }
}

export const PRODUCTS = [
  {
    id: 'thinkpad-e14',
    name: 'Lenovo ThinkPad E14 Gen 6',
    brand: 'Lenovo',
    model: 'ThinkPad E14 Gen 6',
    ean: '0198152754101',
    sku: '21M7002TGE',
    category: 'laptops',
    color: 'Black',
    variant: '16 GB / 512 GB',
    tagline: 'Business keyboard, claimed long battery',
    rating: null,
    reviews: null,
    swatch: '#1f3a5f',
    accent: '#c9a227',
    list: 899,
    country: 'DE',
    warranty: '24 months',
    demo: true,
    specs: { CPU: 'Intel Core Ultra 5 125U', RAM: '16 GB LPDDR5', Storage: '512 GB SSD', Display: '14" WUXGA IPS', Battery: '57 Wh (manufacturer claim)', Weight: '1.44 kg', GPU: 'Intel Graphics', OS: 'Windows 11 Pro', Ports: '2× USB-C, HDMI, Ethernet', Keyboard: 'ThinkPad', Warranty: '24 months' },
    tags: ['programming', 'university', 'battery', 'business', 'windows'],
    history: [],
    why: ['16 GB RAM listed in the demo spec sheet', 'ThinkPad keyboard noted for typing', 'Ethernet port listed'],
    tradeoffs: ['Battery figure is a manufacturer claim, not measured here', 'No independent review scores in this catalogue'],
    ai: 'Matches programming / university briefs in the demo catalogue because of 16 GB RAM and a business keyboard. Battery life is not independently verified here.',
    offers: [
      offer('nsb', 'thinkpad-e14', 749, 0, '1–2 days', 'in_stock'),
      offer('cyberport', 'thinkpad-e14', 769, 0, '1–3 days', 'in_stock'),
      offer('amazon-de', 'thinkpad-e14', 779, 0, '1–2 days', 'in_stock'),
      offer('alternate', 'thinkpad-e14', 789, 0, '1–3 days', 'low_stock'),
      offer('mediamarkt', 'thinkpad-e14', 799, 0, '2–4 days', 'in_stock')
    ]
  },
  {
    id: 'vivobook-16',
    name: 'ASUS Vivobook 16 OLED',
    brand: 'ASUS',
    model: 'Vivobook 16 OLED',
    ean: '4711387482102',
    sku: 'M1605YA-MB152W',
    category: 'laptops',
    color: 'Quiet Blue',
    variant: '16 GB / 512 GB',
    tagline: '16-inch OLED panel in the demo sheet',
    rating: null,
    reviews: null,
    swatch: '#243044',
    accent: '#6ea8fe',
    list: 849,
    country: 'DE',
    warranty: '24 months',
    demo: true,
    specs: { CPU: 'AMD Ryzen 7 7730U', RAM: '16 GB DDR4', Storage: '512 GB SSD', Display: '16" 3.2K OLED', Battery: '50 Wh (manufacturer claim)', Weight: '1.88 kg', GPU: 'Radeon Graphics', OS: 'Windows 11 Home', Ports: 'USB-C, HDMI, microSD', Keyboard: 'Backlit', Warranty: '24 months' },
    tags: ['university', 'oled', 'windows', 'media'],
    history: [],
    why: ['OLED display listed', '16 GB RAM', 'Large 16" canvas'],
    tradeoffs: ['Heavier than 14" models in this catalogue', 'Battery claim not measured here'],
    ai: 'Demo match when the brief prefers a large OLED screen. Heavier than the ThinkPad / Swift rows.',
    offers: [
      offer('amazon-de', 'vivobook-16', 699, 0, '1–2 days', 'in_stock'),
      offer('mediamarkt', 'vivobook-16', 729, 0, '2–4 days', 'in_stock'),
      offer('cyberport', 'vivobook-16', 734, 0, '1–3 days', 'in_stock'),
      offer('otto', 'vivobook-16', 749, 4.99, '3–5 days', 'in_stock')
    ]
  },
  {
    id: 'swift-3',
    name: 'Acer Swift 3 14',
    brand: 'Acer',
    model: 'Swift 3 14',
    ean: '4711121123345',
    sku: 'SF314-512',
    category: 'laptops',
    color: 'Silver',
    variant: '16 GB / 512 GB',
    tagline: 'Light 14-inch Windows laptop',
    rating: null,
    reviews: null,
    swatch: '#3d4f46',
    accent: '#8fbf9f',
    list: 749,
    country: 'DE',
    warranty: '24 months',
    demo: true,
    specs: { CPU: 'Intel Core i5-1335U', RAM: '16 GB LPDDR5', Storage: '512 GB SSD', Display: '14" FHD IPS', Battery: '56 Wh (manufacturer claim)', Weight: '1.21 kg', GPU: 'Intel Iris Xe', OS: 'Windows 11 Home', Ports: '2× USB-C, HDMI', Keyboard: 'Backlit', Warranty: '24 months' },
    tags: ['university', 'battery', 'lightweight', 'travel', 'windows'],
    history: [],
    why: ['Lowest weight among demo laptops', '16 GB RAM', 'Price under €650 in demo offers'],
    tradeoffs: ['FHD panel, not OLED', 'No independent battery test'],
    ai: 'Demo match for a light campus laptop under €650. Display is FHD IPS, not OLED.',
    offers: [
      offer('alternate', 'swift-3', 599, 0, '1–3 days', 'in_stock'),
      offer('nsb', 'swift-3', 619, 0, '1–2 days', 'in_stock'),
      offer('amazon-de', 'swift-3', 629, 0, '1–2 days', 'in_stock'),
      offer('mediamarkt', 'swift-3', 649, 4.99, '2–4 days', 'in_stock')
    ]
  },
  {
    id: 'pavilion-15',
    name: 'HP Pavilion 15',
    brand: 'HP',
    model: 'Pavilion 15',
    ean: '0196068099001',
    sku: 'eg2146ng',
    category: 'laptops',
    color: 'Silver',
    variant: '16 GB / 512 GB',
    tagline: '15.6-inch home / campus laptop',
    rating: null,
    reviews: null,
    swatch: '#4a3728',
    accent: '#d4a373',
    list: 799,
    country: 'DE',
    warranty: '24 months',
    demo: true,
    specs: { CPU: 'Intel Core i5-1340P', RAM: '16 GB DDR4', Storage: '512 GB SSD', Display: '15.6" FHD IPS', Battery: '43 Wh (manufacturer claim)', Weight: '1.75 kg', GPU: 'Intel Iris Xe', OS: 'Windows 11 Home', Ports: 'USB-C, HDMI, SD', Keyboard: 'Numeric keypad', Warranty: '24 months' },
    tags: ['university', 'home', 'windows', 'office'],
    history: [],
    why: ['15.6" screen', 'Numeric keypad'],
    tradeoffs: ['Smaller battery capacity listed than 14" models'],
    ai: 'Demo match for a larger screen and numeric keypad. Battery capacity listed is lower than the 14-inch rows.',
    offers: [
      offer('mediamarkt', 'pavilion-15', 649, 0, '2–4 days', 'in_stock'),
      offer('saturn', 'pavilion-15', 649, 0, 'store', 'in_stock'),
      offer('amazon-de', 'pavilion-15', 669, 0, '1–2 days', 'in_stock'),
      offer('otto', 'pavilion-15', 679, 0, '3–5 days', 'in_stock')
    ]
  },
  {
    id: 'macbook-air-m3',
    name: 'Apple MacBook Air 13 M3',
    brand: 'Apple',
    model: 'MacBook Air 13 M3',
    ean: '0195949123456',
    sku: 'MRXV3D/A',
    category: 'laptops',
    color: 'Midnight',
    variant: '8 GB / 256 GB',
    tagline: 'Fanless 13-inch Mac',
    rating: null,
    reviews: null,
    swatch: '#5c6570',
    accent: '#e8e4dc',
    list: 1299,
    country: 'DE',
    warranty: '12 months',
    demo: true,
    specs: { CPU: 'Apple M3', RAM: '8 GB unified', Storage: '256 GB SSD', Display: '13.6" Liquid Retina', Battery: '52.6 Wh (manufacturer claim)', Weight: '1.24 kg', GPU: '8-core GPU', OS: 'macOS', Ports: '2× Thunderbolt / USB-C', Keyboard: 'Magic Keyboard', Warranty: '12 months' },
    tags: ['university', 'battery', 'macos', 'travel', 'silent'],
    history: [],
    why: ['Fanless chassis listed', 'Light weight'],
    tradeoffs: ['8 GB / 256 GB base configuration', 'Above an €800 budget'],
    ai: 'Demo match for a quiet Mac. 8 GB RAM and 256 GB storage are the base configuration in this row. Price is above €800.',
    offers: [
      offer('amazon-de', 'macbook-air-m3', 999, 0, '1–2 days', 'in_stock'),
      offer('cyberport', 'macbook-air-m3', 1019, 0, '1–3 days', 'in_stock'),
      offer('mediamarkt', 'macbook-air-m3', 1049, 0, '2–4 days', 'in_stock')
    ]
  },
  {
    id: 'tuf-a15',
    name: 'ASUS TUF Gaming A15',
    brand: 'ASUS',
    model: 'TUF Gaming A15',
    ean: '4711387489999',
    sku: 'FA507NV',
    category: 'laptops',
    color: 'Graphite',
    variant: '16 GB / 512 GB / RTX 4050',
    tagline: '15.6-inch laptop with listed RTX 4050',
    rating: null,
    reviews: null,
    swatch: '#1a2e22',
    accent: '#3dd68c',
    list: 1099,
    country: 'DE',
    warranty: '24 months',
    demo: true,
    specs: { CPU: 'AMD Ryzen 7 7735HS', RAM: '16 GB DDR5', Storage: '512 GB SSD', Display: '15.6" FHD 144 Hz', Battery: '90 Wh (manufacturer claim)', Weight: '2.2 kg', GPU: 'NVIDIA RTX 4050 6 GB', OS: 'Windows 11 Home', Ports: 'USB-C, HDMI 2.1, Ethernet', Keyboard: 'RGB', Warranty: '24 months' },
    tags: ['gaming', 'programming', 'gpu', 'windows'],
    history: [],
    why: ['Dedicated RTX 4050 listed', '144 Hz panel listed'],
    tradeoffs: ['2.2 kg', 'Not a commute-first chassis'],
    ai: 'Demo match if the brief needs a listed dedicated GPU. Heavy compared with the 14-inch rows.',
    offers: [
      offer('mindfactory', 'tuf-a15', 849, 0, '2–3 days', 'in_stock'),
      offer('alternate', 'tuf-a15', 869, 0, '1–3 days', 'in_stock'),
      offer('nsb', 'tuf-a15', 879, 0, '1–2 days', 'in_stock'),
      offer('amazon-de', 'tuf-a15', 899, 0, '1–2 days', 'in_stock')
    ]
  },
  {
    id: 'framework-13',
    name: 'Framework Laptop 13',
    brand: 'Framework',
    model: 'Laptop 13',
    ean: '0850048070123',
    sku: 'FRANWDI0001',
    category: 'laptops',
    color: 'Black',
    variant: '16 GB / 512 GB',
    tagline: 'Modular 13.5-inch laptop',
    rating: null,
    reviews: null,
    swatch: '#2b2b2b',
    accent: '#f0a202',
    list: 1249,
    country: 'DE',
    warranty: '12 months',
    demo: true,
    specs: { CPU: 'Intel Core Ultra 5 125H', RAM: '16 GB DDR5', Storage: '512 GB SSD', Display: '13.5" 3:2', Battery: '61 Wh (manufacturer claim)', Weight: '1.3 kg', GPU: 'Intel Arc', OS: 'Windows 11 / Linux', Ports: '4× expansion cards', Keyboard: 'Input cover', Warranty: '12 months' },
    tags: ['programming', 'linux', 'repairable', 'university'],
    history: [],
    why: ['Repairable / modular design listed', 'Linux mentioned in OS field'],
    tradeoffs: ['Above €800', 'Fewer demo offers'],
    ai: 'Demo match for a repairable Linux-friendly laptop. Price is above €800 in this catalogue.',
    offers: [
      offer('cyberport', 'framework-13', 1149, 0, '5–8 days', 'low_stock'),
      offer('amazon-de', 'framework-13', 1199, 0, '4–7 days', 'low_stock')
    ]
  },
  {
    id: 'ideapad-slim5',
    name: 'Lenovo IdeaPad Slim 5',
    brand: 'Lenovo',
    model: 'IdeaPad Slim 5',
    ean: '0198152999000',
    sku: '83A0001GE',
    category: 'laptops',
    color: 'Cloud Grey',
    variant: '16 GB / 512 GB',
    tagline: '14-inch OLED IdeaPad',
    rating: null,
    reviews: null,
    swatch: '#31425a',
    accent: '#9ec1cf',
    list: 799,
    country: 'DE',
    warranty: '24 months',
    demo: true,
    specs: { CPU: 'AMD Ryzen 5 7535HS', RAM: '16 GB LPDDR5', Storage: '512 GB SSD', Display: '14" 2.8K OLED', Battery: '57 Wh (manufacturer claim)', Weight: '1.46 kg', GPU: 'Radeon 660M', OS: 'Windows 11 Home', Ports: 'USB-C, HDMI', Keyboard: 'Backlit', Warranty: '24 months' },
    tags: ['university', 'oled', 'windows', 'battery'],
    history: [],
    why: ['OLED listed', '16 GB RAM', 'Under €700 in demo offers'],
    tradeoffs: ['Keyboard is not a ThinkPad'],
    ai: 'Demo match between Swift 3 price and ThinkPad keyboard. OLED listed; keyboard is a standard IdeaPad.',
    offers: [
      offer('cyberport', 'ideapad-slim5', 679, 0, '1–3 days', 'in_stock'),
      offer('nsb', 'ideapad-slim5', 689, 0, '1–2 days', 'in_stock'),
      offer('amazon-de', 'ideapad-slim5', 699, 0, '1–2 days', 'in_stock'),
      offer('mediamarkt', 'ideapad-slim5', 729, 0, '2–4 days', 'in_stock')
    ]
  },
  {
    id: 'sony-xm5',
    name: 'Sony WH-1000XM5',
    brand: 'Sony',
    model: 'WH-1000XM5',
    ean: '4548736132345',
    sku: 'WH1000XM5B',
    category: 'headphones',
    color: 'Black',
    variant: 'Wireless over-ear',
    tagline: 'Over-ear wireless headphones',
    rating: null,
    reviews: null,
    swatch: '#222',
    accent: '#f2f2f2',
    list: 399,
    country: 'DE',
    warranty: '24 months',
    demo: true,
    specs: { CPU: '—', RAM: '—', Storage: '—', Display: '—', Battery: '30 h (manufacturer claim)', Weight: '250 g', Warranty: '24 months', Type: 'Over-ear wireless', ANC: 'Listed by manufacturer' },
    tags: ['travel', 'anc', 'commute'],
    history: [],
    why: ['ANC listed by manufacturer', 'Over-ear travel form'],
    tradeoffs: ['No independent ANC measurement in this catalogue'],
    ai: 'Demo headphones row for an ANC / travel brief. Performance claims are manufacturer-listed, not tested here.',
    offers: [
      offer('amazon-de', 'sony-xm5', 279, 0, '1–2 days', 'in_stock'),
      offer('mediamarkt', 'sony-xm5', 299, 0, '2–4 days', 'in_stock')
    ]
  },
  {
    id: 'galaxy-s24',
    name: 'Samsung Galaxy S24',
    brand: 'Samsung',
    model: 'Galaxy S24',
    ean: '8806095300001',
    sku: 'SM-S921B',
    category: 'smartphones',
    color: 'Onyx Black',
    variant: '8 GB / 128 GB',
    tagline: 'Compact Android flagship (demo row)',
    rating: null,
    reviews: null,
    swatch: '#3a4a6b',
    accent: '#7ad7f0',
    list: 849,
    country: 'DE',
    warranty: '24 months',
    demo: true,
    specs: { CPU: 'Exynos 2400 / Snapdragon (region dependent)', RAM: '8 GB', Storage: '128 GB', Display: '6.2" LTPO AMOLED', Battery: '4000 mAh (manufacturer)', Weight: '167 g', Warranty: '24 months' },
    tags: ['flagship', 'compact', 'android'],
    history: [],
    why: ['Compact size listed', 'Flagship chipset family listed'],
    tradeoffs: ['128 GB base storage'],
    ai: 'Demo smartphone row. Region chipset may differ; this catalogue does not verify which SKU a retailer ships.',
    offers: [
      offer('mediamarkt', 'galaxy-s24', 549, 0, '2–4 days', 'in_stock'),
      offer('saturn', 'galaxy-s24', 549, 0, 'store', 'in_stock'),
      offer('amazon-de', 'galaxy-s24', 559, 0, '1–2 days', 'in_stock')
    ]
  },
  {
    id: 'apple-watch-s9',
    name: 'Apple Watch Series 9 GPS 45mm',
    brand: 'Apple',
    model: 'Watch Series 9',
    ean: '0195949450001',
    sku: 'MR9U3',
    category: 'smartwatches',
    color: 'Midnight',
    variant: 'GPS 45mm',
    tagline: 'Apple Watch GPS 45 mm',
    rating: null,
    reviews: null,
    swatch: '#2c2c2c',
    accent: '#ff3b30',
    list: 429,
    country: 'DE',
    warranty: '12 months',
    demo: true,
    specs: { CPU: 'S9 SiP', RAM: '—', Storage: '—', Display: 'Always-On Retina', Battery: '18 h (manufacturer claim)', Weight: '—', Warranty: '12 months' },
    tags: ['fitness', 'apple', 'watch'],
    history: [],
    why: ['45 mm GPS model listed'],
    tradeoffs: ['Requires iPhone per Apple software policy — not verified here'],
    ai: 'Demo wearable row. Software compatibility is not tested in this catalogue.',
    offers: [
      offer('amazon-de', 'apple-watch-s9', 329, 0, '1–2 days', 'in_stock'),
      offer('mediamarkt', 'apple-watch-s9', 349, 0, '2–4 days', 'in_stock')
    ]
  },
  {
    id: 'lg-c4-55',
    name: 'LG OLED C4 55"',
    brand: 'LG',
    model: 'OLED55C44LA',
    ean: '8806091980001',
    sku: 'OLED55C44LA',
    category: 'tvs',
    color: 'Black',
    variant: '55"',
    tagline: '55-inch OLED TV',
    rating: null,
    reviews: null,
    swatch: '#111',
    accent: '#a0e8af',
    list: 1499,
    country: 'DE',
    warranty: '24 months',
    demo: true,
    specs: { CPU: 'α9 AI Processor Gen7', RAM: '—', Storage: '—', Display: '55" OLED evo 120 Hz', Battery: '—', Weight: '—', Warranty: '24 months', HDMI: '4× HDMI 2.1 (manufacturer)' },
    tags: ['gaming', 'ps5', 'oled', 'home'],
    history: [],
    why: ['OLED 120 Hz listed', 'HDMI 2.1 count listed as four'],
    tradeoffs: ['Bright-room performance not measured here'],
    ai: 'Demo TV row for a 55" OLED / HDMI 2.1 brief. Ports are manufacturer-listed.',
    offers: [
      offer('saturn', 'lg-c4-55', 999, 0, '3–7 days', 'in_stock'),
      offer('mediamarkt', 'lg-c4-55', 1029, 0, '3–7 days', 'in_stock'),
      offer('amazon-de', 'lg-c4-55', 1049, 0, '2–5 days', 'in_stock')
    ]
  }
]

export const GUIDES = [
  {
    id: 'laptops-under-800',
    title: 'Laptops under €800 — how to read the demo catalogue',
    titleDe: 'Laptops unter 800 € — Demo-Katalog lesen',
    kicker: 'Work',
    minutes: 8,
    updated: '2026-09-01',
    excerpt: 'Criteria for a programming / university laptop, using only this demo catalogue. No lab tests.',
    criteria: ['16 GB RAM or more in the spec sheet', 'Weight if you commute', 'Budget as total price (product + shipping)', 'Do not treat manufacturer battery hours as measured'],
    faq: [
      { q: 'Are these current shop prices?', a: 'No. They are demo seed rows for the product UI.' },
      { q: 'Did DealPilot test these laptops?', a: 'No. Specs are copied into the demo catalogue from typical public spec sheets and are not verified measurements.' }
    ]
  },
  {
    id: 'how-price-history',
    title: 'How price history will work',
    titleDe: 'So wird die Preishistorie funktionieren',
    kicker: 'Method',
    minutes: 5,
    updated: '2026-09-01',
    excerpt: 'History graphs stay empty until a real feed writes timestamps. This guide explains the intended method.',
    criteria: ['Need multiple timestamps per offer', 'Compare total cost, not strikethrough list price', 'Mark stale rows when a feed stops'],
    faq: [
      { q: 'Why is the graph empty?', a: 'This MVP has no collected history. The empty state is intentional.' }
    ]
  },
  {
    id: 'headphones-travel',
    title: 'Travel headphones — reading claims vs measurements',
    titleDe: 'Reise-Kopfhörer — Angaben vs. Messungen',
    kicker: 'Audio',
    minutes: 6,
    updated: '2026-09-01',
    excerpt: 'ANC and battery hours in retailer copy are manufacturer claims until we ingest a measured source.',
    criteria: ['Form factor', 'Weight', 'Listed battery hours as claims only', 'Total price'],
    faq: [
      { q: 'Is XM5 the best?', a: 'This site does not rank “best” without a defined metric. The XM5 is the only headphones SKU in the demo catalogue.' }
    ]
  },
  {
    id: 'smartphones-under-300',
    title: 'Smartphones: what this catalogue can and cannot say',
    titleDe: 'Smartphones: Was dieser Katalog sagen kann',
    kicker: 'Mobile',
    minutes: 5,
    updated: '2026-09-01',
    excerpt: 'Only one smartphone SKU is modelled. Sub-€300 live listings are not in this database.',
    criteria: ['Storage', 'Size', 'Total price', 'Country of the offer'],
    faq: [
      { q: 'Where are sub-€300 phones?', a: 'Not in the demo seed. This page exists as a category landing, not as a ranked test.' }
    ]
  }
]

export function getCountry(code) {
  return COUNTRIES.find((c) => c.code === code)
}

export function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id)
}

export function getRetailer(id) {
  return RETAILERS.find((s) => s.id === id)
}

export function formatMoney(n, country = 'DE') {
  const c = getCountry(country) || COUNTRIES[0]
  return new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.currency, maximumFractionDigits: 2 }).format(n)
}

export function lowestOffer(product) {
  if (!product?.offers?.length) return null
  return [...product.offers].sort((a, b) => a.total - b.total)[0]
}

export function savingPct(product) {
  const lo = lowestOffer(product)
  if (!lo || !product.list || product.list <= lo.price) return 0
  return Math.round((1 - lo.price / product.list) * 100)
}

export function relativeUpdated() {
  return 'demo_seed'
}

export function stockLabel(stock, t) {
  if (stock === 'in_stock') return t('inStock')
  if (stock === 'low_stock') return t('lowStock')
  if (stock === 'out_of_stock') return t('outOfStock')
  return stock
}

export function byCategory(id) {
  return PRODUCTS.filter((p) => p.category === id)
}

export function searchProducts(query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return PRODUCTS.map((p) => ({ p, hits: 0 }))
  const tokens = q.split(/\s+/).filter((t) => t.length > 1 && !['under', 'für', 'for', 'with', 'und', 'the', 'best'].includes(t))
  return PRODUCTS
    .map((p) => {
      const hay = [p.name, p.brand, p.model, p.category, p.ean, p.sku, p.tagline, ...(p.tags || []), ...Object.values(p.specs || {})].join(' ').toLowerCase()
      const hits = tokens.filter((t) => hay.includes(t)).length
      return { p, hits }
    })
    .filter((x) => x.hits > 0)
}

export function categoryCount(id) {
  return PRODUCTS.filter((p) => p.category === id).length
}
