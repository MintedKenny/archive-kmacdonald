/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    globals: true,
    css: true, // Enable CSS processing
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'app': path.resolve(__dirname, './app'),
    },
  },
}) 