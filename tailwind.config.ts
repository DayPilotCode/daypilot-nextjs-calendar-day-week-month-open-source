import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "shift-primary": "#0f172a",
        "shift-surface": "#0b1222",
        "shift-border": "#1e293b",
        "shift-accent": "#38bdf8",
        "shift-warn": "#f97316",
      },
      boxShadow: {
        card: "0 10px 40px -18px rgba(15,23,42,0.45)",
      },
    },
  },
  plugins: [],
};

export default config;

