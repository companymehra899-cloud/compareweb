# DealPilot Europe — Phase 2: Production Readiness

This document records what was added in Phase 2 and what must still be connected
before the site can serve live data. Nothing here is a live integration yet.

## What exists now

### Data layer (`js/core/`)

| Module | Responsibility | Current status |
| --- | --- | --- |
| `providers.js` | `ProductDataProvider`, `RetailerFeedProvider`, `PriceProvider`, `ExchangeRateProvider` base classes, registry and `ingestAll()` | Demo seed provider only |
| `normalize.js` | Canonicalization and matching. Merges only on a hard ID (EAN/GTIN or brand + MPN) | Implemented, unit-testable |
| `currency.js` | Stores original currency, converts explicitly, labels fallback output | Offline fallback rates, marked `fallback: true` |
| `freshness.js` | Fresh / recently updated / stale / unavailable states from offer timestamps | Implemented |
| `history.js` | Records price events; history is only ever written from observed events | Empty by design (no live feed) |
| `affiliate.js` | Approved-domain allowlist, safe link resolution, click log | No affiliate URLs configured, so no redirects happen |
| `search.js` | Intent parsing (budget, category, use case, EAN/GTIN) and scoring; exact vs related split | Implemented |
| `alerts.js` | Guest alerts with random `verification_token` / `unsubscribe_token`; no login | Architecture mode; email provider not configured |
| `ai.js` | AI boundary: server-side key only, input validation, timeout, rate limit, catalogue-grounded answers | Local catalogue matcher until backend is set |

### UI wiring

- **Search**: NL queries produce requirement chips, an exact-match list with
  pagination, and a separate "Related products" block. There is no silent
  padding: when nothing matches, the page says `No exact matches found.`
- **Product**: original currency is preserved and any converted amount is
  labelled `Converted estimate`. Every offer shows a freshness badge and a stale
  warning. "View Deal" only becomes a link when the retailer domain is on the
  approved allowlist; otherwise it reads `Retailer link unavailable`.
- **Alerts**: guests set a target price, receive a random verification link and a
  separate manage/unsubscribe link. No passwords, no accounts.
- **New pages**: `verify-alert.html`, `manage-alert.html`.
- **Admin**: added Data health (missing EAN/MPN, duplicate EANs, offers missing
  timestamp/source/currency, freshness distribution) and Providers tabs.
- **SEO**: `hreflang` alternates (`en`, `de`, `x-default`) and canonical are
  injected per path; country activation is tracked separately from translation.

## Honesty rules enforced in code

1. Ratings and reviews stay `null`. No review text is invented.
2. Price history is empty and only fills from recorded events. Demo seed rows
   never write history.
3. Weak product matches become `possible_match` / `needs_review` / `rejected` and
   are never auto-merged.
4. All demo rows are labelled, and admin distinguishes demo from configured rows.
5. Conversion never silently swaps a currency symbol; fallback rates are labelled.
6. The AI key lives on the server. The frontend calls our own backend only.

## To go live you must connect

| Subsystem | Env / action |
| --- | --- |
| Backend API | `VITE_PROJECT_API_BASE_URL` (server holds all secrets) |
| Product / retailer feeds | Register real providers in `providers.js` |
| Exchange rates | Register a live `ExchangeRateProvider` |
| Email (alerts) | Server-side provider + set `EMAIL_CONFIGURED` in `js/core/alerts.js` |
| AI assistant | Backend route `/ai/assistant`, key stays server-side |
| Affiliate | Real `affiliate_url` values on approved domains, plus admin auth |
| Database | Replace localStorage with the backend store |

Secrets (`PROJECT_LLM_API_KEY`, `PROJECT_EMAIL_API_KEY`) must never be given a
`VITE_` prefix.
