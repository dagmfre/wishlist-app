import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable problematic TypeScript rules
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",

      // Disable React rules
      "react-hooks/exhaustive-deps": "off",
      "react/no-unescaped-entities": "off",

      // Disable Next.js rules
      "@next/next/no-img-element": "off",

      // Disable other rules that might cause build failures
      "prefer-const": "off",
      "no-unused-vars": "off",
    },
  },
  {
    // Ignore certain files if needed
    ignores: ["node_modules/**", ".next/**", "dist/**", "build/**"],
  },
];

export default eslintConfig;
