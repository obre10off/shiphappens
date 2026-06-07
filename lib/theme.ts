// lib/theme.ts
// ────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for the design system: colors, risk palette, radii,
// typography, spacing and elevation tokens.
//
// Theme: warm "parchment" light theme.
//   Base palette (muted warm neutrals, given):
//     #2B2A28 espresso · #6B6258 taupe · #C9A86A gold · #EFE2C8 parchment ·
//     #FFF9EF cream
//   Accent (vibrant, chosen): deep teal #0E7C7B — the complement to the warm
//   gold/cream neutrals; premium and clearly distinct from the risk colors.
//
// Consumed in three places, all derived from this one file:
//   1. tailwind.config.ts  → maps these into Tailwind tokens (bg-canvas,
//      text-ink, text-muted, bg-accent, text-risk-high, …) and injects them as
//      :root CSS variables.
//   2. globals.css         → references the injected CSS variables (--color-*).
//   3. Runtime/SSR code that needs raw values (charts, the @react-pdf report)
//      imports the objects directly: `import { risk } from '@/lib/theme'`.
//
// Change a value here and it propagates everywhere. Do NOT hardcode hex values
// in components — add a token here and use it.
// ────────────────────────────────────────────────────────────────────────────

/** Core surface + brand palette (warm light theme). */
export const colors = {
  /** App background (warm cream). */
  canvas: '#FFF9EF',
  /** Raised card / panel surface. */
  surface: '#FFFFFF',
  /** Secondary fill — chips, bar tracks, subtle panels (parchment). */
  surfaceAlt: '#EFE2C8',
  /** Hairline border / divider over surfaces. */
  border: 'rgba(43, 42, 40, 0.12)',

  /** Vibrant accent — deep teal, complement to the warm neutrals. */
  accent: '#0E7C7B',
  accentHover: '#0A605F',
  accentMuted: '#5FA3A1',
  /** Text/icon color that sits on top of the accent. */
  onAccent: '#FFF9EF',

  /** Muted warm gold — secondary/decorative accent. */
  gold: '#C9A86A',
} as const;

/** Text colors (warm). */
export const text = {
  ink: '#2B2A28', // primary
  muted: '#6B6258', // secondary
  faint: '#938A7D', // tertiary / labels
} as const;

/** Neutral warm ramp for muted UI and non-semantic chart marks. */
export const neutral = {
  300: '#D8CDB8',
  400: '#A89F92',
  500: '#6B6258',
  600: '#4A453F',
} as const;

/**
 * Risk signal palette — warm-harmonized but still clearly semantic. These are
 * the saturated signal colors and appear only on actual results. `400` shades
 * are for text/icons, base for fills, borders and bars.
 */
export const risk = {
  high: '#B23A2E', // warm brick red
  highText: '#C25548',
  review: '#B97D1E', // warm amber/ochre (distinct from the muted gold)
  reviewText: '#C28A33',
  clear: '#3F7D5A', // muted forest green
  /** Absent / zero-score category. */
  none: '#B8AE9E',
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

/** Tokens used by the printable PDF report (light document). */
export const print = {
  ink: text.ink,
  muted: text.muted,
  barTrack: colors.surfaceAlt,
  link: colors.accent,
} as const;

/** Border radii (Tailwind `rounded-*`). */
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
  container: '48rem', // ~ max-w-3xl
  containerWide: '56rem', // ~ max-w-4xl
} as const;

/** Elevation — soft warm shadows for the light theme. */
export const shadow = {
  card: '0 1px 2px rgba(43, 42, 40, 0.06)',
  raised: '0 6px 24px rgba(43, 42, 40, 0.08)',
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
  'surface-alt': colors.surfaceAlt,
  line: colors.border,
  ink: text.ink,
  muted: text.muted,
  faint: text.faint,
  gold: colors.gold,
  cream: colors.onAccent,
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
  // Warm overrides merged into Tailwind's default red/amber scales so utility
  // classes like `text-red-400` / `bg-amber-500/10` stay on-brand.
  red: { 400: risk.highText, 500: risk.high },
  amber: { 400: risk.reviewText, 500: risk.review },
} as const;

/** `:root` CSS variables injected by the Tailwind base plugin, used in globals.css. */
export const cssVars: Record<string, string> = {
  '--color-canvas': colors.canvas,
  '--color-surface': colors.surface,
  '--color-surface-alt': colors.surfaceAlt,
  '--color-line': colors.border,
  '--color-ink': text.ink,
  '--color-muted': text.muted,
  '--color-accent': colors.accent,
  '--color-accent-hover': colors.accentHover,
  '--color-accent-dim': 'rgba(14, 124, 123, 0.08)',
  '--color-gold': colors.gold,
  '--color-placeholder': 'rgba(43, 42, 40, 0.4)',
  '--color-scroll-thumb': '#D8CDB8',
  '--color-scroll-thumb-hover': '#6B6258',
  '--color-risk-high': risk.high,
  '--color-risk-review': risk.review,
  '--color-risk-clear': risk.clear,
};
