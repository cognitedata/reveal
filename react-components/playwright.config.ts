import { defineConfig, devices } from '@playwright/test';

const PORT = 6006;

export default defineConfig({
  testDir: './tests/visual-tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: process.env.CI !== undefined,
  /* Retry on CI only */
  retries: process.env.CI !== undefined ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI !== undefined ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        launchOptions: {
          args: ['--headless', '--no-sandbox', '--use-gl=swiftshader']
        }
      }
    }
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command:
      process.env.CI === undefined
        ? `yarn run storybook`
        : `npx servor storybook-static index.html ${PORT}`,
    port: PORT,
    reuseExistingServer: process.env.CI === undefined
  }
});
