/** D1 access helpers. Every payload is stored as JSON so the API can evolve. */

export async function getMeta(env, key) {
  const row = await env.DB.prepare('SELECT v FROM meta WHERE k = ?').bind(key).first()
  return row ? row.v : null
}

export async function setMeta(env, key, value) {
  await env.DB.prepare(
    'INSERT INTO meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v'
  )
    .bind(key, String(value))
    .run()
}

export async function listProducts(env) {
  const { results } = await env.DB.prepare('SELECT payload FROM products ORDER BY id').all()
  return (results || []).map((r) => JSON.parse(r.payload))
}

export async function listRetailers(env) {
  const { results } = await env.DB.prepare('SELECT payload FROM retailers ORDER BY id').all()
  return (results || []).map((r) => JSON.parse(r.payload))
}

export async function countProducts(env) {
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM products').first()
  return row?.n || 0
}

export async function saveProducts(env, products, nowIso) {
  const stmts = products.map((p) =>
    env.DB.prepare(
      'INSERT INTO products (id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at'
    ).bind(p.id, JSON.stringify(p), nowIso)
  )
  if (stmts.length) await env.DB.batch(stmts)
}

export async function upsertRetailer(env, retailer, nowIso) {
  await env.DB.prepare(
    'INSERT INTO retailers (id, payload, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload, updated_at = excluded.updated_at'
  )
    .bind(retailer.id, JSON.stringify(retailer), nowIso)
    .run()
}

export async function saveOffers(env, offers, nowIso) {
  const stmts = offers.map((o) =>
    env.DB.prepare(
      'INSERT INTO offers (id, product_id, retailer_id, price, currency, payload, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET price = excluded.price, currency = excluded.currency, payload = excluded.payload, updated_at = excluded.updated_at'
    ).bind(o.id, o.product_id, o.retailer_id, o.total ?? o.price ?? null, o.currency || 'EUR', JSON.stringify(o), nowIso)
  )
  for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50))
}

/** Append one row per tracked offer so the frontend can draw real price history. */
export async function snapshotPrices(env, offers) {
  if (!offers.length) return
  const stmts = offers.map((o) =>
    env.DB.prepare(
      'INSERT INTO price_history (product_id, offer_id, retailer_id, price, currency, captured_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(o.product_id, o.id, o.retailer_id, o.total ?? o.price ?? null, o.currency || 'EUR', o.timestamp)
  )
  for (let i = 0; i < stmts.length; i += 50) await env.DB.batch(stmts.slice(i, i + 50))
}

export async function historyFor(env, productId, limit = 200) {
  const { results } = await env.DB.prepare(
    'SELECT offer_id, retailer_id, price, currency, captured_at FROM price_history WHERE product_id = ? ORDER BY captured_at DESC LIMIT ?'
  )
    .bind(productId, limit)
    .all()
  return results || []
}

export async function recordClick(env, row) {
  await env.DB.prepare(
    'INSERT OR IGNORE INTO clicks (click_id, product_id, offer_id, retailer_id, country, referrer, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(
      row.click_id,
      row.product_id || null,
      row.offer_id || null,
      row.retailer_id || null,
      row.country || null,
      row.referrer || null,
      row.timestamp || new Date().toISOString()
    )
    .run()
}
