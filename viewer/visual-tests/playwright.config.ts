/*!
 * Copyright 2026 Cognite AS
 */

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/VisualTest.playwright.ts',
  fullyParallel: true,
  workers: process.env.CI ? '100%' : '50%',
  timeout: 80 * 1000,
  snapshotDir: '..',
  snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',
  outputDir: '__diff_output__',
  use: {
    baseURL: 'http://localhost:8080',
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    launchOptions: {
      args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--allow-insecure-localhost']
    }
  },
  webServer: {
    command: 'pnpm run test:visual:server',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    ignoreHTTPSErrors: true,
    timeout: 60 * 1000
  }
});
