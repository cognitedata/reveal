import { Page } from 'puppeteer';

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

export async function screenShotTest(page: Page, testCase: TestCase) {
  const url =
    `https://localhost:3000/testable` +
    (testCase === 'default' ? '' : `?test=${testCase}`);

  await page.goto(url, {
    waitUntil: ['domcontentloaded'],
  });

  await page.waitForSelector('#ready');

  const canvas = await page.$('canvas')
  const image = await canvas!.screenshot();
  expect(image).toMatchImageSnapshot({
    failureThreshold: 0.001, // 0.1% of all pixels may differ
    failureThresholdType: 'percent',
    customSnapshotIdentifier: testCase,
  });
}
