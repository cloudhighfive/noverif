/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3f1ff',
          100: '#ebe5ff',
          200: '#d9ceff',
          300: '#bea6ff',
          400: '#9f75ff',
          500: '#843dff',
          600: '#7a1dff',
          700: '#6b0df0',
          800: '#5a0bc5',
          900: '#4b0a9e',
        },
        secondary: {
          50: '#edfcff',
          100: '#d6f7ff',
          200: '#b3eeff',
          300: '#76e2ff',
          400: '#36d0ff',
          500: '#0cb8ff',
          600: '#0092da',
          700: '#0074af',
          800: '#006190',
          900: '#065177',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e0e1e5',
          200: '#c1c3ca',
          300: '#9c9fac',
          400: '#797c8c',
          500: '#606375',
          600: '#4d4f5f',
          700: '#3d3f4b',
          800: '#26272e',
          900: '#1a1b21',
          950: '#111114',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(to bottom right, rgba(122, 29, 255, 0.1), rgba(12, 184, 255, 0.1))',
      },
      boxShadow: {
        'glow': '0 0 10px rgba(122, 29, 255, 0.5), 0 0 20px rgba(12, 184, 255, 0.3)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}