import { screenShotTest, TestCase } from './VisualTestUtils';
import { Page } from 'puppeteer';

const retry = require('jest-retries');

const RETRIES = 3;

jest.retryTimes(RETRIES);

const test_presets = Object.values(TestCase);

function setupConsoleListeners(page: Page) {
  // commented out because of threejs deprecation nonsense that came outside of our codebase
  // page.on('console', (msg) => {
  //   for (let i = 0; i < msg.args().length; i++) {
  //     console.log(`${i}: ${msg.args()[i]}`);
  //   }
  // });

  page.on('pageerror', function (err) {
    console.log('Page error: ' + err.toString());
  });

  page.on('error', function (err) {
    console.log('Error: ' + err.toString());
  });
}

describe('Reveal visual tests', () => {
  test_presets.forEach(function (test) {
    retry(`matches the screenshot for ${test} preset`, RETRIES, async () => {
      const page = await browser.newPage();

      setupConsoleListeners(page);

      await screenShotTest(page, test);

      await page.close();
    });
  });
});
