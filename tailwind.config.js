module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  important: true,
  theme: {
    extend: {
      fontFamily: {
        title: ['Lightsider', 'Arial'],
        body: ['IstokWeb', 'Arial'],
      },
    },
  },
  plugins: [require('tailwind-scrollbar-hide')],
};
