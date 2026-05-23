import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : '/polaris/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}));
