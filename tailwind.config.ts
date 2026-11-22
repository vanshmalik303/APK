import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090909",
        "background-secondary": "#111111",
        "sidebar-bg": "#0D0D0D",
        "card-bg": "#151515",
        "card-bg-hover": "#1A1A1A",
        brand: {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        border: "rgba(255, 255, 255, 0.08)",
        "border-light": "rgba(255, 255, 255, 0.14)",
        "border-brand": "rgba(249, 115, 22, 0.3)",
      },
      boxShadow: {
        "orange-glow": "0 0 25px -5px rgba(249, 115, 22, 0.35)",
        "orange-glow-sm": "0 0 15px -3px rgba(249, 115, 22, 0.25)",
        "orange-glow-lg": "0 0 45px -8px rgba(249, 115, 22, 0.45)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
