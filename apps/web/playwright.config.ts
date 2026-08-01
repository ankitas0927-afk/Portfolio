import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    trace: "on-first-retry"
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ],
  webServer: {
    command: "corepack pnpm --filter @ankita-portfolio/web dev",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000
  }
});
