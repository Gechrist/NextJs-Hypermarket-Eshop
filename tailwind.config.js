module.exports = {
  mod: 'jit',
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class',
  important: true,
  theme: {
    extend: {
      fontFamily: {
        title: ['Lightsider', 'Arial'],
        body: ['IstokWeb', 'Arial'],
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active'],
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
