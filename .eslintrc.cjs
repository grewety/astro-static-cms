module.exports = {
    plugins: [
        "@typescript-eslint",
    ],
    overrides: [{
        files: ["*.astro"],
        parser: "astro-eslint-parser",
        parserOptions: {
            parser: "@typescript-eslint/parser",
            extraFileExtensions: [".astro"],
        },
        extends: [
            "plugin:@typescript-eslint/recommended",
            "plugin:astro/recommended",
        ],
        rules: {
            "no-mixed-spaces-and-tabs": ["error", "smart-tabs"],
        },
    }, {
        // Define the configuration for `<script>` tag.
        // Script in `<script>` is assigned a virtual file name with the `.js` extension.
        files: ["**/*.astro/*.js", "*.astro/*.js"],
        parser: "@typescript-eslint/parser",
    },{
        files: ["*.ts"],
        parser: "@typescript-eslint/parser",
    },{
        files: ["*.jsx", "*.tsx"],
        parser: "@typescript-eslint/parser",
        extends: [
            "plugin:react/jsx-runtime",
            "plugin:react/recommended",
            "plugin:@typescript-eslint/recommended",
        ],
        plugins: ["react", "@typescript-eslint"],
        settings: {
            react: {
                version: "detect", // React version. "detect" automatically picks the version you have installed.
            },
        },
    }
    ],
};
