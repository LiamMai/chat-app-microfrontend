const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.resolve(__dirname, 'src/**/*.{html,ts,scss}'),
    path.resolve(__dirname, '../../libs/**/*.{html,ts}'),
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
