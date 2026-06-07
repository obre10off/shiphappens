// lib/theme.ts
// ────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for the design system: colors, risk palette, radii,
// typography, spacing and elevation tokens.
//
// Consumed in three places, all derived from this one file:
//   1. tailwind.config.ts  → maps these into Tailwind tokens (bg-accent,
//      text-risk-high, rounded-card, …) and injects them as CSS variables.
//   2. globals.css         → references the injected CSS variables (--color-*).
//   3. Runtime/SSR code that needs raw values (charts, the @react-pdf report)
//      imports the objects directly: `import { risk } from '@/lib/theme'`.
//
// Change a value here and it propagates everywhere. Do NOT hardcode hex values
// in components — add a token here and use it.
// ────────────────────────────────────────────────────────────────────────────

/** Core brand + surface palette (refined-dark / corporate). */
export const colors = {
  /** App background (cool slate-900). */
  canvas: '#0f172a',
  /** Solid raised surface (e.g. <select> option menus). */
  surface: '#1e293b',
  /** Translucent card fill over the canvas. */
  card: 'rgba(255, 255, 255, 0.03)',
  /** Hairline border on cards/sections. */
  border: 'rgba(255, 255, 255, 0.08)',

  /** Restrained steel-blue accent — the only brand color. */
  accent: '#5b7ba6',
  accentHover: '#7a97bd',
  accentMuted: '#48637f',

  white: '#ffffff',
} as const;

/** Neutral slate ramp for text, muted UI and non-semantic chart marks. */
export const neutral = {
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
} as const;

/**
 * Risk signal palette — desaturated on purpose. These are the ONLY saturated
 * colors in the product and should appear only on actual results.
 * `400` shades are for text/icons, `500`/base for fills, borders and bars.
 */
export const risk = {
  high: '#c0564b',
  highText: '#cf7b72',
  review: '#bf9040',
  reviewText: '#cda85c',
  clear: '#4f8a6d',
  /** Absent / zero-score category. */
  none: neutral[600],
} as const;

export type RiskBand = 'high' | 'review' | 'clear';

/** Band → primary color (used by gauge, bars, PDF). */
export const bandColor: Record<RiskBand, string> = {
  high: risk.high,
  review: risk.review,
  clear: risk.clear,
};

/** Score (0–100) → bar color, shared by the dashboard and the PDF. */
export function scoreColor(score: number): string {
  if (score >= 60) return risk.high;
  if (score >= 25) return risk.review;
  return risk.none;
}

/** Light-mode tokens used only by the printable PDF report. */
export const print = {
  ink: colors.canvas,
  muted: neutral[500],
  barTrack: '#e2e8f0',
  link: '#2563eb',
} as const;

/** Border radii (Tailwind `rounded-*` overrides). */
export const radius = {
  sm: '8px',
  md: '10px',
  lg: '12px',
  card: '16px',
  pill: '9999px',
} as const;

/** Type scale (Tailwind `text-*`). Mirrors the sizes actually used. */
export const fontSize = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '4xl': '2.25rem',
  '6xl': '3.75rem',
} as const;

export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
} as const;

/** Layout tokens. */
export const layout = {
  /** Max content width for the screening flow / landing sections. */
  container: '48rem', // ~ max-w-3xl
  containerWide: '56rem', // ~ max-w-4xl
} as const;

/** Elevation. Intentionally minimal — the corporate theme avoids glows. */
export const shadow = {
  card: '0 1px 2px rgba(0, 0, 0, 0.2)',
} as const;

export const zIndex = {
  base: 0,
  overlay: 10,
  header: 20,
  modal: 50,
} as const;

// ── Tailwind + CSS-variable adapters (derived, not duplicated) ───────────────

/** Color map handed to `tailwind.config.ts` (`theme.extend.colors`). */
export const tailwindColors = {
  canvas: colors.canvas,
  surface: colors.surface,
  accent: {
    DEFAULT: colors.accent,
    hover: colors.accentHover,
    muted: colors.accentMuted,
  },
  risk: {
    high: risk.high,
    review: risk.review,
    clear: risk.clear,
    none: risk.none,
  },
  // Desaturated overrides merged into Tailwind's default red/amber scales so
  // utility classes like `text-red-400` / `bg-amber-500/10` stay on-brand.
  red: { 400: risk.highText, 500: risk.high },
  amber: { 400: risk.reviewText, 500: risk.review },
} as const;

/** `:root` CSS variables injected by the Tailwind base plugin, used in globals.css. */
export const cssVars: Record<string, string> = {
  '--color-canvas': colors.canvas,
  '--color-surface': colors.surface,
  '--color-card': colors.card,
  '--color-border': colors.border,
  '--color-accent': colors.accent,
  '--color-accent-hover': colors.accentHover,
  '--color-accent-dim': 'rgba(91, 123, 166, 0.1)',
  '--color-accent-border': 'rgba(91, 123, 166, 0.3)',
  '--color-accent-strong': 'rgba(91, 123, 166, 0.4)',
  '--color-risk-high': risk.high,
  '--color-risk-review': risk.review,
  '--color-risk-clear': risk.clear,
};
