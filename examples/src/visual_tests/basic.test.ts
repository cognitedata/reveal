import { screenShotTest } from "./VisualTestUtils";

const test_presets = [
  "clipping",
  "default_camera",
  "highlight",
  "rotate_cad_model",
  "node_transform",
  "ghost_mode",
  "scaled_model",
  "user_render_target"
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
