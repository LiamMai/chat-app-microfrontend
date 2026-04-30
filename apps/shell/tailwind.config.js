const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.resolve(__dirname, 'src/**/*.{js,ts,jsx,tsx,scss}'),
    path.resolve(__dirname, '../../libs/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        ig: {
          primary:   'var(--ig-primary)',
          secondary: 'var(--ig-secondary)',
          border:    'var(--ig-border)',
          bg:        'var(--ig-bg)',
          surface:   'var(--ig-surface)',
          blue:      'var(--ig-blue)',
          link:      'var(--ig-link)',
          error:     'var(--ig-error)',
          success:   'var(--ig-success)',
          white:     'var(--ig-white)',
        },
      },
      fontFamily: {
        dancing: ['var(--ig-font-script)', 'cursive'],
        system:  ['var(--ig-font-system)', 'sans-serif'],
      },
      borderRadius: {
        'ig-sm':     'var(--ig-radius-sm)',
        'ig-btn':    'var(--ig-radius-btn)',
        'ig-card':   'var(--ig-radius-card)',
        'ig-avatar': 'var(--ig-radius-avatar)',
      },
      backgroundImage: {
        'ig-gradient':       'var(--ig-gradient)',
        'ig-gradient-radial':'var(--ig-gradient-radial)',
      },
    },
  },
  plugins: [],
};
