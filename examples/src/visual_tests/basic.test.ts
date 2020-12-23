const retry = require('jest-retries');

const RETRIES = parseInt(process.env.RETRIES!) || 3;

jest.retryTimes(RETRIES);

export enum TestCase {
  default = 'default',
  clipping = 'clipping',
  default_camera = 'default_camera',
  highlight = 'highlight',
  rotate_cad_model = 'rotate_cad_model',
  node_transform = 'node_transform',
  ghost_mode = 'ghost_mode',
  scaled_model = 'scaled_model',
  user_render_target = 'user_render_target',
}

async function screenShotTest(testCase: TestCase) {
  const page = await browser.newPage();
  const url =
    `http://localhost:3000/testable` +
    (testCase === 'default' ? '' : `?test=${testCase}`);

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
