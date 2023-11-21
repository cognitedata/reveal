/*!
 * Copyright 2023 Cognite AS
 */

import { MeasurementTool } from './MeasurementTool';
import { createGlContext, mockClientAuthentication } from '../../../../test-utilities';

import { Cognite3DViewer } from '@reveal/api';

import { CogniteClient } from '@cognite/sdk';
import { Vector3, WebGLRenderer } from 'three';

import { jest } from '@jest/globals';

const context = await createGlContext(64, 64, { preserveDrawingBuffer: true });

describe(MeasurementTool.name, () => {
  let viewer: Cognite3DViewer;

  beforeEach(() => {
    let renderer: THREE.WebGLRenderer;
    let canvasContainer: HTMLElement;

    const sdk = new CogniteClient({
      appId: 'cognite.reveal.unittest',
      project: 'dummy',
      getToken: async () => 'dummy'
    });
    mockClientAuthentication(sdk);
    const canvas = document.createElement('canvas');

    renderer = new WebGLRenderer({ context, canvas });
    renderer.render = jest.fn();

    canvasContainer = document.createElement('div');
    canvasContainer.style.width = '640px';
    canvasContainer.style.height = '480px';

    viewer = new Cognite3DViewer({ domElement: canvasContainer, sdk, renderer });
  });

  test('addMeasurement adds measurement', () => {
    const tool = new MeasurementTool(viewer);

    const p0 = new Vector3(0, 0, 0);
    const p1 = new Vector3(1, 1, 1);

    tool.addMeasurement(p0, p1);

    const measurements = tool.getAllMeasurements();

    expect(measurements).toHaveLength(1);
    expect(measurements[0].startPoint).toEqual(p0);
    expect(measurements[0].endPoint).toEqual(p1);
  });
});
