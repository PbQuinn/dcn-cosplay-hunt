/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#171B33",
          light: "#242A4D",
        },
        flare: {
          DEFAULT: "#ff35e4",
          dim: "#b51fc9",
        },
        parchment: {
          DEFAULT: "#F6F1E4",
          dark: "#E9E0C9",
        },
        sage: "#7C9885",
        gold: "#D4AF37",
        subtle: "#5e6cbb"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      backgroundImage: {
        grain: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"100\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"100%25\" height=\"100%25\" filter=\"url(%23n)\" opacity=\"0.05\"/></svg>')",
      },
    },
  },
  plugins: [],
};
