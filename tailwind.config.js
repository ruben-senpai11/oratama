/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ora: {
          // Palette 1 : Terre & Indigo Sahel
          primary: '#1E2958', // Indigo profond sahélien
          primaryDark: '#141C3E',
          primaryLight: '#2C3A7A',
          primarySoft: '#E9EDF9',
          voice: '#E09228', // Ocre terre chaude
          voiceDark: '#C27B1A',
          voiceSoft: '#FDF4E7',
          bg: '#FBF8F3', // Fond crème sable chaud
          bgCard: '#FFFFFF',
          text: '#181826', // Noir d'encre doux
          textSecondary: '#656575', // Gris chaud
          highlight: '#FCE9C4', // Surlignage de la phrase lue
          error: '#B3261E', // Erreur
          errorSoft: '#FDF0ED',
          border: '#E6E0D6',
          borderStrong: '#CDC6B9',
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
