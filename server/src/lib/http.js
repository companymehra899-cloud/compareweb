/** CORS + JSON response helpers shared by every route. */

export function corsHeaders(env, request) {
  const allowed = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const origin = request.headers.get('Origin') || ''
  const allow = allowed.includes(origin) ? origin : allowed[0] || '*'
  return {
    'access-control-allow-origin': allow,
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'content-type',
    'access-control-max-age': '86400',
    vary: 'Origin'
  }
}

export function json(data, { status = 200, headers = {}, maxAge = 300 } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${maxAge}`,
      ...headers
    }
  })
}

export function notFound(headers = {}) {
  return json({ error: 'not_found' }, { status: 404, headers })
}

/** Constant-time-ish comparison for the manual ingest token. */
export function tokenMatches(env, provided) {
  const expected = env.INGEST_TOKEN || ''
  if (!expected || !provided) return false
  if (expected.length !== provided.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i += 1) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i)
  return diff === 0
}
