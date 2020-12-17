import { screenShotTest, TestCase } from './VisualTestUtils';
const retry = require('jest-retries');


// jest-circus must be installed for it to work
jest.retryTimes(3);

const test_presets = Object.values(TestCase);

describe('Reveal visual tests', () => {
  beforeEach(async () => {
    await jestPuppeteer.resetBrowser()
    await jestPuppeteer.resetPage()
  })

  const retries = 3;

  test_presets.forEach(function (test) {
    retry(`matches the screenshot for ${test} preset`, retries, async () => {
      await screenShotTest(test);
    });
  });
});
