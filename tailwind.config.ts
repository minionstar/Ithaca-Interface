/** @type {import('tailwindcss').Config} */

const fontSize = {
  xxs: ["0.625rem", { lineHeight: "normal" }],
  xs: ["0.75rem", { lineHeight: "normal" }],
  sm: ["0.875rem", { lineHeight: "normal" }],
  md: ["1rem", { lineHeight: "normal" }],
  lg: ["1.125rem", { lineHeight: "normal" }],
  xl: ["1.5rem", { lineHeight: "normal" }],
};

const colors = {
  ithaca: {
    white: {
      60: "#9d9daa",
    },
    green: {
      30: "#5ee192",
    },
    red: {
      20: "#ff3f57",
    },
  },
  rgba: {
    "white-10": "rgba(255, 255, 255, 0.1)",
  },
};

export default {
  prefix: "tw-",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "695px",
      md: "1280px",
      desktop: "1435px",
    },
    extend: {
      fontSize,
      colors,
    },
  },
  plugins: [],
};
