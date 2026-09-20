import { mount, t } from './ui.js'
mount('home')
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t) })
