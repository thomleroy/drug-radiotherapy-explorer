/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'sfro': {
          'primary': '#00BFF3',    // Bleu principal SFRO
          'secondary': '#0080A5',  // Bleu secondaire
          'light': '#E6F8FE',     // Bleu très clair pour les backgrounds
          'dark': '#005670',      // Bleu foncé pour le texte
        }
      }
    },
  },
  plugins: [],
}