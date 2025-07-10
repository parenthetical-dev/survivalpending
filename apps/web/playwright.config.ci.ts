import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 1, // Reduced from 2
  workers: 4, // Increased from 1
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'], // Simple output for CI logs
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry', // Only trace on retries to save time
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000, // 10s timeout for actions
    navigationTimeout: 30000, // 30s timeout for navigation
  },

  // Faster CI-specific projects - only test on Chromium for PRs
  projects: process.env.FULL_BROWSER_MATRIX === 'true' ? [
    // Full matrix for main branch
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ] : [
    // Only Chromium for PRs - 5x faster
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Optimize web server startup
  webServer: {
    command: process.env.CI 
      ? 'npm start' // Build is already done in workflow
      : 'npm run dev',
    url: 'http://localhost:3000',
    timeout: process.env.CI ? 60 * 1000 : 120 * 1000, // 1 min for start (already built)
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      ...Object.fromEntries(
        Object.entries(process.env).filter(([_, v]) => v !== undefined)
      ) as { [key: string]: string },
    },
  },

  // Global timeout for the entire test run
  globalTimeout: 10 * 60 * 1000, // 10 minutes total
  
  // Individual test timeout
  timeout: 30 * 1000, // 30 seconds per test
});