import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#040920", // Dark Blue
          light: "#0D2A4A", // Secondary Dark
        },
        accent: {
          DEFAULT: "#82b4d6", // Light Blue
          light: "#a0c8e4", // Lighter Blue
        },
        neutral: {
          DEFAULT: "#e7edf4", // Soft Background
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      borderRadius: {
        DEFAULT: "2px",
        sm: "2px",
        md: "4px",
        lg: "6px",
        xl: "8px",
        "2xl": "12px",
      },
    },
  },
  plugins: [],
} satisfies Config;
