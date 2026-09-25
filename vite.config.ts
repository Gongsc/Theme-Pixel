import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': `${import.meta.dirname}/src` } },
  server: {
    host: '127.0.0.1',
    proxy: { '/api': { target: process.env.MONITOR_HUB ?? 'http://127.0.0.1:9911', changeOrigin: true, ws: true } },
  },
})
