import { cadTestBasePath, TestCase } from './testUtils';

const retry = require('jest-retries');

const RETRIES = parseInt(process.env.RETRIES!) || 3;

jest.retryTimes(RETRIES);

async function screenShotTest(testCase: TestCase) {
  const testPage = await browser.newPage();
  const url = `http://localhost:3000` + cadTestBasePath + testCase;

  await testPage.goto(url, {
    waitUntil: ['domcontentloaded'],
  });

  await testPage.waitForSelector('#ready');

  const canvas = await testPage.$('canvas');
  const image = await canvas!.screenshot();

  expect(image).toMatchImageSnapshot({
    failureThreshold: 0.001, // 0.1% of all pixels may differ
    failureThresholdType: 'percent',
    customSnapshotIdentifier: testCase,
  });

  await testPage.close();
}

console.log(`Run tests with ${RETRIES} retries`)

/*
 * To add a new test, start from adding a new entry to TestCase enum. TS errors will suggest missing parts.
 * Basically you just need to add a new test page to src/pages/e2e/cad or pointcloud folder
 */
describe('Reveal visual tests', () => {
  Object.values(TestCase).forEach(function (test) {
    retry(`matches the screenshot for ${test} preset`, RETRIES, async () => {
      await screenShotTest(test);
    });
  });
});
