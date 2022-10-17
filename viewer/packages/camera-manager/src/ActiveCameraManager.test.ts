/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { It, Mock } from 'moq.ts';
import { ActiveCameraManager } from './ActiveCameraManager';
import { CameraManager } from './CameraManager';
import { CameraChangeDelegate } from './types';

describe(ActiveCameraManager.name, () => {
  test('Switching camera manager should also switch event handling', () => {
    const cameraOneEventHandlers = new Set<CameraChangeDelegate>();
    const cameraOnePositionResult = new THREE.Vector3().random();
    const cameraOneTargetResult = new THREE.Vector3().random();
    const cameraManagerOne = new Mock<CameraManager>()
      .setup(p => p.on('cameraChange', It.IsAny()))
      .callback(({ args: [_, eventHandler] }) => {
        cameraOneEventHandlers.add(eventHandler);
      })
      .setup(p => p.setCameraState(It.IsAny()))
      .callback(() => {
        cameraOneEventHandlers.forEach(eventHandler => eventHandler(cameraOnePositionResult, cameraOneTargetResult));
      })
      .setup(p => p.off('cameraChange', It.IsAny()))
      .callback(({ args: [_, eventHandler] }) => {
        cameraOneEventHandlers.delete(eventHandler);
      })
      .setup(p => p.getCamera())
      .returns({ aspect: 70 } as THREE.PerspectiveCamera)
      .object();

    const cameraTwoPositionResult = new THREE.Vector3().random();
    const cameraTwoTargetResult = new THREE.Vector3().random();
    let cameraTwoEventHandler: CameraChangeDelegate;
    const cameraManagerTwo = new Mock<CameraManager>()
      .setup(p => p.on('cameraChange', It.IsAny()))
      .callback(({ args: [_, eventHandler] }) => {
        cameraTwoEventHandler = eventHandler;
      })
      .setup(p => p.setCameraState(It.IsAny()))
      .callback(() => {
        cameraTwoEventHandler(cameraTwoPositionResult, cameraTwoTargetResult);
      })
      .setup(p => p.getCamera())
      .returns({ aspect: 70 } as THREE.PerspectiveCamera)
      .object();

    const activeCameraManager = new ActiveCameraManager(cameraManagerOne);

    const cameraChangedResults: [THREE.Vector3, THREE.Vector3][] = [];
    activeCameraManager.on('cameraChange', (position, target) => {
      cameraChangedResults.push([position, target]);
    });

    cameraManagerOne.setCameraState({});

    expect(cameraChangedResults.length).toBe(1);
    expect(cameraChangedResults[0][0]).toBe(cameraOnePositionResult);
    expect(cameraChangedResults[0][1]).toBe(cameraOneTargetResult);

    activeCameraManager.setActiveCameraManager(cameraManagerTwo, false);

    cameraManagerOne.setCameraState({});

    expect(cameraChangedResults.length).toBe(1);

    cameraManagerTwo.setCameraState({});

    cameraManagerOne.setCameraState({});

    expect(cameraChangedResults.length).toBe(2);
    expect(cameraChangedResults[1][0]).toBe(cameraTwoPositionResult);
    expect(cameraChangedResults[1][1]).toBe(cameraTwoTargetResult);
  });
});
