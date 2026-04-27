/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#fff4ed',
          100: '#ffe8d5',
          200: '#fecdaa',
          300: '#fdac74',
          400: '#fb8039',
          500: '#f96015',
          600: '#FF6A00',
          700: '#c13d06',
          800: '#9a320d',
          900: '#7c2c0e',
        },
        surface: {
          50:  '#f8f9fc',
          100: '#f1f3f9',
          200: '#e8ebf4',
          300: '#d5daea',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'soft':    '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'card':    '0 4px 24px -4px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
        'glow':    '0 0 0 3px rgba(255,106,0,0.18)',
        'brand':   '0 4px 14px rgba(255,106,0,0.35)',
      },
      animation: {
        'fade-in':      'fadeIn 0.4s ease-out both',
        'slide-up':     'slideUp 0.4s ease-out both',
        'skeleton':     'skeleton 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        skeleton: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },
    },
  },
  plugins: [],
}
