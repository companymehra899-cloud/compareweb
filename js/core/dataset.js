/**
 * Shared dataset status.
 *
 * Labels across the UI ("Demo data" vs "Live data") depend on where the
 * catalogue came from. Keeping it in one tiny module avoids threading the
 * status through every page and avoids circular imports.
 */
let status = 'demo'
let updated = null
let provider = 'demo-seed'

export function setDatasetStatus(next = {}) {
  if (next.status) status = next.status
  if (next.updated !== undefined) updated = next.updated
  if (next.provider) provider = next.provider
}

export function dataStatus() {
  return status
}

export function datasetUpdatedAt() {
  return updated
}

export function datasetProvider() {
  return provider
}

export function isLive() {
  return status === 'live'
}
