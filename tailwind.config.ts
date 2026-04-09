import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        rose: "rgb(var(--color-rose) / <alpha-value>)",
        peach: "rgb(var(--color-peach) / <alpha-value>)",
        sage: "rgb(var(--color-sage) / <alpha-value>)",
        coral: "rgb(var(--color-coral) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 18px 40px rgba(16, 24, 19, 0.08)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
