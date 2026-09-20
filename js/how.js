import { mount, t } from './ui.js'

mount('how')
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t) })
document.getElementById('how-grid').innerHTML = ['how1', 'how2', 'how3', 'how4'].map((k, i) => `
  <div class="trust-step">
    <div class="trust-num">${i + 1}</div>
    <b>${t(k)}</b>
    <p>${t('howNote')}</p>
  </div>`).join('')
