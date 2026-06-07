// lib/theme.ts
// ────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for the design system: colors, risk palette, radii,
// typography, spacing and elevation tokens.
//
// Theme: minimal "editorial fintech" — modelled on godiligent.ai.
//   White canvas · near-black ink · light-gray panels · near-black dark
//   sections · a single electric-indigo accent (#5251FA), used sparingly.
//   Typeface: DM Sans (medium weight, tight negative tracking on headlines).
//
// Consumed in three places, all derived from this one file:
//   1. tailwind.config.ts  → maps these into Tailwind tokens (bg-canvas,
//      text-ink, text-muted, bg-accent, bg-night, text-risk-high, …) and
//      injects them as :root CSS variables.
//   2. globals.css         → references the injected CSS variables (--color-*).
//   3. Runtime/SSR code that needs raw values (charts, the @react-pdf report)
//      imports the objects directly: `import { risk } from '@/lib/theme'`.
//
// Change a value here and it propagates everywhere. Do NOT hardcode hex values
// in components — add a token here and use it.
// ────────────────────────────────────────────────────────────────────────────

/** Core surface + brand palette (white / near-black / indigo). */
export const colors = {
  /** App background. */
  canvas: '#FFFFFF',
  /** Raised card / panel surface. */
  surface: '#FFFFFF',
  /** Subtle gray fill — product mocks, chips, bar tracks, panels. */
  surfaceAlt: '#F5F5F6',
  /** Hairline border / divider. */
  border: 'rgba(0, 0, 0, 0.10)',

  /** Near-black used for dark sections, CTA bands and the announcement bar. */
  night: '#0A0A0A',
  nightAlt: '#1F1F1F',

  /** Electric-indigo accent — used sparingly (logo mark, links, highlights). */
  accent: '#5251FA',
  accentHover: '#3F3EE0',
  accentMuted: '#A5A5FC',
  /** Text/icon color that sits on the accent or on dark sections. */
  onAccent: '#FFFFFF',
} as const;

/** Text colors. */
export const text = {
  ink: '#0A0A0A', // primary
  muted: '#52525B', // secondary
  faint: '#9A9A9A', // tertiary / labels
} as const;

/** Neutral gray ramp for muted UI and non-semantic chart marks. */
export const neutral = {
  300: '#E4E4E7',
  400: '#A1A1AA',
  500: '#71717A',
  600: '#3F3F46',
} as const;

/**
 * Risk signal palette — clean and legible on white. These are the saturated
 * signal colors and appear only on actual results. `400` shades are for
 * text/icons, base for fills, borders and bars.
 */
export const risk = {
  high: '#DC2626', // red
  highText: '#DC2626',
  review: '#D97706', // amber
  reviewText: '#D97706',
  clear: '#16A34A', // green
  /** Absent / zero-score category. */
  none: '#A1A1AA',
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

/** DM Sans — the Diligent typeface. */
export const fontFamily = {
  sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
} as const;

/** Layout tokens. */
export const layout = {
  container: '48rem', // ~ max-w-3xl
  containerWide: '64rem', // ~ max-w-5xl
} as const;

/** Elevation — soft, subtle shadows for the light theme. */
export const shadow = {
  card: '0 1px 2px rgba(10, 10, 10, 0.04)',
  raised: '0 10px 40px rgba(10, 10, 10, 0.08)',
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
  night: colors.night,
  'night-alt': colors.nightAlt,
  ink: text.ink,
  muted: text.muted,
  faint: text.faint,
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
  // Overrides merged into Tailwind's default red/amber scales so utility
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
  '--color-night': colors.night,
  '--color-ink': text.ink,
  '--color-muted': text.muted,
  '--color-accent': colors.accent,
  '--color-accent-hover': colors.accentHover,
  '--color-accent-dim': 'rgba(82, 81, 250, 0.06)',
  '--color-placeholder': 'rgba(10, 10, 10, 0.4)',
  '--color-scroll-thumb': '#D4D4D8',
  '--color-scroll-thumb-hover': '#A1A1AA',
  '--color-risk-high': risk.high,
  '--color-risk-review': risk.review,
  '--color-risk-clear': risk.clear,
};
