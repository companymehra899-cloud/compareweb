import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.monkeycode-ai.live']
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['.monkeycode-ai.live']
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        product: resolve(__dirname, 'product.html'),
        search: resolve(__dirname, 'search.html'),
        compare: resolve(__dirname, 'compare.html'),
        assistant: resolve(__dirname, 'assistant.html'),
        category: resolve(__dirname, 'category.html'),
        guides: resolve(__dirname, 'guides.html'),
        guide: resolve(__dirname, 'guide.html'),
        stores: resolve(__dirname, 'stores.html'),
        deals: resolve(__dirname, 'deals.html'),
        how: resolve(__dirname, 'how.html'),
        affiliate: resolve(__dirname, 'affiliate-disclosure.html'),
        deHome: resolve(__dirname, 'de/index.html'),
        deLaptops: resolve(__dirname, 'de/laptops/index.html'),
        deSmartphones: resolve(__dirname, 'de/smartphones/index.html'),
        deHeadphones: resolve(__dirname, 'de/headphones/index.html')
      }
    }
  }
})
