import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#070a13',
          panel: '#0c1120',
          raised: '#111733',
          line: '#1a2240',
        },
        ink: {
          DEFAULT: '#e6ecff',
          dim: '#8d97c2',
          muted: '#5b6594',
          faint: '#3a4374',
        },
        accent: {
          scanner: '#22d3ee',
          intake: '#f472b6',
          analyst: '#fde047',
          alert: '#fb7185',
          ok: '#4ade80',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 0 1px #22d3ee33, 0 0 18px -2px #22d3ee55',
        'neon-pink': '0 0 0 1px #f472b633, 0 0 18px -2px #f472b655',
        'neon-yellow': '0 0 0 1px #fde04733, 0 0 18px -2px #fde04755',
      },
    },
  },
  plugins: [],
};
export default config;
