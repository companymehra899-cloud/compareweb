-- DealPilot backend schema (Cloudflare D1 / SQLite)
-- Apply with: npm run db:init  (remote)  or  npm run db:init:local

CREATE TABLE IF NOT EXISTS products (
  id         TEXT PRIMARY KEY,
  payload    TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS retailers (
  id         TEXT PRIMARY KEY,
  payload    TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS offers (
  id          TEXT PRIMARY KEY,
  product_id  TEXT NOT NULL,
  retailer_id TEXT NOT NULL,
  price       REAL,
  currency    TEXT,
  payload     TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_offers_product ON offers (product_id);

CREATE TABLE IF NOT EXISTS price_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  TEXT NOT NULL,
  offer_id    TEXT,
  retailer_id TEXT,
  price       REAL,
  currency    TEXT,
  captured_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_history_product ON price_history (product_id, captured_at);

CREATE TABLE IF NOT EXISTS clicks (
  click_id    TEXT PRIMARY KEY,
  product_id  TEXT,
  offer_id    TEXT,
  retailer_id TEXT,
  country     TEXT,
  referrer    TEXT,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL
);
