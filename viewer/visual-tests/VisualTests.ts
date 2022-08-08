/*!
 * Copyright 2022 Cognite AS
 */

// import assert from 'assert';
import { Page } from 'puppeteer';

// const environment = process?.env?.NODE_ENV ?? 'browser';

// assert(environment === 'test');

describe('Visual tests', () => {
  let testPage: Page;

  beforeAll(async () => {
    testPage = await browser.newPage();
    await testPage.goto('https://localhost:12345/', {
      waitUntil: ['domcontentloaded', 'load']
    });
  });

  // test.each(testFixtures!)('%p', async testName => {
  //   await runTest(testName);
  // });

  test('myTest', async () => {
    await runTest('SectorLoaderVisualTestFixture');
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
