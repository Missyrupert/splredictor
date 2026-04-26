import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: '#020912',
          900: '#05101e',
          800: '#091a2e',
          700: '#0d2444',
          600: '#153457',
          500: '#1d4470',
          400: '#265688',
        },
        saltire: {
          600: '#004a96',
          500: '#005db8',
          400: '#1a82dd',
          300: '#4aaae8',
        },
        tartan: {
          600: '#9e0021',
          500: '#c8102e',
          400: '#e03247',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fadeIn 0.35s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
