import path from "node:path";
import typescript from "@rollup/plugin-typescript";
import alias from "@rollup/plugin-alias";
import dts from "rollup-plugin-dts";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
    {
        input: "./src/index.ts",
        output: {
            file: "./dist/sheet-manager.js",
            format: "iife",
            name: "SheetManager",
        },
        plugins: [
            alias({
                entries: [
                    {
                        find: "@core",
                        replacement: path.resolve(__dirname, "./src/core"),
                    },
                    {
                        find: "@errors",
                        replacement: path.resolve(__dirname, "./src/core/errors"),
                    },
                ],
            }),
            typescript({
                tsconfig: "./tsconfig.json",
            }),
        ],
    },

    {
        input: "./src/index.ts",
        output: {
            file: "./dist/global.d.ts",
            format: "es",
        },
        plugins: [
            alias({
                entries: [
                    {
                        find: "@core",
                        replacement: path.resolve(__dirname, "./src/core"),
                    },
                    {
                        find: "@errors",
                        replacement: path.resolve(__dirname, "./src/core/errors"),
                    },
                ],
            }),
            dts({
                compilerOptions: {
                    baseUrl: "./src",
                    paths: {
                        "@core/*": ["./src/core/*"],
                        "@errors/*": ["./src/core/errors/*"],
                    },
                },
            }),
        ],
    },
];
