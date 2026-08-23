/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        /*
         * VERA — Warm Sand & Spice palette
         *
         * Concept: everything reads like aged parchment, warm wood, earthy spice.
         * No cool greys, no cold blues, no pure blacks.
         *
         * Surface scale: cream parchment → warm white card
         * Primary: deep forest green (earthy trust, not sterile teal)
         * Risk: warm terracotta brick (attention without alarm)
         * Caution: golden ochre (honey amber)
         * Safe: dusty olive green
         * Ink: espresso → latte → cream hierarchy
         */

        // ── Surfaces (cream/parchment family) ──────────────────────────────
        parchment: {
          50:  '#FAF7F0',   // lightest, near-white with warmth
          100: '#F4EFE4',   // page background
          200: '#EBE4D6',   // subtle card contrast
          300: '#DDD5C4',   // dividers, borders
          400: '#C8BDA8',   // stronger border
          500: '#A89880',   // muted foreground
        },

        // ── Forest Green (primary — trust, stability, government) ──────────
        forest: {
          50:  '#EBF4EE',   // very light tint, bg for badges/pills
          100: '#CDE5D3',   // hover tints
          200: '#9ECBAA',   // light accent
          500: '#2D7D52',   // main action colour — deep, warm green
          700: '#1E5C3A',   // hover state
          900: '#133D27',   // darkest, text on light
        },

        // ── Terracotta (high risk — warm brick, not alarming red) ──────────
        terra: {
          50:  '#FAF0EC',   // very light tint
          100: '#F2D9D0',   // light bg for risk cards
          200: '#E4B09A',   // border
          500: '#C05A3A',   // main risk colour
          700: '#8F3F25',   // darker for text
          900: '#5C2415',   // darkest
        },

        // ── Ochre (medium / caution — honey amber) ─────────────────────────
        ochre: {
          50:  '#FBF5E6',   // very light tint
          100: '#F5E4B8',   // light bg
          200: '#E8C97A',   // border
          500: '#C08C1A',   // main caution colour
          700: '#8A6010',   // text
          900: '#5A3D08',   // darkest
        },

        // ── Olive (low risk / safe — dusty sage green) ─────────────────────
        olive: {
          50:  '#F2F5E8',   // light tint
          100: '#DEEABF',   // light bg
          200: '#BDCF88',   // border
          500: '#72941F',   // main safe colour
          700: '#4F6A14',   // text
          900: '#30430C',   // darkest
        },

        // ── Ink / text (espresso brown hierarchy) ──────────────────────────
        ink: {
          950: '#1C1814',   // near-black espresso (primary headings)
          800: '#3A322A',   // body text
          600: '#635A50',   // secondary text
          400: '#9A8F82',   // placeholder, muted
          200: '#D4CCBF',   // hairline borders
          100: '#E8E2D8',   // dividers
          50:  '#F4F0E8',   // subtle tint bg
        },
      },

      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },

      fontSize: {
        'h1':      ['24px', { lineHeight: '1.4', fontWeight: '500' }],
        'h2':      ['18px', { lineHeight: '1.4', fontWeight: '500' }],
        'h3':      ['16px', { lineHeight: '1.4', fontWeight: '500' }],
        'body':    ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'label':   ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['11px', { lineHeight: '1.5', fontWeight: '400' }],
      },

      spacing: {
        xs: '8px', sm: '12px', md: '16px', lg: '24px', xl: '32px',
      },

      borderRadius: {
        sm: '4px', md: '8px', lg: '12px', xl: '16px',
      },

      boxShadow: {
        sm:  '0 2px 8px  rgba(28, 24, 20, 0.07)',
        md:  '0 4px 12px rgba(28, 24, 20, 0.11)',
        lg:  '0 8px 24px rgba(28, 24, 20, 0.14)',
      },

      transitionTimingFunction: {
        'one-ui': 'cubic-bezier(0.2, 0, 0.8, 1)',
      },

      transitionDuration: {
        fast: '150ms', base: '200ms', slow: '300ms',
      },
    },
  },
  plugins: [],
}
