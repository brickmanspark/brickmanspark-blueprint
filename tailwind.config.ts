import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        brick: "#D4382D",
        road: "#5E6872",
        baseplate: "#1F8F5F",
      },
      boxShadow: {
        panel: "0 18px 50px rgba(23, 32, 38, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
