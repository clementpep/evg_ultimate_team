import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vite configuration for EVG Ultimate Team frontend
 * https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [react()],

  // Path aliases for cleaner imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@context': path.resolve(__dirname, './src/context'),
    },
  },

  // Development server configuration
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    open: true,
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
  },
})
