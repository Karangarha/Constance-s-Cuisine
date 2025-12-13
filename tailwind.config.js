/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdfd',
          100: '#ccfbfb',
          200: '#99f6f6',
          300: '#60d1d4', // User requested color (mapped to 300-400 range usually, but used as main brand anchor)
          400: '#4fb3b6',
          500: '#60d1d4', // ANCHOR
          600: '#4dbfc2',
          700: '#3aa6a9',
          800: '#2c8588',
          900: '#1e6466',
          950: '#0f4344',
        },
        brand: {
          light: '#17EAD9',
          dark: '#8EA1F0', // Lighter shade of #6078EA
        }
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
};
