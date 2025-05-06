/*!
 * Copyright 2025 Cognite AS
 */
import { FlexibleCameraManager } from './FlexibleCameraManager';
import { Vector3, Quaternion, PerspectiveCamera } from 'three';
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

  beforeEach(() => {
    jest.clearAllMocks();
    mockDomElement = document.createElement('div');

    const mockCamera = new PerspectiveCamera();
    const mockControls = new FlexibleControlsMock(mockCamera, mockDomElement, new FlexibleControlsOptions());

    cameraManager = new FlexibleCameraManager(
      mockDomElement,
      mockRaycastCallback as any,
      mockCamera,
      undefined,
      true,
      mockControls
    );
  });
  describe('setCameraState', () => {
    const position = new Vector3(1, 2, 3);
    const rotation = new Quaternion(1, 1, 0, 1);
    const target = new Vector3(4, 5, 6);
    const defaultTarget = new Vector3(0, 0, 0);
    const defaultCameraPosition = new Vector3(0, 0, 0);

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

    it('should set the camera state with position only and using the controls target value', () => {
      cameraManager.setCameraState({ position });

      expect(cameraManager.controls.setPositionAndTarget).toHaveBeenCalledWith(position, defaultTarget);
    });

    it('should set the camera state with original camera position and controls target values when nothing is set', () => {
      cameraManager.setCameraState({});

      expect(cameraManager.controls.setPositionAndTarget).toHaveBeenCalledWith(defaultCameraPosition, defaultTarget);
    });
  });
});
