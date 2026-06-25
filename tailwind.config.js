/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        surface: {
          50: "rgba(255,255,255,0.025)",
          100: "rgba(255,255,255,0.05)",
          200: "rgba(255,255,255,0.08)",
        }
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #3b82f6, #6366f1)",
      }
    },
  },
  plugins: [],
}
