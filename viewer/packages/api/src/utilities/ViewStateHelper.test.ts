/*!
 * Copyright 2022 Cognite AS
 */
import type { WebGLRenderer } from 'three';
import { Plane, Vector3 } from 'three';

import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';
import { ViewStateHelper } from './ViewStateHelper';

import { mockClientAuthentication, autoMockWebGLRenderer } from '../../../../test-utilities';

import { CogniteClient } from '@cognite/sdk';

import { vi } from 'vitest';
import { Mock } from 'moq.ts';

describe(ViewStateHelper.name, () => {
  let viewer: Cognite3DViewer;

  beforeEach(() => {
    const sdk = new CogniteClient({ appId: 'reveal.test', project: 'dummy', getToken: async () => 'dummy' });
    mockClientAuthentication(sdk);
    const renderer = autoMockWebGLRenderer(new Mock<WebGLRenderer>()).object();
    renderer.render = vi.fn();

    viewer = new Cognite3DViewer({ sdk, renderer, logMetrics: false });
  });

  test('setState() resets camera and clipping to initial state', () => {
    // Arrange
    const original = {
      cameraPosition: new Vector3(-1, -2, -3),
      cameraTarget: new Vector3(1, 2, 3),
      clippingPlanes: [new Plane().setComponents(1, 2, 3, 4), new Plane().setComponents(-1, -2, -3, -4)]
    };
    viewer.cameraManager.setCameraState({ position: original.cameraPosition, target: original.cameraTarget });
    viewer.setGlobalClippingPlanes(original.clippingPlanes);

    // Act
    const state = viewer.getViewState();
    viewer.cameraManager.setCameraState({
      position: new Vector3(-10, -10, -10),
      target: new Vector3(10, 10, 10)
    });
    viewer.setGlobalClippingPlanes([]);
    viewer.setViewState(state);

    // Assert
    const cameraState = viewer.cameraManager.getCameraState();
    expect(cameraState.position.distanceTo(original.cameraPosition)).toBeLessThan(1e-5);
    expect(cameraState.target.distanceTo(original.cameraTarget)).toBeLessThan(1e-5);
    expect(viewer.getGlobalClippingPlanes()).toEqual(original.clippingPlanes);
  });
});
