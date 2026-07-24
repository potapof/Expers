import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    env: {
      JWT_SECRET: "test-secret-for-unit-tests",
      TBANK_TEST_MODE: "true",
    },
    globals: true,
    include: ["lib/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["lib/**/*.ts", "lib/**/*.tsx"],
      exclude: [
        "lib/__tests__/**",
        "lib/bridge/**",
        "lib/mock-data.ts",
        "lib/models.ts",
        "lib/schema.ts",
        "lib/db.ts",
        "lib/data.ts",
        "lib/article-view.ts",
        "lib/auth-context.tsx",
        "lib/use-*.ts",
        "lib/reader-data.ts",
        "lib/industry-slugs.ts",
        "lib/routes.ts",
        "lib/base-url.ts",
        "lib/utils.ts",
      ],
      thresholds: {
        branches: 40,
        functions: 40,
        lines: 45,
        statements: 45,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
