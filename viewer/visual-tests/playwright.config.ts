/*!
 * Copyright 2026 Cognite AS
 */

import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: '.',
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
  projects: [
    { name: 'visual', testMatch: '**/VisualTest.playwright.ts' },
    { name: 'perf', testMatch: '**/PerfTest.playwright.ts' }
  ],
  webServer: {
    command: 'pnpm run test:visual:server',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    ignoreHTTPSErrors: true,
    timeout: 60 * 1000,
    cwd: path.resolve(__dirname, '..')
  }
});
