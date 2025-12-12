/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', 'sans-serif'],
      },
      screens: {
        'sm': '640px',    // Større mobiler, små tablets
        'md': '768px',    // Tablets
        'lg': '1024px',   // Små laptops
        'xl': '1280px',   // MacBook 13" / standard laptops
        '2xl': '1536px',  // MacBook 14-16" / større laptops
        '3xl': '1920px',  // Desktop / full HD
        '4xl': '2560px',  // Stor desktop / 27" skærme
      },
    },
  },
  plugins: [],
}

