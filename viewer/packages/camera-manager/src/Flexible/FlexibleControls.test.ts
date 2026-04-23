/*!
 * Copyright 2026 Cognite AS
 */
import { jest } from '@jest/globals';
import { PerspectiveCamera, Vector3 } from 'three';

import { FlexibleControls } from './FlexibleControls';
import { FlexibleControlsOptions } from './FlexibleControlsOptions';
import { FlexibleControlsTranslator } from './FlexibleControlsTranslator';

function makeMouseEvent(x: number, y: number): PointerEvent {
  return new PointerEvent('pointermove', { clientX: x, clientY: y, pointerType: 'mouse' });
}

describe(FlexibleControls.name, () => {
  let controls: FlexibleControls;

  beforeEach(() => {
    const domElement = document.createElement('div');
    const camera = new PerspectiveCamera(60, 800 / 600, 0.1, 10000);
    camera.position.set(0, 0, 5);
    camera.lookAt(new Vector3(0, 0, 0));
    controls = new FlexibleControls(camera, domElement, new FlexibleControlsOptions());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('onPointerDrag', () => {
    it('does not throw when onPointerUp fires while async pan pick is in flight', async () => {
      // Block initialize with a deferred promise — same pattern as PointCloudOctreePicker.test.ts
      let resolveInitialize!: () => void;
      jest.spyOn(FlexibleControlsTranslator.prototype, 'initialize').mockImplementation(async () => {
        await new Promise<void>(resolve => {
          resolveInitialize = resolve;
        });
        return false;
      });

      // Start drag (sets _mouseDragInfo); use distinct coords so deltaPosition is non-zero
      await controls.onPointerDown(makeMouseEvent(400, 300), true);

      // Begin pan drag (leftButton=false triggers the translator path)
      const dragPromise = controls.onPointerDrag(makeMouseEvent(410, 310), false);

      // Simulate pointer-up while initialize is still awaiting — clears _mouseDragInfo
      controls.onPointerUp(makeMouseEvent(410, 310), false);

      // Resolve initialize — without the guard added in FlexibleControls this would crash
      resolveInitialize();

      await expect(dragPromise).resolves.not.toThrow();
    });
  });
});
