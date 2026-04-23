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
      let resolveInitialize!: () => void;
      jest.spyOn(FlexibleControlsTranslator.prototype, 'initialize').mockImplementation(async () => {
        await new Promise<void>(resolve => {
          resolveInitialize = resolve;
        });
        return false;
      });

      await controls.onPointerDown(makeMouseEvent(400, 300), true);

      const dragPromise = controls.onPointerDrag(makeMouseEvent(410, 310), false);

      controls.onPointerUp(makeMouseEvent(410, 310), false);

      resolveInitialize();

      await expect(dragPromise).resolves.not.toThrow();
    });
  });
});
