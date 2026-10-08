/*!
 * Copyright 2025 Cognite AS
 */
import { FlexibleCameraManager } from './FlexibleCameraManager';
import { Box3, Vector3, Quaternion, PerspectiveCamera } from 'three';
import { vi } from 'vitest';
import type { CameraManagerCallbackData } from '../types';

describe(FlexibleCameraManager.name, () => {
  let cameraManager: FlexibleCameraManager;
  let mockDomElement: HTMLElement;
  const ARBITRARY_POSITION = new Vector3(1, 2, 3);
  const ARBITRARY_TARGET = new Vector3(4, 5, 6);
  const ARBITRARY_ROTATION = new Quaternion(1, 1, 0, 1);

  // This is the transformed version of ARBITRARY_ROTATION after calculations, which is used to set the camera state.
  const ARBITRARY_TRANSFORMED_ROTATION = new Quaternion(
    0.07259812080203774,
    0.9265705318055999,
    -0.2397753047300946,
    0.28054298367111397
  );

  const INITIAL_TARGET = new Vector3(0, 0, 0);
  const INITIAL_POSITION = new Vector3(0, 0, 0);

  beforeEach(() => {
    vi.clearAllMocks();
    mockDomElement = document.createElement('div');

    const mockCamera = new PerspectiveCamera();
    const mockRaycastCallback = vi.fn<() => Promise<CameraManagerCallbackData>>();

    cameraManager = new FlexibleCameraManager(mockDomElement, mockRaycastCallback, mockCamera, undefined, false);
  });
  describe('setCameraState', () => {
    it('should not throw when setting both rotation and target', () => {
      expect(() =>
        cameraManager.setCameraState({
          position: ARBITRARY_POSITION,
          rotation: ARBITRARY_ROTATION,
          target: ARBITRARY_TARGET
        })
      ).not.toThrow();
    });
    it('should set the camera state with position, rotation, and target', () => {
      cameraManager.setCameraState({
        position: ARBITRARY_POSITION,
        rotation: ARBITRARY_ROTATION,
        target: ARBITRARY_TARGET
      });

      const { position, rotation, target } = cameraManager.getCameraState();

      expect(position.equals(ARBITRARY_POSITION)).toBeTruthy();
      expect(rotation.equals(ARBITRARY_TRANSFORMED_ROTATION)).toBeTruthy();
      expect(target.equals(ARBITRARY_TARGET)).toBeTruthy();
    });

    it('should set the camera state with position and target only', () => {
      cameraManager.setCameraState({
        position: ARBITRARY_POSITION,
        target: ARBITRARY_TARGET
      });

      const { position, target } = cameraManager.getCameraState();

      expect(position.equals(ARBITRARY_POSITION)).toBeTruthy();
      expect(target.equals(ARBITRARY_TARGET)).toBeTruthy();
    });

    it('should set the camera state with position and rotation only', () => {
      cameraManager.setCameraState({
        position: ARBITRARY_POSITION,
        rotation: ARBITRARY_ROTATION
      });

      const { position, rotation } = cameraManager.getCameraState();

      expect(position.equals(ARBITRARY_POSITION)).toBeTruthy();
      expect(rotation.equals(ARBITRARY_TRANSFORMED_ROTATION)).toBeTruthy();
    });

    it('should set the camera state with position only', () => {
      cameraManager.setCameraState({
        position: ARBITRARY_POSITION
      });

      const { position } = cameraManager.getCameraState();

      expect(position.equals(ARBITRARY_POSITION)).toBeTruthy();
    });

    it('should set the camera state with original camera position and controls target values when nothing is set', () => {
      cameraManager.setCameraState({});

      const { position, target } = cameraManager.getCameraState();

      expect(position.equals(INITIAL_POSITION)).toBeTruthy();
      expect(target.equals(INITIAL_TARGET)).toBeTruthy();
    });
  });

  describe('getPickedPointByPixelCoordinates', () => {
    it('forwards forceWindowedPick=true to the raycast callback on wheel-driven zoom-to-cursor', async () => {
      vi.useFakeTimers();
      try {
        const domElement = document.createElement('div');
        const raycastSpy = vi.fn<() => Promise<CameraManagerCallbackData>>(async () => ({
          intersection: null,
          modelsBoundingBox: new Box3(),
          pickedBoundingBox: undefined
        }));
        const manager = new FlexibleCameraManager(domElement, raycastSpy, new PerspectiveCamera(), undefined, true);

        // Advance past the wheel-pick's own minimum/maximum-time-between-raycasts thresholds,
        // which are measured from _prevTime=0.
        vi.advanceTimersByTime(2000);

        const wheelEvent = new WheelEvent('wheel', { deltaY: -100, cancelable: true });
        Object.assign(wheelEvent, { clientX: 50, clientY: 50 });
        domElement.dispatchEvent(wheelEvent);

        await vi.waitFor(() => expect(raycastSpy).toHaveBeenCalled());

        expect(raycastSpy).toHaveBeenCalledWith(50, 50, false, true);

        manager.dispose();
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
