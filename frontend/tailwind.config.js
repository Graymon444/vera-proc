/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // VERA — Warm Unified Palette
        // Every colour has a warm (sand/brown) undertone.
        // No pure cool greys anywhere.
        teal: {
          50:  '#E2F4EC',
          100: '#C3E8D5',
          500: '#1A9B6E',
          900: '#0D6B4A',
        },
        risk: {
          50:  '#FAEDE8',
          500: '#D45A2A',
          900: '#6E2910',
        },
        warn: {
          50:  '#FAF0DC',
          500: '#B87215',
          900: '#613604',
        },
        safe: {
          50:  '#EBF4DF',
          500: '#5E9420',
          900: '#264E08',
        },
        surface: {
          0: '#F5F2EC',   // page bg — warm sand
          1: '#FEFCF8',   // card — warm white
          2: '#EDE9E1',   // recessed
        },
        ink: {
          primary:   '#2A2722',   // warm near-black
          secondary: '#5C5750',   // warm mid
          muted:     '#948E87',   // warm light
          border:    '#D6D1C8',   // warm hairline
          divider:   '#EAE6DE',   // very subtle
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
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(42,39,34,0.07)',
        'md': '0 4px 12px rgba(42,39,34,0.11)',
        'lg': '0 8px 24px rgba(42,39,34,0.14)',
      },
      transitionTimingFunction: {
        'one-ui': 'cubic-bezier(0.2, 0, 0.8, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
      minHeight: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}
