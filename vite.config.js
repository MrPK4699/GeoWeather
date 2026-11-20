import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Accept the existing REACT_APP_* names in .env as well as Vite's VITE_* names,
  // so the current .env keeps working without being edited.
  envPrefix: ['VITE_', 'REACT_APP_'],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: false,
  },
});
