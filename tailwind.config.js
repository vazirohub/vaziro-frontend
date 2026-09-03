/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003d7a',
          800: '#0a2540', // Vaziro deep corporate navy
          900: '#061727'
        },
        gold: {
          500: '#f59e0b',
          600: '#d97706'
        }
      }
    },
  },
  plugins: [],
};
