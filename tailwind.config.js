export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: { DEFAULT: '#FF6B6B', 50: '#FFF0F0', 100: '#FFE0E0', 200: '#FFBDBD', 300: '#FF9A9A', 400: '#FF7777', 500: '#FF6B6B', 600: '#E85555', 700: '#CC4040', 800: '#AA3030', 900: '#882020' },
        dark: { DEFAULT: '#1A1A2E', 50: '#E8E8ED', 100: '#C5C5D1', 200: '#9F9FB5', 300: '#797999', 400: '#5D5D7E', 500: '#414163', 600: '#3A3A58', 700: '#32324D', 800: '#2A2A42', 900: '#1A1A2E' },
        mint: { DEFAULT: '#4ECDC4', 50: '#EFFAFA', 100: '#D5F5F3', 200: '#B0EBE7', 300: '#8BE1DB', 400: '#6BD7CF', 500: '#4ECDC4', 600: '#3BB5AD', 700: '#2D9A93', 800: '#207F79', 900: '#14645F' },
        warm: { DEFAULT: '#FFE66D', 50: '#FFFBE8', 100: '#FFF7CC', 200: '#FFF0A0', 300: '#FFE974', 400: '#FFE34D', 500: '#FFE66D', 600: '#E6CC4D', 700: '#CCB233', 800: '#B39A1A', 900: '#998200' },
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Noto Sans SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
