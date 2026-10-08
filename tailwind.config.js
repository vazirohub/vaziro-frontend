/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Geist', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '0.625rem',
      },
      colors: {
        vaziro: {
          paper: '#fcfbf8',
          ink: '#1e2824',
          muted: '#68716b',
          line: '#e7e8df',
          leaf: '#5e7b4c',
          deep: '#183e33',
          lime: '#c9f27d',
        },
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
