import { verifyToken } from './core/alerts.js'
import { getProductById } from './db.js'
import { mount } from './ui.js'

mount(null)

const token = new URLSearchParams(location.search).get('token')
const out = document.getElementById('outcome')

if (!token) {
  out.innerHTML = `<h2 style="font-family:var(--serif);color:var(--navy)">Missing token</h2>
    <p>This page needs the verification link from your alert.</p>
    <a class="btn btn-navy" href="alerts.html">Go to alerts</a>`
} else {
  const res = verifyToken(token)
  if (!res.ok) {
    out.innerHTML = `<h2 style="font-family:var(--serif);color:var(--navy)">Link not valid</h2>
      <p>${res.error}</p>
      <a class="btn btn-navy" href="alerts.html">Go to alerts</a>`
  } else {
    const p = getProductById(res.record.product_id)
    out.innerHTML = `
      <h2 style="font-family:var(--serif);color:var(--navy)">${res.already ? 'Already verified' : 'Alert verified'}</h2>
      <p>We will notify you when <b>${p?.name || res.record.product_id}</b> reaches your target of <b>${res.record.target_price} ${res.record.currency}</b> or below.</p>
      <p class="note">Status: ${res.record.status}. ${res.record.email_configured ? '' : 'No email has been sent yet because email delivery is not configured in this environment.'}</p>
      <p style="margin-top:14px">
        <a class="btn btn-navy" href="product.html?id=${res.record.product_id}">View product</a>
        <a class="btn btn-ghost" href="manage-alert.html?token=${encodeURIComponent(res.record.unsubscribe_token)}">Manage alert</a>
      </p>`
  }
}
