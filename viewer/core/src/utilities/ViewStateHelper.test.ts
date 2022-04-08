/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';
import { ViewStateHelper } from './ViewStateHelper';

import { createGlContext, mockClientAuthentication } from '../../../test-utilities';

import { CogniteClient } from '@cognite/sdk';

describe(ViewStateHelper.name, () => {
  let viewer: Cognite3DViewer;
  let helper: ViewStateHelper;

  beforeEach(() => {
    const sdk = new CogniteClient({ appId: 'reveal.test', project: 'dummy', getToken: async () => 'dummy' });
    mockClientAuthentication(sdk);
    const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
    const renderer = new THREE.WebGLRenderer({ context });
    renderer.render = jest.fn();

    viewer = new Cognite3DViewer({ sdk, renderer });
    helper = new ViewStateHelper(viewer, sdk);
  });

  test('setState() resets camera and clipping to initial state', () => {
    // Arrange
    const original = {
      cameraPosition: new THREE.Vector3(-1, -2, -3),
      cameraTarget: new THREE.Vector3(1, 2, 3),
      clippingPlanes: [new THREE.Plane().setComponents(1, 2, 3, 4), new THREE.Plane().setComponents(-1, -2, -3, -4)]
    };
    viewer.cameraManager.setCameraState({ position: original.cameraPosition, target: original.cameraTarget });
    viewer.setClippingPlanes(original.clippingPlanes);

    // Act
    const state = viewer.getViewState();
    viewer.cameraManager.setCameraState({
      position: new THREE.Vector3(-10, -10, -10),
      target: new THREE.Vector3(10, 10, 10)
    });
    viewer.setClippingPlanes([]);
    viewer.setViewState(state);

    // Assert
    const cameraState = viewer.cameraManager.getCameraState();
    expect(cameraState.position.distanceTo(original.cameraPosition)).toBeLessThan(1e-5);
    expect(cameraState.target.distanceTo(original.cameraTarget)).toBeLessThan(1e-5);
    expect(viewer.getClippingPlanes()).toEqual(original.clippingPlanes);
  });
});
