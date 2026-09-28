/**
 * Which catalogue entries we poll for live prices, and the query used against
 * each provider. Queries are explicit so a bad match is easy to spot and fix.
 */

import { PRODUCTS } from '../../js/data.js'

export const TRACKED = [
  { id: 'thinkpad-e14', query: 'Lenovo ThinkPad E14 Gen 6', limit: 6 },
  { id: 'vivobook-16', query: 'ASUS Vivobook 16 OLED', limit: 6 },
  { id: 'swift-3', query: 'Acer Swift 3', limit: 6 },
  { id: 'pavilion-15', query: 'HP Pavilion 15', limit: 6 },
  { id: 'macbook-air-m3', query: 'MacBook Air M3 13 inch', limit: 6 },
  { id: 'tuf-a15', query: 'ASUS TUF Gaming A15', limit: 6 },
  { id: 'framework-13', query: 'Framework Laptop 13', limit: 6 },
  { id: 'ideapad-slim5', query: 'Lenovo IdeaPad Slim 5', limit: 6 },
  { id: 'sony-xm5', query: 'Sony WH-1000XM5', limit: 6 },
  { id: 'galaxy-s24', query: 'Samsung Galaxy S24', limit: 6 },
  { id: 'apple-watch-s9', query: 'Apple Watch Series 9', limit: 6 },
  { id: 'lg-c4-55', query: 'LG OLED C4 55 inch', limit: 6 }
]

export function seedProduct(id) {
  return PRODUCTS.find((p) => p.id === id) || null
}

export function trackedIds() {
  return TRACKED.map((t) => t.id)
}
