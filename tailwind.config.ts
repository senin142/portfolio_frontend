import type { Config } from 'tailwindcss';

function themeColor(name: string) {
  return `rgb(var(${name}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
        arabic: ['Tahoma', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      colors: {
        paper: themeColor('--color-paper'),
        surface: themeColor('--color-surface'),
        ink: {
          DEFAULT: themeColor('--color-ink'),
          muted: themeColor('--color-ink-muted'),
          dim: themeColor('--color-ink-dim'),
        },
        line: themeColor('--color-line'),
        brand: {
          DEFAULT: themeColor('--color-brand'),
          light: themeColor('--color-brand-light'),
          soft: themeColor('--color-brand-soft'),
        },
        primary: {
          DEFAULT: themeColor('--color-primary'),
          fg: themeColor('--color-primary-fg'),
        },
      },
      borderRadius: {
        xl2: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
