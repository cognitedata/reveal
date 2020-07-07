import { screenShotTest } from "./VisualTestUtils";

const test_presets = [
    "clipping",
    "default_camera",
]

describe('Testable', () => {
    it('correctly renders primitives test scene', async () => {
        await screenShotTest('http://localhost:3000/testable');
    });

    test_presets.forEach(function (test) {
        it('matches the screenshot for test preset: ' + test, async () => {
            await screenShotTest('http://localhost:3000/testable?test=' + test);
        });
    });
});
