/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#00cffd',
        accent: '#0099cc',
        brand: {
          50: '#e0faff',
          100: '#b3f3ff',
          200: '#80ebff',
          300: '#4de3ff',
          400: '#26dcff',
          500: '#00cffd',
          600: '#00a8d4',
          700: '#0080a8',
          800: '#005a7a',
          900: '#00364d',
        },
        muted: '#ececf0',
        destructive: '#d4183d',
      },
      fontFamily: {
        sans: [
          'system-ui', '-apple-system', 'BlinkMacSystemFont',
          'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial',
          'Noto Sans', 'sans-serif',
        ],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.5' }],
        sm: ['14px', { lineHeight: '1.5' }],
        base: ['16px', { lineHeight: '1.5' }],
        lg: ['18px', { lineHeight: '1.5' }],
        xl: ['20px', { lineHeight: '1.5' }],
        '2xl': ['24px', { lineHeight: '1.5' }],
        '3xl': ['30px', { lineHeight: '1.5' }],
        '4xl': ['36px', { lineHeight: '1.2' }],
        '5xl': ['48px', { lineHeight: '1.1' }],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
        '2xl': '16px',
        '3xl': '20px',
        full: '9999px',
      },
      spacing: {
        sidebar: '240px',
        header: '64px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.05)',
        DEFAULT: '0 1px 3px rgba(0,0,0,0.1)',
        md: '0 4px 6px rgba(0,0,0,0.07)',
        lg: '0 10px 15px rgba(0,0,0,0.08)',
        xl: '0 20px 25px rgba(0,0,0,0.08)',
        '2xl': '0 25px 50px rgba(0,0,0,0.15)',
        brand: '0 4px 14px rgba(0,207,253,0.25)',
        'brand-lg': '0 8px 24px rgba(0,207,253,0.3)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #00cffd 0%, #0099cc 100%)',
        'gradient-brand-soft': 'linear-gradient(135deg, rgba(0,207,253,0.1) 0%, rgba(0,153,204,0.1) 100%)',
        'gradient-brand-hover': 'linear-gradient(135deg, #00b8e6 0%, #007799 100%)',
        'gradient-page': 'linear-gradient(to bottom right, #eff6ff, #ffffff, #ecfeff)',
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      animation: {
        'fade-in': 'fadeIn .2s ease-out',
        'slide-up': 'slideUp .2s ease-out',
        spin: 'spin .8s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
