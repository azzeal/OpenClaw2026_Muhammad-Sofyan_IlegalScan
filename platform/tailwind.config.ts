import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        border: 'hsl(220 13% 91%)',
        input: 'hsl(220 13% 91%)',
        ring: 'hsl(160 84% 39%)',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(222 47% 11%)',
        muted: { DEFAULT: 'hsl(220 14% 96%)', foreground: 'hsl(220 9% 46%)' },
        subtle: 'hsl(220 14% 98%)',
        primary: { DEFAULT: 'hsl(160 84% 32%)', foreground: 'hsl(0 0% 100%)' },
        accent: { DEFAULT: 'hsl(160 84% 96%)', foreground: 'hsl(160 84% 24%)' },
        destructive: { DEFAULT: 'hsl(0 72% 51%)', foreground: 'hsl(0 0% 100%)' },
        warn: { DEFAULT: 'hsl(35 92% 50%)', foreground: 'hsl(0 0% 100%)' },
        ok: { DEFAULT: 'hsl(160 84% 39%)', foreground: 'hsl(0 0% 100%)' },
        card: { DEFAULT: 'hsl(0 0% 100%)', foreground: 'hsl(222 47% 11%)' },
      },
      borderRadius: { lg: '10px', md: '8px', sm: '6px' },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 2px hsl(220 9% 46% / 0.06)',
        md: '0 4px 12px hsl(220 9% 46% / 0.08)',
      },
    },
  },
  plugins: [],
};
export default config;
