/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        esf: {
          red: '#CD3023',
          'red-hover': '#B02A1E',
          bg: '#F2F2F2',
        }
      }
    },
  },
  plugins: [],
}
