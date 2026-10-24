/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ora: {
          // Palette officielle OraTama
          primary: '#1F2A5C', // Indigo primaire
          primaryDark: '#161E42',
          primaryLight: '#2D3B78',
          primarySoft: '#E8ECFA',
          voice: '#E9A23B', // Accent voix ocre (jamais en texte sur fond clair)
          voiceDark: '#C9821F',
          voiceSoft: '#FDF3E3',
          bg: '#FBF8F3', // Fond crème
          bgCard: '#FFFFFF',
          text: '#1B1B2A', // Texte principal
          textSecondary: '#6B6B7A', // Texte secondaire
          highlight: '#FCE9C4', // Surlignage de la phrase lue
          error: '#B3261E', // Erreur
          errorSoft: '#FDF0ED',
          border: '#E8E3DA',
          borderStrong: '#D0C9BD',
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
