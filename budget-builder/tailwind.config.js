/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        gray: '#ddd',
        'light-gray': '#f4f4f4'
      }
    },
  },
  plugins: [],
}