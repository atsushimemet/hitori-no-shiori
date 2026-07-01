import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        cream: "rgb(var(--color-cream) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        coffee: "rgb(var(--color-coffee) / <alpha-value>)",
        bark: "rgb(var(--color-bark) / <alpha-value>)",
        mist: "rgb(var(--color-mist) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        navy: "rgb(var(--color-navy) / <alpha-value>)",
        seal: "rgb(var(--color-seal) / <alpha-value>)",
        "seal-deep": "rgb(var(--color-seal-deep) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        label: "var(--tracking-label)",
      },
      borderRadius: {
        control: "var(--radius-control)",
        card: "var(--radius-card)",
      },
      boxShadow: {
        plate: "var(--shadow-plate)",
        lift: "var(--shadow-lift)",
        soft: "var(--shadow-plate)",
      },
    },
  },
  plugins: [],
};

export default config;
