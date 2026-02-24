/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Apple Design System Colors
        // Light mode
        'apple-bg-primary': '#FFFFFF',
        'apple-bg-secondary': '#F5F5F7',
        'apple-bg-tertiary': '#E8E8ED',
        'apple-text-primary': '#000000',
        'apple-text-secondary': '#6E6E73',
        'apple-text-tertiary': '#86868B',
        'apple-accent': '#0071E3',
        'apple-divider': '#D2D2D7',

        // Dark mode
        'apple-dark-bg-primary': '#000000',
        'apple-dark-bg-secondary': '#161618',
        'apple-dark-bg-tertiary': '#212124',
        'apple-dark-text-primary': '#F5F5F7',
        'apple-dark-text-secondary': '#A1A1A6',
        'apple-dark-text-tertiary': '#86868B',
        'apple-dark-accent': '#0A84FF',
        'apple-dark-divider': '#38383A',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      spacing: {
        // 4px/8px grid system
        '4.5': '1.125rem', // 18px
        '18': '4.5rem',    // 72px
        '88': '22rem',     // 352px
      },
      borderRadius: {
        'apple-sm': '4px',
        'apple-md': '8px',
        'apple-lg': '12px',
        'apple-xl': '16px',
        'apple-2xl': '24px',
      },
      boxShadow: {
        'apple-sm': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'apple-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'apple-lg': '0 10px 25px rgba(0, 0, 0, 0.1)',
        'apple-xl': '0 20px 40px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
