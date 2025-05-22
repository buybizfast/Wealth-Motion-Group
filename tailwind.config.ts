import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        mwg: {
          dark: "#1b3142", // main background
          card: "#22384a", // card background
          accent: "#f7b32b", // gold/yellow accent
          accent2: "#2bb3b3", // teal accent (optional)
          text: "#ffffff", // main text
          muted: "#bfc9d1", // muted/secondary text
          border: "#2a4256", // card border
          button: "#f7b32b", // button color
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
