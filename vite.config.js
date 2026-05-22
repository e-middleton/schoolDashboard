import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward any request starting with /get-view-url or /generate-upload-url
      '/get-view-url': 'http://localhost:3001', 
      '/generate-upload-url': 'http://localhost:3001'
    }
  }
  
})
