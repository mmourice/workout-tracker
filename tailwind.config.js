export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#F16202",
        bgDark: "#000000",
        bgDark2: "#1E1729",
        textPrimary: "#FFFFFF",
        textSecondary: "#FF6600"
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"]
      },
      borderRadius: {
        button: "35px",
        card: "15px",
        pill: "5px"
      }
    },
  },
  plugins: [],
}
