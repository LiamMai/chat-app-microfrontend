const path = require('path');

// Keep in sync with src/app/lib/theme.ts (palette). Plain object to stay CJS-friendly.
const palette = {
  brand: '#4d7af6',
  base: '#0a0f1e',
  surface: '#131929',
  'surface-alt': '#1a2235',
  muted: '#8b9dc3',
  danger: '#ef4444',
  online: '#22c55e',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.resolve(__dirname, 'src/**/*.{js,ts,jsx,tsx,scss}'),
    path.resolve(__dirname, '../../libs/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: palette,
      borderColor: {
        subtle: 'rgba(255,255,255,0.08)',
      },
    },
  },
  // This remote is federated into a Next.js + Angular host. Tailwind's preflight
  // is a global reset that would leak onto the host document, so disable it —
  // styles.scss already provides the resets this app needs.
  corePlugins: {
    preflight: false,
  },
  plugins: [],
};
