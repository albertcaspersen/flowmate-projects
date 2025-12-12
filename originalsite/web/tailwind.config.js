/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}"
  ],
  safelist: [
    // Background colors
    'bg-primary',
    'bg-white',
    'bg-black',
    'bg-secondary',
    'bg-light-gray',
    'bg-primary-green',
    'bg-dark-green',
    'bg-dark-green-80',
    'bg-current',
    'bg-transparent',
    // Text colors
    'text-primary',
    'text-secondary',
    'text-black',
    'text-white',
    'text-light-gray',
    'text-primary-green',
    'text-dark-green',
    'text-dark-green-80',
    'text-current',
    'text-transparent',
    // Opacity
    'opacity-0',
    'opacity-10',
    'opacity-20',
    'opacity-30',
    'opacity-40',
    'opacity-50'
  ],
  theme: {
    extend: {
      screens: {
        xs: "400px",
        sm: "640px",
        md: "960px",
        lg: "1280px",
        xl: "1520px",
      },
      container: {
        className: 'container',
        screens: {
          sm: "1480px",
        },
        padding: {
          DEFAULT: "1rem",
        },
        center: true
      },
      colors: {
        'primary': '#E7FFC9',
        'secondary': '#4C721D',
        'black': '#000000',
        'white': '#ffffff',
        'light-gray': '#F5F6F6',
        'primary-green': '#D3FEA5',
        'dark-green': '#050F00',
        'dark-green-80': '#050F00/80%',
        'current': 'currentColor',
        'transparent': 'transparent',
      },
      fontSize: {
        'xs': '0.625rem',    // 10px - overline
        'sm': '0.75rem',     // 12px - caption 1, button (small)
        'md': '0.875rem',    // 14px - subtitle 2, body 2, button (medium)
        'lg': '1rem',        // 16px - subtitle 1, body 1, button (large)
        'xl': '1.25rem',     // 20px - h6
        '2xl': '1.5rem',     // 24px - h5
        '3xl': '2.125rem',   // 34px - h4
        '4xl': '3rem',       // 48px - h3
        '5xl': '3.75rem',    // 60px - h2
        '6xl': '6rem',       // 96px - h1
        '7xl': '7.5rem',     // 120px - display
      },
      fontFamily: {
        'sans': ['DM Sans', 'sans-serif']
      },
      fontWeight: {
        extraBold: 800,
        bold: 700,
        medium: 500,
        normal: 400
      },
      padding: {
        '7.5': '1.875rem',
        '15': '3.75rem',
      },
      transitionProperty: {
        'transform-bg-color': 'transform, background-color',
      }
    }
  },
  plugins: [
      require('tailwindcss-animated'),
    function ({ addVariant }) {
      addVariant('child', '& > *');
    }
  ],
}
