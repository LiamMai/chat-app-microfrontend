import { createTheme, type MantineColorsTuple } from '@mantine/core';

/**
 * Single source of truth for the chat app palette.
 * Consumed by:
 *   - Mantine  → `theme` below (MantineProvider in bootstrap.tsx)
 *   - Tailwind → tailwind.config.js imports `palette` for theme.extend.colors
 *   - inline styles in legacy components reference the same hex values
 */
export const palette = {
  brand: '#4d7af6', // primary blue
  base: '#0a0f1e', // app background
  surface: '#131929', // panels / sidebar
  surfaceAlt: '#1a2235', // inputs / dropdowns / cards
  text: '#ffffff',
  muted: '#8b9dc3', // secondary text / inactive icons
  danger: '#ef4444', // unread badge
  online: '#22c55e', // presence dot
  border: 'rgba(255,255,255,0.08)',
} as const;

// 10-shade brand ramp around #4d7af6 (index 6 = palette.brand)
const brand: MantineColorsTuple = [
  '#eef3ff',
  '#dbe4ff',
  '#b3c6ff',
  '#88a5fc',
  '#658bfa',
  '#5180f7',
  '#4d7af6',
  '#3b66dc',
  '#3159c4',
  '#214aae',
];

export const theme = createTheme({
  primaryColor: 'brand',
  primaryShade: 6,
  colors: { brand },
  fontFamily: 'system-ui, -apple-system, sans-serif',
  defaultRadius: 'md',
});
