import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import {
  cssVars,
  fontFamily,
  fontSize,
  radius,
  shadow,
  tailwindColors,
} from './lib/theme';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      // All design tokens come from lib/theme.ts — the single source of truth.
      colors: {
        ...tailwindColors,
        // Legacy aliases kept so any stragglers don't break (prefer the tokens above).
        navy: { DEFAULT: tailwindColors.canvas },
        teal: { DEFAULT: tailwindColors.accent.DEFAULT, 400: tailwindColors.accent.hover },
      },
      borderRadius: {
        // New semantic token; existing rounded-md/lg/xl/2xl keep Tailwind defaults.
        card: radius.card,
      },
      fontFamily: {
        sans: [...fontFamily.sans],
      },
      fontSize: {
        '4xl': fontSize['4xl'],
        '6xl': fontSize['6xl'],
      },
      boxShadow: {
        card: shadow.card,
        raised: shadow.raised,
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'spin-slow': 'spin 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    // Inject the theme tokens as :root CSS variables so plain CSS (globals.css)
    // and Tailwind utilities share one source.
    plugin(({ addBase }) => {
      addBase({ ':root': cssVars });
    }),
  ],
};

export default config;
