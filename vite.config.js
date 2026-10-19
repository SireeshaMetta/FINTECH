import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom') || id.includes('react-redux') || id.includes('@reduxjs/toolkit')) {
              return 'vendor-core';
            }
            if (id.includes('recharts') || id.includes('framer-motion')) {
              return 'vendor-ui-charts';
            }
            if (id.includes('tesseract.js') || id.includes('jspdf') || id.includes('xlsx')) {
              return 'vendor-utils';
            }
            return 'vendor-lib';
          }
        },
      },
    },
  },
});

