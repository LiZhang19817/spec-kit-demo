import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'animation-vendor': ['framer-motion', 'gsap'],
          'util-vendor': ['zustand', 'fuse.js', 'react-window'],
        },
      },
    },
    chunkSizeWarningLimit: 500, // 500KB limit per constitution
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
