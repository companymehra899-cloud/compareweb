import { lowestOffer, savingPct, getRetailer } from './data.js'
import { getProducts } from './db.js'
import { mount, t, money, resultCard, bindCompareChecks } from './ui.js'

mount('deals')
document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t) })

const products = getProducts()
  .map((p) => ({ p, save: savingPct(p) }))
  .filter((x) => x.save > 0)
  .sort((a, b) => b.save - a.save)
  .map((x) => x.p)

document.getElementById('list').innerHTML = `
  <div class="trust-note" style="margin-bottom:18px">${t('demoBanner')}</div>
  <div class="table-wrap" style="margin-bottom:22px">
    <table class="cmp">
      <tr><th>${t('products')}</th><th>${t('price')}</th><th>${t('total')}</th><th>${t('highestDiscount')}</th><th>${t('retailer')}</th><th></th></tr>
      ${products.map((p) => {
        const lo = lowestOffer(p)
        return `<tr>
          <td><a href="product.html?id=${p.id}"><strong>${p.name}</strong></a><div class="mute">${t('demoData')}</div></td>
          <td>${money(p.list)}</td>
          <td class="best">${money(lo.total)}</td>
          <td>-${savingPct(p)}%</td>
          <td>${getRetailer(lo.retailer_id)?.name}</td>
          <td><a class="btn btn-navy" href="product.html?id=${p.id}">${t('viewDeal')}</a></td>
        </tr>`
      }).join('')}
    </table>
  </div>
  ${products.map(resultCard).join('')}`
bindCompareChecks()
