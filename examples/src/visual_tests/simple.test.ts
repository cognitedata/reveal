import { MatchImageSnapshotOptions } from "jest-image-snapshot";

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const matchImageSnapshotOptions: MatchImageSnapshotOptions = { dumpDiffToConsole: true }

async function getLoadingDiv() {
    let divs = await page.$$('div');
    let loadingDiv = null;
    for (let i = 0; i < divs.length; i++) {
        let div = divs[i];
        let text = await (await div.getProperty('innerText')).jsonValue();
        if (text === 'Loading...') { // Y I K E S
            loadingDiv = div;
        }
    }

    if (loadingDiv == null) {
        fail("Could not find a loading div");
    }
    return loadingDiv;
}

async function waitForRender() {
    await page.goto('http://localhost:3000/simple');
    let loadingDiv = await getLoadingDiv();

    await delay(2000); // TODO
    while (await loadingDiv.boundingBox() != null) {
        await delay(100);
    }
}

describe('Simple', () => {
    it('visually looks correct', async () => {
        await waitForRender();

        const image = await page.screenshot();
        expect(image).toMatchImageSnapshot(matchImageSnapshotOptions);
    });
});