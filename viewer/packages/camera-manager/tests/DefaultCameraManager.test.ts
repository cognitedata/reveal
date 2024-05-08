/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { DefaultCameraManager } from '../src/DefaultCameraManager';
import { InputHandler } from '@reveal/utilities';

import { jest } from '@jest/globals';

describe(DefaultCameraManager.name, () => {
  const domElement = document.createElement('canvas');
  const mockRaycastFunction = async (_1: number, _2: number, _: boolean) => {
    return { intersection: null, modelsBoundingBox: new THREE.Box3(), pickedBoundingBox: undefined };
  };
  let cameraManager: DefaultCameraManager;

  beforeEach(() => {
    cameraManager = new DefaultCameraManager(
      domElement,
      new InputHandler(domElement),
      mockRaycastFunction,
      new THREE.PerspectiveCamera()
    );

    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('onCameraStop triggers within 200ms after camera finished moving', () => {
    const callback = jest.fn();
    cameraManager.on('cameraStop', callback);

    cameraManager.setCameraState({ position: new THREE.Vector3(1, 0, 0), target: new THREE.Vector3(0, 0, 0) });

    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);

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
});
