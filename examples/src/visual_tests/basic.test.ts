import {
  cadTestBasePath,
  pointcloudTestBasePath,
  TestCaseCad,
  TestCasePointCloud,
} from './testUtils';

const retry = require('jest-retries');

const RETRIES = parseInt(process.env.RETRIES!) || 3;

jest.retryTimes(RETRIES);

async function screenShotTest(url: string, snapshotName: string, blur = 0) {
  const testPage = await browser.newPage();

  await testPage.goto(url, {
    waitUntil: ['domcontentloaded'],
  });

  await testPage.waitForSelector('#ready');

  const canvas = await testPage.$('canvas');
  const image = await canvas!.screenshot();

  expect(image).toMatchImageSnapshot({
    failureThreshold: 0.005,
    failureThresholdType: 'percent',
    customSnapshotIdentifier: snapshotName,
    comparisonMethod: 'ssim',
    blur: blur
  });

  await testPage.close();
}

console.log(`Run tests with ${RETRIES} retries`);

/*
 * To add a new test, start from adding a new entry to TestCaseCad or TestCasePointCloud enum. TS errors will suggest missing parts.
 * Basically, you just need to add a new test page to src/pages/e2e
 * and create a new record in src/routes to map a component to its route
 */
describe('Reveal visual tests', () => {
  Object.values(TestCaseCad).forEach(function (test) {
    const snapshotName = 'cad_' + test;
    const url = `http://localhost:3000` + cadTestBasePath + test;
    
    const blur = (test === 'ssao') ? 2 : 0;

    retry(`matches the screenshot for ${snapshotName}`, RETRIES, async () => {
      await screenShotTest(url, snapshotName, blur);
    });
  });

  Object.values(TestCasePointCloud).forEach(function (test) {
    const snapshotName = 'pc_' + test;
    const url = `http://localhost:3000` + pointcloudTestBasePath + test;

    retry(`matches the screenshot for ${snapshotName}`, RETRIES, async () => {
      await screenShotTest(url, snapshotName);
    });
  });
});
