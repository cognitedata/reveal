/*!
 * Copyright 2024 Cognite AS
 */
import { defineConfig, devices } from '@playwright/test';

const PORT = 6006;

export default defineConfig({
  testDir: './tests/visual-tests',
  fullyParallel: true,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI !== undefined ? 2 : 0,
  workers: process.env.CI !== undefined ? '100%' : '50%',
  reporter: 'html',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  use: {
    trace: 'on-first-retry'
  },

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

  webServer: {
    command: process.env.CI === undefined ? `yarn run storybook` : `npx servor storybook-static index.html ${PORT}`,
    port: PORT,
    reuseExistingServer: process.env.CI === undefined
  }
});
