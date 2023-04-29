const defaultTheme = require("tailwindcss/defaultTheme");
const colors = require("tailwindcss/colors");
const withMT = require("@material-tailwind/html/utils/withMT");

// Custom Colors for Tailwind CSS
// https://www.npmjs.com/package/proto-tailwindcss-clrs
// https://clrs.cc/a11y/

module.exports = withMT({
  content: [
    "./src/StaticCMSPreviewTemplate/*.{astro,html,js,jsx,md,svelte,ts,tsx,vue}",
    "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "rgb(30 64 175)",
        secondary: "rgb(30 58 138)",
        accent: "rgb(109 40 217)",
      },
      fontFamily: {
        sans: ["InterVariable", ...defaultTheme.fontFamily.sans],
        serif: ["InterVariable", ...defaultTheme.fontFamily.serif],
        heading: ["InterVariable", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
  darkMode: "class",
});
