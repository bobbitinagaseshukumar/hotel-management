/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: { 50: '#FFF9E6', 100: '#FFF0B3', 200: '#FFE680', 300: '#FFDB4D', 400: '#FFD11A', 500: '#D4A017', 600: '#B8860B', 700: '#8B6914', 800: '#5C4A1C', 900: '#2E2A12' },
        obsidian: { 50: '#F5F5F6', 100: '#E0E0E2', 200: '#C1C1C5', 300: '#A2A2A8', 400: '#83838B', 500: '#64646E', 600: '#4A4A52', 700: '#313136', 800: '#1A1A1F', 900: '#0D0D11', 950: '#050507' },
        champagne: { 50: '#FFFDF7', 100: '#FFF9E8', 200: '#FFF3D1', 300: '#FFECBA', 400: '#FFE6A3', 500: '#F7D794', 600: '#D4B06A', 700: '#B08A45', 800: '#8C6420', 900: '#6B4C17' },
        platinum: { 50: '#FAFAFA', 100: '#F5F5F5', 200: '#EBEBEB', 300: '#D6D6D6', 400: '#C2C2C2', 500: '#ADADAD', 600: '#999999', 700: '#858585', 800: '#707070', 900: '#5C5C5C' },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        accent: ['Cormorant Garamond', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        glow: { '0%': { boxShadow: '0 0 20px rgba(212,160,23,0.3)' }, '100%': { boxShadow: '0 0 40px rgba(212,160,23,0.6)' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4A017 0%, #FFD700 50%, #B8860B 100%)',
        'dark-gradient': 'linear-gradient(135deg, #0D0D11 0%, #1A1A1F 50%, #0D0D11 100%)',
      },
    },
  },
  plugins: [],
}
