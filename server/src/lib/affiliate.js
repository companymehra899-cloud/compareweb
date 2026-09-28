/**
 * Affiliate deeplink builders.
 *
 * A deeplink is only produced when the network campaign id is configured.
 * Otherwise the plain product URL is kept separately and `affiliate_url` stays
 * null, so the frontend's approved-domain guard shows "Retailer link
 * unavailable" instead of redirecting somewhere unapproved.
 */

export function ebayAffiliateUrl(env, itemUrl, clickId) {
  const campId = env.EBAY_AFFILIATE_CAMPAIGN_ID
  if (!campId || !itemUrl) return null
  try {
    const u = new URL(itemUrl)
    u.searchParams.set('mkevt', '1')
    u.searchParams.set('mkcid', '1')
    u.searchParams.set('mkrid', env.EBAY_AFFILIATE_ROTATION_ID || '707-53477-19255-0')
    u.searchParams.set('campid', campId)
    u.searchParams.set('toolid', '10001')
    if (clickId) u.searchParams.set('customid', clickId)
    return u.toString()
  } catch {
    return null
  }
}

/** Awin deeplinks look like: https://www.awin1.com/cread.php?awinmid=..&awinaffid=..&ued=<encoded target> */
export function awinAffiliateUrl(env, targetUrl, advertiserId) {
  const publisherId = env.AWIN_PUBLISHER_ID
  if (!publisherId || !advertiserId || !targetUrl) return null
  const u = new URL('https://www.awin1.com/cread.php')
  u.searchParams.set('awinmid', String(advertiserId))
  u.searchParams.set('awinaffid', String(publisherId))
  u.searchParams.set('clickref', 'dealpilot')
  u.searchParams.set('ued', targetUrl)
  return u.toString()
}
