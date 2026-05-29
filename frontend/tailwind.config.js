/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eefbff',
          100: '#d8f5ff',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          900: '#0c1929',
        },
      },
    },
  },
  plugins: [],
}
