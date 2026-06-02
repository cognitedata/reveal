/*!
 * Copyright 2022 Cognite AS
 */

import { test, expect } from '@playwright/test';
import type { BrowserContext, Page } from '@playwright/test';
import { globSync } from 'glob';
import path from 'path';

const viewerRoot = path.resolve(__dirname, '..');

const testFiles = globSync('**/*.VisualTest.ts', {
  ignore: ['**/node_modules/**', '**/dist/**'],
  cwd: viewerRoot
}).map(filePath => path.parse(filePath));

let sharedContext: BrowserContext;
let sharedPage: Page;

test.beforeAll(async ({ browser }) => {
  sharedContext = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    baseURL: 'https://localhost:8080'
  });
  sharedPage = await sharedContext.newPage();
  await sharedPage.goto('/', { waitUntil: 'load' });
});

test.afterAll(async () => {
  await sharedContext.close();
});

for (const testFilePath of testFiles) {
  test(testFilePath.name, async () => {
    await sharedPage.evaluate(async (testName: string) => {
      await (window as any).render(testName);
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }, testFilePath.name);

    await sharedPage.locator('canvas[data-engine]').waitFor();

    const snapshotParts = [...testFilePath.dir.split(path.sep), '__image_snapshots__', testFilePath.name + '.png'];

    await expect(sharedPage).toHaveScreenshot(snapshotParts, {
      maxDiffPixelRatio: 0.005,
      timeout: 30000
    });
  });
}
