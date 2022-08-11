/*!
 * Copyright 2022 Cognite AS
 */

import * as glob from 'glob';
import path, { ParsedPath } from 'path';
import { Page } from 'puppeteer';

describe('Visual tests', () => {
  let testPage: Page;

  beforeAll(async () => {
    testPage = await browser.newPage();

    testPage.setDefaultNavigationTimeout(80 * 1000);

    await testPage.goto('https://localhost:8080/', {
      waitUntil: ['domcontentloaded', 'load']
    });
  });

  test.each(glob.sync('**/*.VisualTest.ts').map(filePath => path.parse(filePath)))('%p', async testFilePath => {
    return runTest(testFilePath);
  });

  afterAll(() => {
    return testPage.close();
  });

  async function runTest(testFilePath: ParsedPath) {
    const name = testFilePath.name;
    await testPage.evaluate(async (testName: string) => {
      return (window as any).render(testName) as Promise<void>;
    }, name);

    const canvas = await testPage.$('canvas');

    const image = await canvas!.screenshot();

    expect(image).toMatchImageSnapshot({
      failureThreshold: 0.005,
      failureThresholdType: 'percent',
      customSnapshotIdentifier: name,
      comparisonMethod: 'ssim',
      customSnapshotsDir: path.resolve(testFilePath.dir, '__image_snapshots__'),
      customDiffDir: path.resolve(__dirname, '__diff_output__')
    });
  }
});
