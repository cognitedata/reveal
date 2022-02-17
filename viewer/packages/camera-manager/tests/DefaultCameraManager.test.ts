/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { DefaultCameraManager } from '../src/DefaultCameraManager';
import { InputHandler } from '@reveal/utilities';

describe('DefaultCameraManager', () => {
  const domElement = document.createElement('canvas');
  const mockRaycastFunction = async (x: number, y: number) => {
    return { intersection: null, modelsBoundingBox: new THREE.Box3() };
  };
  let cameraManager: DefaultCameraManager;

  beforeEach(() => {
    cameraManager = new DefaultCameraManager(
      domElement,
      new InputHandler(domElement),
      mockRaycastFunction,
      new THREE.PerspectiveCamera()
    );
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
});
