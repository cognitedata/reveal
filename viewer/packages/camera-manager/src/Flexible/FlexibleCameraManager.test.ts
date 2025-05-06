/*!
 * Copyright 2025 Cognite AS
 */
import { FlexibleCameraManager } from './FlexibleCameraManager';
import { Vector3, Quaternion } from 'three';
import { jest } from '@jest/globals';
import { FlexibleControls } from './FlexibleControls';
import { FlexibleControlsOptions } from './FlexibleControlsOptions';

describe(FlexibleCameraManager.name, () => {
  let cameraManager: FlexibleCameraManager;
  let mockDomElement: HTMLElement;
  const mockRaycastCallback = jest.fn();

  class FlexibleControlsMock extends FlexibleControls {
    setTarget = jest.fn();
    setPositionAndRotation = jest.fn();
    setPositionAndTarget = jest.fn();
  }

  const position = new Vector3(1, 2, 3);
  const rotation = new Quaternion(0, 0, 0, 1);
  const target = new Vector3(4, 5, 6);
  const defaultTarget = new Vector3(0, 0, 0);

  beforeEach(() => {
    jest.clearAllMocks();
    mockDomElement = document.createElement('div');

    const mockControls = new FlexibleControlsMock(undefined, mockDomElement, new FlexibleControlsOptions());

    cameraManager = new FlexibleCameraManager(
      mockDomElement,
      mockRaycastCallback as any,
      undefined,
      undefined,
      true,
      mockControls
    );
  });
  describe('setCameraState', () => {
    it('should set the camera state with position, rotation, and target', () => {
      cameraManager.setCameraState({ position, rotation, target });

      expect(cameraManager.controls.setTarget).toHaveBeenCalledWith(target);
      expect(cameraManager.controls.setPositionAndRotation).toHaveBeenCalledWith(position, rotation);
    });

    it('should set the camera state with position and target only', () => {
      cameraManager.setCameraState({ position, target });

      expect(cameraManager.controls.setPositionAndTarget).toHaveBeenCalledWith(position, target);
    });

    it('should set the camera state with position and rotation only', () => {
      cameraManager.setCameraState({ position, rotation });

      expect(cameraManager.controls.setPositionAndRotation).toHaveBeenCalledWith(position, rotation);
    });

    it('should set the camera state with position only', () => {
      cameraManager.setCameraState({ position });

      expect(cameraManager.controls.setPositionAndTarget).toHaveBeenCalledWith(position, defaultTarget);
    });
  });
});
