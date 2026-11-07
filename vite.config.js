import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/body-mantra-open/',
  build: { target: 'es2022', chunkSizeWarningLimit: 1500 },
});
