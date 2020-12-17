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

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function getCIDiv() {
  let divs = await page.$$('div');
  let loadingDiv = null;
  for (let i = 0; i < divs.length; i++) {
    let div = divs[i];
    let text = await (await div.getProperty('innerText')).jsonValue();
    if (text === 'Not ready...') {
      // Y I K E S
      loadingDiv = div;
    }
  }

  if (loadingDiv == null) {
    fail(
      'Could not find a loading div. Is your test running against the correct URL?'
    );
  }
  return loadingDiv;
}

export async function gotoAndWaitForRender(url: string) {
  await page.goto(url);
  let loadingDiv = await getCIDiv();

  while ((await loadingDiv.boundingBox()) != null) {
    await delay(100);
  }

  await delay(500);
}

export async function removeTestableText() {
  await page.evaluate(() => {
    (document.querySelectorAll('h1, a') || []).forEach((el) => el.remove());
  });
}

export async function screenShotTest(testCase: TestCase) {
  const url =
    `http://localhost:3000/testable` +
    (testCase === 'default' ? '' : `?test=${testCase}`);

  await gotoAndWaitForRender(url);
  await removeTestableText();

  const image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot({
    failureThreshold: 0.001, // 0.1% of all pixels may differ
    failureThresholdType: 'percent',
    customSnapshotIdentifier: testCase,
  });
}
