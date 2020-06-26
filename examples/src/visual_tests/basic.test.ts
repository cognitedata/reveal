import { MatchImageSnapshotOptions } from "jest-image-snapshot";
import { gotoAndWaitForRender } from "./VisualTestUtils";

const matchImageSnapshotOptions: MatchImageSnapshotOptions = { dumpDiffToConsole: true }

describe('Testable', () => {
    it('correctly renders primitives test scene', async () => {
        await gotoAndWaitForRender('http://localhost:3000/testable');

        // Remove text elements
        //await page.evaluate(() => {
        //    (document.querySelectorAll('h1, a') || []).forEach(el => el.remove());
        //});

        const image = await page.screenshot();
        expect(image).toMatchImageSnapshot(matchImageSnapshotOptions);
    });
});