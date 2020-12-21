import { screenShotTest, TestCase } from './VisualTestUtils';

const retry = require('jest-retries');

const RETRIES = 3;

jest.retryTimes(RETRIES);

const test_presets = Object.values(TestCase);

describe('Reveal visual tests', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetBrowser()
  })

  test_presets.forEach(function (test) {
    retry(`matches the screenshot for ${test} preset`, RETRIES, async () => {
      const page = await browser.newPage();

      await screenShotTest(page, test);

      await page.close();
    });
  });
});
