import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brandBg: "#e8e8e8",
        brandBgLight: "#f5f5f5",
        brandDark: "#1a1a1a",
        brandOrange: "#f05a28",
        brandOrangeHover: "#d94e20",
        brandBorder: "#d1d5db",
      },
      boxShadow: {
        'brand-glow': '0 0 0 2px rgba(240, 90, 40, 0.55), 0 0 14px 2px rgba(240, 90, 40, 0.18)',
      }
    },
  },
  plugins: [],
};
export default config;
