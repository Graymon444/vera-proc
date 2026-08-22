/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // VERA design system — calm, trustworthy, professional
        vera: {
          bg: '#F4F6FB',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E8ECF4',
          'border-light': '#F0F3FA',
          text: '#1A1D23',
          'text-secondary': '#6B7280',
          'text-muted': '#9CA3AF',
          primary: '#2563EB',
          'primary-light': '#EFF6FF',
          'primary-hover': '#1D4ED8',
          accent: '#0EA5E9',
          risk: {
            high: '#DC2626',
            'high-bg': '#FEF2F2',
            'high-border': '#FECACA',
            medium: '#D97706',
            'medium-bg': '#FFFBEB',
            'medium-border': '#FDE68A',
            low: '#16A34A',
            'low-bg': '#F0FDF4',
            'low-border': '#BBF7D0',
          },
          status: {
            verified: '#16A34A',
            'verified-bg': '#F0FDF4',
            needs: '#D97706',
            'needs-bg': '#FFFBEB',
            dismissed: '#6B7280',
            'dismissed-bg': '#F9FAFB',
          },
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        btn: '10px',
        badge: '8px',
        xl2: '20px',
      },
      boxShadow: {
        card: '0 1px 4px 0 rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 16px 0 rgba(0,0,0,0.10)',
        nav: '0 1px 0 0 #E8ECF4',
      },
    },
  },
  plugins: [],
}
