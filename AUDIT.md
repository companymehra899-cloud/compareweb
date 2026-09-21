# DealPilot Europe — Audit & Upgrade Notes

This build upgrades the existing DealPilot MVP in place. Nothing was rebuilt from scratch.
Core principle: **no fabricated live data**. Every demo row is labelled, and price history is empty by design.

> **Update (owner request):** the email-based price-alert/notification system and the
> admin panel were removed. `alerts.html`, `verify-alert.html`, `manage-alert.html`,
> `admin.html` and their scripts no longer exist. There is no login and no email
> collection anywhere in the site — it is a free, fully guest-based tool. Lines below
> that describe those systems are retained only as a record of what was originally
> built and are no longer present.

---

## 1. Files changed / added

### Rewritten
- `js/data.js` — honest seed catalogue. Removed the `hist()` fake-history generator. Added `RETAILERS`, `LANGUAGES`, offer objects with `source`, `timestamp`, `currency`, `shipping`, `availability`, `commission_status`. Ratings/reviews set to `null` (no fabricated reviews). Battery values marked as manufacturer claims.
- `js/ui.js` — shared chrome with country + language selectors, i18n-aware labels, compare bar, honest offer table, "View Deal" tracking, demo badges, runtime `<base>` injection for country routes.
- `js/ai.js` — natural language to structured requirements (`budget`, `country`, `use`, `priority`, `category`) and catalogue matching. No absolute "best product" claim.
- `js/home.js`, `js/search.js`, `js/product.js`, `js/compare.js`, `js/assistant.js`, `js/category.js`, `js/guides.js`, `js/guide.js`, `js/stores.js`, `js/deals.js` — all rewritten against the new data layer.
- `index.html`, `search.html`, `product.html`, `compare.html`, `assistant.html`, `category.html`, `guides.html`, `guide.html`, `stores.html`, `deals.html` — updated structure, SEO meta, new sections.
- `vite.config.js` — added new pages and `/de/` routes to the multi-page build.

### Added
- `js/i18n.js` — UI strings for English + German, stored separately from components.
- `js/state.js` — country/language/compare preferences, route bootstrapping.
- `js/db.js` — localStorage "database" layer: products, retailers, guides, offers, countries, categories, languages.
- `js/seo.js` — canonical/metadata helpers + Product and Breadcrumb structured data.
- `css/app.css` — audit upgrade layer (demo badges, filters, mobile sticky CTA, tabs, data tables).
- `how.html` + `js/how.js` — "How DealPilot works" trust page.
- `affiliate-disclosure.html` + `js/affiliate.js` — affiliate disclosure.
- `de/index.html`, `de/laptops/index.html`, `de/smartphones/index.html`, `de/headphones/index.html` — SEO country/category routes.
- `robots.txt`, `sitemap.xml`.
- `.env.example` — env var placeholders (no secrets).

---

## 2. Features implemented

- Conversion-focused homepage: new headline/subtitle, search, example queries, prominent country strip with live vs pending status.
- Search results page: image (illustration), name, lowest total price, number of offers, discount, retailer, shipping, delivery, stock, freshness, compare checkbox.
- Sorting: relevance, lowest total price, highest discount, rating, recently updated.
- Filters: brand, retailer, price ceiling, delivery (country is a global preference).
- Product detail page: gallery placeholders, all retailer offers with price / shipping / total / delivery / stock / last updated / CTA, cost breakdown, spec table, AI match notes, trade-offs, alternatives.
- Price history: interactive chart area with periods (30d / 3m / 6m / 12m) and four stats (current / low / high / average). Shows the empty state because no history has been collected.
- AI assistant: extracts structured requirements and shows "Best match for your requirements" with price, retailers, specs, why-it-matches, trade-offs, alternative and compare action.
- Country system: country selection changes currency and offer visibility; Germany is the only market with demo rows.
- Multilingual: full English + German UI, strings isolated in `js/i18n.js`; FR/ES/IT/NL marked planned.
- Retailer system: id, name, logo, country, website, affiliate_url, rating, shipping_policy, active, last_updated; live / demo / partnership-pending status.
- Affiliate architecture: offer-level retailer_id, product_id, affiliate_url, tracking_parameters, commission_status, last_verified; "View Deal" logs a local click when no approved URL is configured.
- Trust/transparency: "How DealPilot works" four-step section, data disclaimer, affiliate disclosure page.
- SEO: metadata, canonical URLs, hreflang alternates, breadcrumbs, Product + Breadcrumb structured data, sitemap, robots, category landing pages, buying guides.
- Buying guides: introduction, criteria, comparison table, pros/cons, FAQ, last updated, product links.
- Guest-only: no login, no signup, no email collection. The site is free to use.
- Mobile UX: hamburger nav, collapsible filters, horizontal comparison scroll, sticky bottom CTA, clear View Deal buttons.
- Performance: Vite multi-page build, code-split per page (largest shared chunk ~42 kB JS / 19 kB CSS), no heavy runtime dependencies.

---

## 3. Requires external API / provider credentials

None of these are configured. All are placeholders in `.env.example`.

- Retailer price feeds / official APIs or affiliate networks (Awin, Tradedoubler, Amazon PA-API, etc.).
- A backend + database (the current persistence is browser localStorage only).
- An LLM provider if you want generative assistant prose instead of the deterministic matcher.

---

## 4. Still using demo data

- All 12 products and all retailer offers (marked `demo: true`, `source: "demo_seed"`).
- All 12 retailers (status `demo` for Germany, `pending` for other countries).
- All buying guides (`updated: 2026-09-01`, no lab tests claimed).
- Ratings and review counts are `null` — deliberately not fabricated.
- Price history is empty; the chart shows the empty state.
- Affiliate clicks (when an approved link exists) are stored only in the visitor's browser.

---

## 5. Database changes

The MVP has no server database. `js/db.js` defines the intended model as a localStorage document with these collections:

`products`, `retailers`, `guides`, `countries`, `categories`, `languages`, and `offers` (nested in products), plus a separate local store for `clicks`, with preferences in `js/state.js`.

Intended server models (documented, not yet implemented): Products, Brands, Categories, Retailers, Offers, Prices, PriceHistory, Comparisons, Deals, Articles, AffiliateLinks, Countries, Languages. Product identity fields present: EAN/GTIN, SKU, brand, model, variant, colour, storage, RAM, specs.

---

## 6. Environment variables required (future)

See `.env.example`. No real keys are stored in this repository.

- `PROJECT_API_BASE_URL` — backend base URL
- `PROJECT_DATABASE_URL` — server database
- `PROJECT_LLM_BASE_URL`, `PROJECT_LLM_API_KEY`, `PROJECT_LLM_MODEL` — assistant provider (user supplied)
- `PROJECT_AFFILIATE_NETWORK_ID`, `PROJECT_AFFILIATE_TRACKING_PARAM` — affiliate links
- `VITE_PROJECT_API_BASE_URL` — frontend-visible backend base URL (optional; blank = offline architecture mode)

---

## 7. Deployment instructions

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

The app is a static Vite site. Serve `dist/` from any static host. The `/de/` routes are real pages in the build.
Before a public launch: connect a backend/database and connect at least one legitimate price source.
