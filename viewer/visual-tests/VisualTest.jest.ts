/*!
 * Copyright 2022 Cognite AS
 */

import * as glob from 'glob';
import path from 'path';
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

  test.each(glob.sync('**/*.VisualTest.ts').map(filePath => path.parse(filePath).name))('%p', async testName => {
    return runTest(testName);
  });

  afterAll(() => {
    return testPage.close();
  });

  async function runTest(name: string) {
    await testPage.evaluate(async (testName: string) => {
      return (window as any).render(testName) as Promise<void>;
    }, name);

    const canvas = await testPage.$('canvas');

    const image = await canvas!.screenshot();

    expect(image).toMatchImageSnapshot({
      failureThreshold: 0.005,
      failureThresholdType: 'percent',
      customSnapshotIdentifier: name,
      comparisonMethod: 'ssim'
    });
  }
});
