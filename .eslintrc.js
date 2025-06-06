module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint", "prettier", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  env: { node: true, browser: true, es2021: true },
  ignorePatterns: ["dist", "node_modules", ".eslintrc.js", "lib"],
  rules: {
    "prettier/prettier": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-non-null-assertion": "error",
    "quotes": ["error", "double", { avoidEscape: true }],
    "semi": ["error", "always"],
    "comma-dangle": ["error", "always-multiline"],
    "object-curly-spacing": ["error", "always"],
    "arrow-body-style": ["error", "as-needed"],
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
    "sort-imports": ["error", { ignoreDeclarationSort: true }],
    "no-console": "warn",
    "no-debugger": "error",
    "curly": ["error", "all"],
    "eqeqeq": ["error", "always"],
    "no-var": "error",
    "prefer-const": "error",
  },
};
