const path = require("node:path");

module.exports = {
  plugins: {
    autoprefixer: {},
    tailwindcss: { config: path.join(__dirname, "./tailwind.config.cjs") },
  },
};
