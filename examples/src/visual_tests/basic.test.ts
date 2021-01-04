import { cadTestBasePath, TestCase } from './testUtils';

const retry = require('jest-retries');

const RETRIES = parseInt(process.env.RETRIES!) || 3;

jest.retryTimes(RETRIES);

async function screenShotTest(testCase: TestCase) {
  const page = await browser.newPage();
  const url = `http://localhost:3000` + cadTestBasePath + testCase;

  await page.goto(url, {
    waitUntil: ['domcontentloaded'],
  });

  await page.waitForSelector('#ready');

  const canvas = await page.$('canvas');
  const image = await canvas!.screenshot();

  expect(image).toMatchImageSnapshot({
    failureThreshold: 0.001, // 0.1% of all pixels may differ
    failureThresholdType: 'percent',
    customSnapshotIdentifier: testCase,
  });

  await page.close();
}

describe('Reveal visual tests', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetBrowser();
  });

  Object.values(TestCase).forEach(function (test) {
    retry(`matches the screenshot for ${test} preset`, RETRIES, async () => {
      await screenShotTest(test);
    });
  });
});
