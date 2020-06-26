import { MatchImageSnapshotOptions } from "jest-image-snapshot";
import { gotoAndWaitForRender } from "./VisualTestUtils";

const matchImageSnapshotOptions: MatchImageSnapshotOptions = { dumpDiffToConsole: true }

describe('Simple', () => {
    it('visually looks correct', async () => {
        await gotoAndWaitForRender('http://localhost:3000/testable');

        // Remove text elements
        await page.evaluate(() => {
            (document.querySelectorAll('h1, a') || []).forEach(el => el.remove());
        });

        const image = await page.screenshot();
        expect(image).toMatchImageSnapshot(matchImageSnapshotOptions);
    });
});