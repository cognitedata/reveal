import { Page } from "puppeteer";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function getCIDiv() {
  let divs = await page.$$('div');
  let loadingDiv = null;
  for (let i = 0; i < divs.length; i++) {
    let div = divs[i];
    let text = await (await div.getProperty('innerText')).jsonValue();
    if (text === 'Not ready...') { // Y I K E S
      loadingDiv = div;
    }
  }

  if (loadingDiv == null) {
    fail("Could not find a loading div. Is your test running against the correct URL?");
  }
  return loadingDiv;
}

export async function gotoAndWaitForRender(url: string) {
  await page.goto(url);
  let loadingDiv = await getCIDiv();

  while (await loadingDiv.boundingBox() != null) {
    await delay(100);
  }

  // For good measure - haven't experienced any failures here
  // Visually you can tell that the loading text disappears before the rendered model is presented
  await delay(500);
}

export async function removeTestableText(page: Page) {
  await page.evaluate(() => {
    (document.querySelectorAll('h1, a') || []).forEach(el => el.remove());
  });
}

export async function screenShotTest(url: string) {
  await gotoAndWaitForRender(url);
  removeTestableText(page);

  const image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot();
}
