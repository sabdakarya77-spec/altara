import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F5F2EC",
        parchment: "#FAF8F2",
        ink: "#171717",
        muted: "#6F6B64",
        line: "#DCD5C4",
        forest: "#1E3A2B",
        moss: "#2C4A38",
        gold: "#A98F56",
        goldsoft: "#C9B88A",
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
