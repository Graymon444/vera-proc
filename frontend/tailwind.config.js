/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // VERA One UI Design System — Trust through Transparency
        teal: {
          50:  '#E1F5EE',
          500: '#1D9E75',
          900: '#0F6E56',
        },
        risk: {
          50:  '#FAECE7',
          500: '#D85A30',
          900: '#712B13',
        },
        warn: {
          50:  '#FAEEDA',
          500: '#BA7517',
          900: '#633806',
        },
        safe: {
          50:  '#EAF3DE',
          500: '#639922',
          900: '#27500A',
        },
        surface: {
          0: '#F1EFE8',
          1: '#FFFFFF',
        },
        ink: {
          primary:   '#2C2C2A',
          secondary: '#5F5E5A',
          muted:     '#9B9A96',
          border:    '#D3D1C7',
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
      },
      boxShadow: {
        'sm': '0 2px 8px rgba(0,0,0,0.08)',
        'md': '0 4px 12px rgba(0,0,0,0.12)',
        'lg': '0 8px 24px rgba(0,0,0,0.15)',
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
