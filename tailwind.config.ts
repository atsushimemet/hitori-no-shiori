import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        coffee: "rgb(var(--color-coffee) / <alpha-value>)",
        bark: "rgb(var(--color-bark) / <alpha-value>)",
        mist: "rgb(var(--color-mist) / <alpha-value>)",
        navy: "rgb(var(--color-navy) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      boxShadow: {
        soft: "0 24px 80px rgb(61 47 37 / 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
