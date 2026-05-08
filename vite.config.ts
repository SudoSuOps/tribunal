import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    // Proxy /api → forge server so OPENAI_API_KEY never reaches the browser
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
