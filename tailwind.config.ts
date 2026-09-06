import type { Config } from 'tailwindcss';

const config: Config = {
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
        paper: '#faf9f6',
        ink: {
          DEFAULT: '#1c1f1e',
          muted: '#6b6f6a',
          dim: '#9a9d97',
        },
        line: '#e6e3db',
        brand: {
          DEFAULT: '#3aa89b',
          light: '#4fd6c4',
          soft: '#e9f8f5',
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
