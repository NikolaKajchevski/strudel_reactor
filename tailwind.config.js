/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      // Custom colors used for the app.jsx background. 
      colors: {
        'slate-900': '#0f172a',
        'purple-900': '#581c87',
      },
      // Setting a default sans-serif font. Might not use all but will see
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
