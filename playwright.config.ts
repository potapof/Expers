import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      threshold: 0.3,
    },
  },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:8080",
    ignoreHTTPSErrors: process.env.BASE_URL
      ? process.env.BASE_URL.startsWith("https")
      : false,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "api",
      use: { baseURL: process.env.BASE_URL ?? "http://localhost:8080" },
      testMatch: "**/api.spec.ts",
    },
  ],
  webServer: process.env.CI ? undefined : undefined, // No dev server — tests run against remote https://expers.ru
});
