import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 6006,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://rest-sig.imaitix.com',
        changeOrigin: true,
        secure: false,
        headers: {
          'Origin': 'https://hkt.hkticketing.com',
          'Referer': 'https://hkt.hkticketing.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        },
      },
      '/wr-static': {
        target: 'https://wr-static.maitix.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/wr-static/, ''),
        headers: {
          'Origin': 'https://hkt.hkticketing.com',
          'Referer': 'https://hkt.hkticketing.com/',
        },
      },
    },
  },
})
