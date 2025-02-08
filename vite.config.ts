import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Package
import pkg from './package.json';


// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'index',
      fileName: 'index'
    },
    rollupOptions: {
      output: {
        interop: 'auto',
        globals: {
          quill: 'Quill',
          react: 'react'
        }
      },
      external: Object.keys(pkg.dependencies || {})
    }
  }
});
