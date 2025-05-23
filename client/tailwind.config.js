/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
      },
      colors: {
        white1: "#F5F5FA",
        black1: "#1F1F29",
        gray1: "#6B7280",
        gray2: "#E5E7EB",
        textGray: "#374151",
        textBold: "#1F2937",
        gradient1: "#ff5500",
        gradient2: "#b88909",
        solidGreen: "#00BF13",
        solidRed: "#DA0000",
        darkBg: "#1c1e21",
      }
    },
  },
  plugins: [],
}