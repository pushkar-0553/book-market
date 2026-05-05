import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy vendor libs into separate cached chunks
          'react-vendor': ['react', 'react-dom'],
          'router':       ['react-router-dom'],
          'icons':        ['react-icons'],
          'toast':        ['react-hot-toast'],
        },
      },
    },
  },
  // Dev server proxy kept for local development only
  server: {
    proxy: {
      '/sheets-proxy': {
        target: 'https://docs.google.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/sheets-proxy/, ''),
        secure: true,
      },
    },
  },
})

