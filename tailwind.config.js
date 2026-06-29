/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        ink: "#0F0F0F",
        paper: "#FAFAF8",
        muted: "#6B6B6B",
        accent: "#2563EB",
        "accent-hover": "#1D4ED8",
        border: "#E4E4E0",
        card: "#F4F4F1",
      },
    },
  },
  plugins: [],
};
