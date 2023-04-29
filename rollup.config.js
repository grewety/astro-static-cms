import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";
import alias from "@rollup/plugin-alias";
import { fileURLToPath } from "node:url";
import copy from "rollup-plugin-copy";
import path from "node:path";
import { defineConfig } from "rollup";
import del from "rollup-plugin-delete";
import execute from "rollup-plugin-execute";
import { readFileSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
let packageJson = JSON.parse(readFileSync(path.resolve(__dirname, "./package.json"), {encoding: 'utf-8', flag: 'r'}));

export default defineConfig([
  {
    input: [path.resolve(__dirname, "src", "AstroStaticCMSPlugin", "index.ts")],
    output: {
      dir: path.resolve(__dirname, "dist", "AstroStaticCMSPlugin")
    },
    plugins: [
      external(),
      resolve(),
      typescript({
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
        compilerOptions: {
          rootDir: path.resolve(__dirname, "src", "AstroStaticCMSPlugin"),
          outDir: path.resolve(__dirname, "dist", "AstroStaticCMSPlugin"),
        },
      }),
      postcss(),
      alias({
        entries: [{ find: "~", replacement: path.resolve(__dirname, "src") }],
      }),
      del({
        targets: [path.resolve(__dirname, "dist", "AstroStaticCMSPlugin")],
      }),
    ],
    external: [
      ...Object.keys(packageJson.peerDependencies),
      ...Object.keys(packageJson.dependencies),
    ],
  },
  {
    input: [
      path.resolve(__dirname, "src", "StaticCMSEditorUIRoute", "index.ts"),
    ],
    output: {
      dir: path.resolve(__dirname, "dist", "StaticCMSEditorUIRoute"),
    },
    plugins: [
      external(),
      resolve(),
      typescript({
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
        compilerOptions: {
          rootDir: path.resolve(__dirname, "src", "StaticCMSEditorUIRoute"),
          outDir: path.resolve(__dirname, "dist", "StaticCMSEditorUIRoute"),
        },
      }),
      postcss(),
      alias({
        entries: [{ find: "~", replacement: path.resolve(__dirname, "src") }],
      }),
      copy({
        targets: [
          {
            src: path.resolve(
              __dirname,
              "src",
              "StaticCMSEditorUIRoute",
              "*.astro"
            ),
            dest: path.resolve(__dirname, "dist", "StaticCMSEditorUIRoute"),
          },
        ],
      }),
      del({
        targets: [path.resolve(__dirname, "dist", "StaticCMSEditorUIRoute")],
      }),
      // Required for import CMS from "@staticcms/core";
      commonjs(),
    ],
    external: [
      ...Object.keys(packageJson.peerDependencies),
      ...Object.keys(packageJson.dependencies),
    ],
  },
  {
    input: [
      path.resolve(__dirname, "src", "StaticCMSPreviewTemplate", "index.ts"),
    ],
    output: {
      dir: path.resolve(__dirname, "dist", "StaticCMSPreviewTemplate"),
    },
    plugins: [
      external(),
      // Required for @material-tailwind/react
      commonjs(),
      del({
        targets: [path.resolve(__dirname, "dist", "StaticCMSPreviewTemplate")],
      }),
      alias({
        entries: [{ find: "~", replacement: path.resolve(__dirname, "src") }],
      }),
      execute(
        "tailwind -o " +
          path.resolve(
            __dirname,
            "dist",
            "StaticCMSPreviewTemplate",
            "Default.css"
          )
      ),
      postcss({
        //                minimize: true,
        extract: path.resolve(
          __dirname,
          "dist",
          "StaticCMSPreviewTemplate",
          "PreviewTemplate.css"
        ),
      }),
      resolve(),
      typescript({
        tsconfig: path.resolve(__dirname, "tsconfig.json"),
        compilerOptions: {
          rootDir: path.resolve(__dirname, "src", "StaticCMSPreviewTemplate"),
          outDir: path.resolve(__dirname, "dist", "StaticCMSPreviewTemplate"),
        },
      }),
    ],
    external: [
      ...Object.keys(packageJson.peerDependencies),
      ...Object.keys(packageJson.dependencies),
    ],
  },
]);
