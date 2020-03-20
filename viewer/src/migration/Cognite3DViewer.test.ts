/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import { Cognite3DViewer } from './Cognite3DViewer';
import { CogniteClient } from '@cognite/sdk';
import { Cognite3DThreeRenderer } from './types';

describe('Cognite3DViewer', () => {
  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest' });
  const renderer: Cognite3DThreeRenderer = {
    domElement: document.createElement('canvas'),
    dispose: jest.fn(),
    setSize: jest.fn(),
    getSize: () => new THREE.Vector2(),
    render: jest.fn()
  };

  test('constructor throws error when unsupported options are set', () => {
    expect(() => new Cognite3DViewer({ sdk, enableCache: true })).toThrowError();
    expect(() => new Cognite3DViewer({ sdk, enableCache: false, logMetrics: true })).toThrowError();
    expect(() => new Cognite3DViewer({ sdk, enableCache: false, viewCube: 'topleft' })).toThrowError();
    expect(() => new Cognite3DViewer({ sdk, enableCache: false })).toThrowError();
  });

  test('dispose disposes WebGL resources', () => {
    const viewer = new Cognite3DViewer({ sdk, renderer });
    viewer.dispose();
    expect(renderer.dispose).toBeCalledTimes(1);
  });

  test('onCameraChange triggers when position and target is changed', () => {
    // Arrange
    const onCameraChange: (position: THREE.Vector3, target: THREE.Vector3) => void = jest.fn();
    const viewer = new Cognite3DViewer({ sdk, renderer });
    viewer.onCameraChange(onCameraChange);

    // Act
    viewer.setCameraTarget(new THREE.Vector3(123, 456, 789));
    viewer.setCameraPosition(new THREE.Vector3(1, 2, 3));

    // Assert
    expect(onCameraChange).toBeCalledTimes(2);
  });

  test('addModel with local model, throws', async () => {
    const viewer = new Cognite3DViewer({ sdk, renderer });
    expect(viewer.addModel({ localPath: '/some/model', modelId: 1, revisionId: 2 })).rejects.toThrowError();
  });

  test('fitCameraToBoundingBox with 0 duration, moves camera immediatly', () => {
    // Arrange
    const viewer = new Cognite3DViewer({ sdk, renderer });
    const bbox = new THREE.Box3(new THREE.Vector3(1, 1, 1), new THREE.Vector3(2, 2, 2));
    const bSphere = bbox.getBoundingSphere(new THREE.Sphere());
    bSphere.radius *= 3;

    // Act
    viewer.fitCameraToBoundingBox(bbox, 0);
    TWEEN.update();

    // Assert
    expect(viewer.getCameraTarget()).toEqual(bbox.getCenter(new THREE.Vector3()));
    expect(bSphere.containsPoint(viewer.getCameraPosition())).toBeTrue();
  });
});
