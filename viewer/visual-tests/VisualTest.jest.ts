/*!
 * Copyright 2022 Cognite AS
 */

// import assert from 'assert';
import { Page } from 'puppeteer';

const testFixtures = ((process.env as any).TEST_FIXTURES as string).split(',');

describe('Visual tests', () => {
  let testPage: Page;

  beforeAll(async () => {
    testPage = await browser.newPage();
    await testPage.goto('https://localhost:8080/', {
      waitUntil: ['domcontentloaded', 'load']
    });
  });

  test.each(testFixtures)('%p', async testName => {
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
