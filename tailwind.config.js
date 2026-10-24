/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ora: {
          wine: '#933B40',
          wineDark: '#752A2E',
          wineLight: '#A8454B',
          wineSoft: '#F6EAEB',
          cream: '#FAF6F1',
          creamDark: '#EFE8DE',
          creamCard: '#FFFFFF',
          ink: '#1F1A1A',
          inkMuted: '#5C5454',
          inkLight: '#8C8282',
          border: '#E5DCD3',
          borderStrong: '#CBBFBA',
          accentGold: '#D97706',
          accentGreen: '#15803D',
          greenBg: '#DCFCE7',
          tagBg: '#F3ECE3',
        },
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      minHeight: {
        touch: '44px',
      },
      minWidth: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};
