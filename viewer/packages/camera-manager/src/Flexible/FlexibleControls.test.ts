/*!
 * Copyright 2026 Cognite AS
 */
import { vi } from 'vitest';
import { PerspectiveCamera, Vector2, Vector3 } from 'three';

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
    vi.restoreAllMocks();
  });

  describe('onPointerDrag', () => {
    it('does not throw when onPointerUp fires while async pan pick is in flight', async () => {
      let resolveInitialize!: () => void;
      vi.spyOn(FlexibleControlsTranslator.prototype, 'initialize').mockImplementation(async () => {
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

  describe('onWheel', () => {
    it('requests a pick with forceWindowedPick=true', async () => {
      vi.spyOn(performance, 'now').mockReturnValue(10_000);
      const pickSpy = vi.fn(async () => new Vector3());
      controls.getPickedPointByPixelCoordinates = pickSpy;

      // happy-dom's WheelEvent doesn't extend MouseEvent, so clientX/clientY from the init dict
      // are dropped - set them directly instead.
      const wheelEvent = new WheelEvent('wheel', { deltaY: -100, cancelable: true });
      Object.assign(wheelEvent, { clientX: 50, clientY: 50 });

      await controls.onWheel(wheelEvent, -1);

      expect(pickSpy).toHaveBeenCalledWith(expect.any(Vector2), true);
    });
  });
});
