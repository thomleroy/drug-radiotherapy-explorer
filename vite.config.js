import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Removes the strict CSP meta in dev only — Vite injects inline modules
// for HMR which would otherwise be blocked. The production build is
// untouched and ships with the CSP intact.
const stripCspInDev = () => ({
  name: 'radiosync:strip-csp-in-dev',
  transformIndexHtml: {
    order: 'pre',
    handler(html, ctx) {
      if (ctx?.server) {
        return html.replace(
          /<meta\s+http-equiv="Content-Security-Policy"[^>]*\/?>\s*/i,
          ''
        );
      }
      return html;
    },
  },
});

// Vite configuration for the Radiosync drug explorer.
//
// - The dev server runs on port 3000 to mirror the previous CRA setup.
// - `build.outDir` is `build/` to keep the existing deployment scripts
//   (Vercel et al.) working untouched.
// - `vitest` settings are colocated here so we don't need a second config.
export default defineConfig({
  plugins: [react(), stripCspInDev()],
  server: {
    port: 3000,
    open: false,
  },
  preview: {
    port: 3000,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    css: false,
    include: ['src/**/*.test.{js,jsx}'],
  },
});
