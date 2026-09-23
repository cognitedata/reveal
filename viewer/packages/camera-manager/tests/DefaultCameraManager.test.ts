/*!
 * Copyright 2022 Cognite AS
 */

import { Box3, PerspectiveCamera, Vector3 } from 'three';
import { DefaultCameraManager } from '../src/DefaultCameraManager';
import { InputHandler } from '@reveal/utilities';

import { vi } from 'vitest';

describe(DefaultCameraManager.name, () => {
  const domElement = document.createElement('canvas');
  const raycastSpy = vi.fn(async (_x: number, _y: number, _pickBoundingBox: boolean, _forceWindowedPick?: boolean) => {
    return { intersection: null, modelsBoundingBox: new Box3(), pickedBoundingBox: undefined };
  });
  let cameraManager: DefaultCameraManager;

  beforeEach(() => {
    raycastSpy.mockClear();
    cameraManager = new DefaultCameraManager(
      domElement,
      new InputHandler(domElement),
      raycastSpy,
      new PerspectiveCamera()
    );

    vi.useFakeTimers();
  });

  afterEach(() => {
    cameraManager.dispose();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('onCameraStop triggers within 200ms after camera finished moving', () => {
    const callback = vi.fn();
    cameraManager.on('cameraStop', callback);

    cameraManager.setCameraState({ position: new Vector3(1, 0, 0), target: new Vector3(0, 0, 0) });

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);

    expect(callback).toHaveBeenCalled();
  });

  test('setCameraControlsOptions changes internal state of camera controls options', () => {
    // Arrange
    const originalCameraControlsOptions = cameraManager.getCameraControlsOptions();

    // Act
    cameraManager.setCameraControlsOptions({
      changeCameraTargetOnClick: !originalCameraControlsOptions.changeCameraTargetOnClick,
      mouseWheelAction: 'zoomToTarget'
    });

    // Assert
    const newCameraControlsOptions = cameraManager.getCameraControlsOptions();

    expect(newCameraControlsOptions.changeCameraTargetOnClick).not.toEqual(
      originalCameraControlsOptions.changeCameraTargetOnClick
    );
    expect(newCameraControlsOptions.mouseWheelAction).toEqual('zoomToTarget');
  });

  test('wheel-driven zoom-to-cursor requests a pick with forceWindowedPick=true', async () => {
    cameraManager.setCameraControlsOptions({ mouseWheelAction: 'zoomToCursor' });

    const wheelEvent = new WheelEvent('wheel', { deltaY: -100, cancelable: true });
    Object.assign(wheelEvent, { clientX: 50, clientY: 50 });
    domElement.dispatchEvent(wheelEvent);

    await vi.waitFor(() => expect(raycastSpy).toHaveBeenCalled());

    expect(raycastSpy).toHaveBeenCalledWith(50, 50, false, true);
  });
});
