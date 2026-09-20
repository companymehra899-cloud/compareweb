import { mirrorAlerts, setStatus, unsubscribeToken, ALERT_STATUS, emailProviderStatus } from './core/alerts.js'
import { getProductById } from './db.js'
import { mount } from './ui.js'

mount(null)

const provider = emailProviderStatus()
const token = new URLSearchParams(location.search).get('token')
const out = document.getElementById('outcome')

function paint(record) {
  const p = getProductById(record.product_id)
  const paused = record.status === ALERT_STATUS.PAUSED
  const stopped = record.status === ALERT_STATUS.UNSUBSCRIBED
  out.innerHTML = `
    <h2 style="font-family:var(--serif);color:var(--navy)">${p?.name || record.product_id}</h2>
    <p class="mute">Target ${record.target_price} ${record.currency} · status ${record.status}</p>
    ${stopped
      ? `<p>This alert is stopped. You will not receive further notifications.</p>`
      : `<p style="margin-top:12px">
          <button class="btn btn-ghost" id="toggle">${paused ? 'Resume alert' : 'Pause alert'}</button>
          <button class="btn btn-ghost" id="stop">Unsubscribe</button>
          <a class="btn btn-navy" href="product.html?id=${record.product_id}">View product</a>
        </p>`}
    <p class="note">${provider.configured ? '' : 'Email delivery is not configured in this environment. Alert state is held server-side once a backend is connected.'}</p>`

  document.getElementById('toggle')?.addEventListener('click', () => {
    setStatus(record.unsubscribe_token, paused ? ALERT_STATUS.ACTIVE : ALERT_STATUS.PAUSED)
    const next = mirrorAlerts().find((a) => a.unsubscribe_token === token)
    if (next) paint(next)
  })
  document.getElementById('stop')?.addEventListener('click', () => {
    unsubscribeToken(record.unsubscribe_token)
    const next = mirrorAlerts().find((a) => a.unsubscribe_token === token)
    if (next) paint(next)
  })
}

if (!token) {
  out.innerHTML = `<h2 style="font-family:var(--serif);color:var(--navy)">Missing token</h2>
    <p>Open the manage link from your alert email or the alerts page.</p>
    <a class="btn btn-navy" href="alerts.html">Go to alerts</a>`
} else {
  const record = mirrorAlerts().find((a) => a.unsubscribe_token === token)
  if (!record) {
    out.innerHTML = `<h2 style="font-family:var(--serif);color:var(--navy)">Alert not found</h2>
      <p>This manage link is invalid or belongs to another browser.</p>
      <a class="btn btn-navy" href="alerts.html">Go to alerts</a>`
  } else {
    paint(record)
  }
}
