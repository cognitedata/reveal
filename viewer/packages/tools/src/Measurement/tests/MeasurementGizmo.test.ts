/*!
 * Copyright 2022 Cognite AS
 */
import { CogniteClient } from '@cognite/sdk';
import { Cognite3DViewer } from '@reveal/core';
import * as THREE from 'three';
import { createGlContext, mockClientAuthentication } from '../../../../../test-utilities';
import { MeasurementGizmo } from '../MeasurementGizmo';

describe(MeasurementGizmo.name, () => {
  let viewer: Cognite3DViewer;
  let canvasContainer: HTMLElement;
  let domSize: { height: number; width: number };

  let measurementGizmo: MeasurementGizmo;

  beforeEach(() => {
    const sdk = new CogniteClient({
      appId: 'cognite.reveal.unittest',
      project: 'dummy',
      getToken: async () => 'dummy'
    });
    mockClientAuthentication(sdk);
    const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
    const renderer = new THREE.WebGLRenderer({ context });
    renderer.render = jest.fn();

    domSize = { height: 480, width: 640 };
    canvasContainer = document.createElement('div');
    canvasContainer.style.width = `${domSize.width}px`;
    canvasContainer.style.height = `${domSize.height}px`;
    viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });

    measurementGizmo = new MeasurementGizmo(viewer);
  });

  test('Add gizmo', () => {
    const addSpyOn = jest.spyOn(measurementGizmo, 'add');
    measurementGizmo.add(new THREE.Vector3(1, 1, 1), 1);

    expect(addSpyOn).toBeCalled();
  });

  test('Remove the gizmo', () => {
    const removeGizmoSpyOn = jest.spyOn(measurementGizmo, 'remove');
    measurementGizmo.add(new THREE.Vector3(1, 1, 1), 1);
    measurementGizmo.remove();

    expect(removeGizmoSpyOn).toBeCalled();
    expect(viewer.models.length).toBe(0);
  });
});
