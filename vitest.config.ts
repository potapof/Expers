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
      exclude: ["lib/__tests__/**", "lib/bridge/**", "lib/mock-data.ts"],
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 65,
        statements: 65,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
