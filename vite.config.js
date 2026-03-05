import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: {
    proxy: {
      // Todo lo que empiece con /api en el frontend...
      '/api': {
        target: 'http://localhost:3000', // ...se redirige al Backend
        changeOrigin: true,
        secure: false,
      }
    }
  }
})