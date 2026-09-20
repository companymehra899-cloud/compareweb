import { lowestOffer } from './data.js'
import { getProductById } from './db.js'
import { mirrorAlerts, setStatus, unsubscribeToken, ALERT_STATUS, emailProviderStatus } from './core/alerts.js'
import { mount, t, money } from './ui.js'

mount('alerts')
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t) })

const provider = emailProviderStatus()
const FILTERS = [
  ['active', 'active', ALERT_STATUS.ACTIVE],
  ['pending', 'pending', ALERT_STATUS.PENDING],
  ['triggered', 'triggered', ALERT_STATUS.TRIGGERED],
  ['paused', 'paused', ALERT_STATUS.PAUSED]
]
let status = 'active'

function statusLabel(s) {
  if (s === ALERT_STATUS.PENDING) return 'Pending verification'
  if (s === ALERT_STATUS.ACTIVE) return 'Active'
  if (s === ALERT_STATUS.TRIGGERED) return 'Triggered'
  if (s === ALERT_STATUS.PAUSED) return 'Paused'
  if (s === ALERT_STATUS.UNSUBSCRIBED) return 'Unsubscribed'
  return s
}

function render() {
  const list = mirrorAlerts().filter((a) => a.status === status)
  if (!list.length) {
    document.getElementById('list').innerHTML = `<div class="empty-state"><h3>${t('noAlerts')}</h3><p>${provider.configured ? '' : t('noEmail')}</p><a class="btn btn-navy" style="margin-top:14px" href="category.html?id=laptops">${t('browseLaptops')}</a></div>`
    return
  }
  document.getElementById('list').innerHTML = `<div class="table-wrap"><table class="cmp">
    <tr><th>${t('products')}</th><th>${t('targetPrice')}</th><th>${t('lowestTotal')}</th><th>${t('email')}</th><th>Status</th><th></th></tr>
    ${list.map((a) => {
      const p = getProductById(a.product_id)
      const lo = p ? lowestOffer(p) : null
      return `<tr>
        <td><a href="product.html?id=${a.product_id}"><strong>${p?.name || a.product_id}</strong></a></td>
        <td>${money(a.target_price)} ${a.currency}</td>
        <td>${lo ? money(lo.total) : '—'}</td>
        <td>${a.email} <span class="badge-demo">${a.email_configured ? 'email' : 'local'}</span></td>
        <td><span class="badge-status ${a.status === 'active' ? 'status-demo' : 'status-pending'}">${statusLabel(a.status)}</span></td>
        <td class="row-actions">
          ${a.status === ALERT_STATUS.PAUSED
            ? `<button class="btn btn-ghost" data-set="active" data-token="${a.unsubscribe_token}">${t('active')}</button>`
            : a.status === ALERT_STATUS.ACTIVE
              ? `<button class="btn btn-ghost" data-set="paused" data-token="${a.unsubscribe_token}">${t('paused')}</button>`
              : ''}
          <button class="btn btn-ghost" data-unsub="${a.unsubscribe_token}">Unsubscribe</button>
        </td>
      </tr>`
    }).join('')}
  </table></div>`
}

document.getElementById('tabs').innerHTML = FILTERS.map(([id, label]) =>
  `<button class="tab ${id === status ? 'on' : ''}" data-s="${id}">${label === 'pending' ? 'Pending' : t(label)}</button>`
).join('')

document.getElementById('tabs').addEventListener('click', (e) => {
  const b = e.target.closest('.tab')
  if (!b) return
  status = b.dataset.s
  document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x === b))
  render()
})

document.getElementById('list').addEventListener('click', (e) => {
  const set = e.target.closest('[data-set]')
  const un = e.target.closest('[data-unsub]')
  if (set) {
    setStatus(set.dataset.token, set.dataset.set)
    status = set.dataset.set
    document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x.dataset.s === status))
    render()
  } else if (un) {
    unsubscribeToken(un.dataset.token)
    render()
  }
})

render()
