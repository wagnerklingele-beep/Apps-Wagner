/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0faf5',
          100: '#dcf4e9',
          200: '#abe5c8',
          300: '#6dd4a5',
          400: '#29bc7e',
          500: '#00a368',
          600: '#006447', // rgb(0, 100, 71) — cor padrão
          700: '#004f38',
          800: '#003a28',
          900: '#002419',
        },
      },
    },
  },
  plugins: [],
}
